import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

// Security: Demo auth is only enabled in development or when explicitly allowed
const DEMO_AUTH_ENABLED = process.env.NODE_ENV === "development" ||
  process.env.ENABLE_DEMO_AUTH === "true"

// Demo users for development without database
// WARNING: These are for development/testing ONLY
// In production, ENABLE_DEMO_AUTH should NOT be set to "true"
const DEMO_USERS = DEMO_AUTH_ENABLED ? [
  {
    id: "demo-super-admin",
    email: "admin@platform.com",
    // Hashed version of "admin123" - in real production, users must be in DB
    passwordHash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.OQVvjLjKTTJqHi",
    name: "Platform Admin",
    role: "SUPER_ADMIN" as UserRole,
    tenantId: null,
    tenantSlug: null,
    isActive: true,
  },
  {
    id: "demo-tenant-admin",
    email: "demo@kafe.com",
    // Hashed version of "demo123"
    passwordHash: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    name: "Demo Kafe Admin",
    role: "TENANT_ADMIN" as UserRole,
    tenantId: "demo-tenant-1",
    tenantSlug: "demo-kafe",
    isActive: true,
  },
] : []

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      tenantId: string | null
      tenantSlug: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    tenantId: string | null
    tenantSlug?: string | null
  }
}

// JWT type extension is handled in the callbacks

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gerekli")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Try database first
        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              tenant: {
                select: { slug: true },
              },
            },
          })

          if (user) {
            if (!user.isActive) {
              throw new Error("Hesabınız devre dışı")
            }

            const isValidPassword = await bcrypt.compare(password, user.passwordHash)

            if (!isValidPassword) {
              throw new Error("Geçersiz şifre")
            }

            // Update last login
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              tenantId: user.tenantId,
              tenantSlug: user.tenant?.slug || null,
            }
          }
        } catch {
          // Database not available, try demo users
        }

        // Fallback to demo users (only if enabled)
        if (!DEMO_AUTH_ENABLED) {
          throw new Error("Kullanıcı bulunamadı")
        }

        const demoUser = DEMO_USERS.find(u => u.email === email)

        if (!demoUser) {
          throw new Error("Kullanıcı bulunamadı")
        }

        if (!demoUser.isActive) {
          throw new Error("Hesabınız devre dışı")
        }

        // Check password for demo users using bcrypt (secure comparison)
        const isValidDemoPassword = await bcrypt.compare(password, demoUser.passwordHash)

        if (!isValidDemoPassword) {
          throw new Error("Geçersiz şifre")
        }

        // Only log in development
        if (process.env.NODE_ENV === "development") {
          console.log(`Demo user logged in: ${email}`)
        }

        return {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          tenantId: demoUser.tenantId,
          tenantSlug: demoUser.tenantSlug,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
        token.tenantSlug = user.tenantSlug || null
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.tenantId = token.tenantId as string | null
        session.user.tenantSlug = token.tenantSlug as string | null
      }
      return session
    },
  },
})

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

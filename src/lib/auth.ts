import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

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

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: UserRole
    tenantId: string | null
    tenantSlug: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
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

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            tenant: {
              select: { slug: true },
            },
          },
        })

        if (!user) {
          throw new Error("Kullanıcı bulunamadı")
        }

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

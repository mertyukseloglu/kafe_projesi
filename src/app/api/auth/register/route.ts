import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/email"
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
  sanitizeString,
  validateEmail,
} from "@/lib/api-utils"
import type { ApiResponse } from "@/types"

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı").max(100),
  email: z.string().email("Geçerli bir email adresi girin").max(254),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı").max(128),
  restaurantName: z.string().min(2, "Restoran adı en az 2 karakter olmalı").max(100),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 kayıt/saat per IP (brute force koruması)
    const rateLimit = checkRateLimit(request, RATE_LIMITS.registration)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetIn)
    }

    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validationResult.error.issues[0]?.message || "Geçersiz veri",
      }, { status: 400 })
    }

    const { name, email, password, restaurantName } = validationResult.data

    // Extra validation: Verify email format
    const validatedEmail = validateEmail(email)
    if (!validatedEmail) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "Geçersiz email adresi formatı",
      }, { status: 400 })
    }

    // Sanitize user inputs
    const safeName = sanitizeString(name)
    const safeRestaurantName = sanitizeString(restaurantName)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedEmail },
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "Bu email adresi zaten kayıtlı",
      }, { status: 400 })
    }

    // Generate unique slug from sanitized restaurant name
    let slug = generateSlug(safeRestaurantName)
    let slugExists = await prisma.tenant.findUnique({ where: { slug } })
    let counter = 1
    while (slugExists) {
      slug = `${generateSlug(safeRestaurantName)}-${counter}`
      slugExists = await prisma.tenant.findUnique({ where: { slug } })
      counter++
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Get default starter plan
    let starterPlan = await prisma.subscriptionPlan.findFirst({
      where: { slug: "starter" },
    })

    // Create starter plan if it doesn't exist
    if (!starterPlan) {
      starterPlan = await prisma.subscriptionPlan.create({
        data: {
          name: "Starter",
          slug: "starter",
          description: "Küçük işletmeler için ideal başlangıç paketi",
          price: 0,
          yearlyPrice: 0,
          maxOrders: 100,
          maxTables: 10,
          maxAiRequests: 50,
          maxStaff: 2,
          features: ["basic_menu", "qr_codes", "basic_analytics"],
        },
      })
    }

    // Create tenant, user, and subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant with sanitized values
      const tenant = await tx.tenant.create({
        data: {
          name: safeRestaurantName,
          slug,
          email: validatedEmail,
          settings: {
            currency: "TRY",
            language: "tr",
          },
        },
      })

      // Create user as TENANT_ADMIN
      const user = await tx.user.create({
        data: {
          email: validatedEmail,
          passwordHash,
          name: safeName,
          role: "TENANT_ADMIN",
          tenantId: tenant.id,
        },
      })

      // Create subscription with 14-day trial
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)

      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: starterPlan!.id,
          status: "TRIAL",
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndsAt,
          trialEndsAt,
        },
      })

      return { tenant, user, subscription }
    })

    // Send welcome email (async, don't wait)
    sendWelcomeEmail({
      name: safeName,
      email: validatedEmail,
      restaurantName: safeRestaurantName,
      loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`,
    }).catch((err) => console.error("Welcome email error:", err))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
        },
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      },
    }, { status: 201 })

  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Kayıt işlemi başarısız. Lütfen tekrar deneyin.",
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import type { ApiResponse } from "@/types"

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  restaurantName: z.string().min(2, "Restoran adı en az 2 karakter olmalı"),
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "Bu email adresi zaten kayıtlı",
      }, { status: 400 })
    }

    // Generate unique slug
    let slug = generateSlug(restaurantName)
    let slugExists = await prisma.tenant.findUnique({ where: { slug } })
    let counter = 1
    while (slugExists) {
      slug = `${generateSlug(restaurantName)}-${counter}`
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
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: restaurantName,
          slug,
          email,
          settings: {
            currency: "TRY",
            language: "tr",
          },
        },
      })

      // Create user as TENANT_ADMIN
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
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

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

// GET - Get tenant settings
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!

    const [tenant, staff, subscription] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
      }),
      prisma.user.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.subscription.findUnique({
        where: { tenantId },
        include: {
          plan: {
            select: {
              name: true,
              maxOrders: true,
              maxTables: true,
              maxAiRequests: true,
              maxStaff: true,
              features: true,
            },
          },
        },
      }),
    ])

    if (!tenant) {
      return errorResponse("Restoran bulunamadı", 404)
    }

    return successResponse({
      restaurant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        description: tenant.description,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address,
        city: tenant.city,
        district: tenant.district,
        logo: tenant.logo,
        coverImage: tenant.coverImage,
        settings: tenant.settings,
        isActive: tenant.isActive,
      },
      staff: staff.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      })),
      subscription: subscription
        ? {
            plan: subscription.plan.name,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            trialEndsAt: subscription.trialEndsAt,
            limits: {
              maxOrders: subscription.plan.maxOrders,
              maxTables: subscription.plan.maxTables,
              maxAiRequests: subscription.plan.maxAiRequests,
              maxStaff: subscription.plan.maxStaff,
            },
            usage: {
              ordersUsed: subscription.ordersUsed,
              aiRequestsUsed: subscription.aiRequestsUsed,
            },
            features: subscription.plan.features,
          }
        : null,
    })
  } catch (error) {
    console.error("Settings GET error:", error)
    return errorResponse("Ayarlar alınırken bir hata oluştu", 500)
  }
}

// PATCH - Update tenant settings
const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  logo: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  settings: z.record(z.string(), z.any()).optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    // Only TENANT_ADMIN can update settings
    if (session.user.role !== "TENANT_ADMIN") {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const body = await request.json()

    const validationResult = updateSettingsSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const updateData = validationResult.data

    // If updating settings, merge with existing
    if (updateData.settings) {
      const currentTenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      })

      updateData.settings = {
        ...(currentTenant?.settings as Record<string, unknown> || {}),
        ...updateData.settings,
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    })

    return successResponse({
      id: updatedTenant.id,
      name: updatedTenant.name,
      updatedAt: updatedTenant.updatedAt,
    })
  } catch (error) {
    console.error("Settings PATCH error:", error)
    return errorResponse("Ayarlar güncellenirken bir hata oluştu", 500)
  }
}

// POST - Add staff member
const addStaffSchema = z.object({
  name: z.string().min(1, "İsim gerekli"),
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  role: z.enum(["MANAGER", "STAFF"]),
})

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    // Only TENANT_ADMIN can add staff
    if (session.user.role !== "TENANT_ADMIN") {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const body = await request.json()

    const validationResult = addStaffSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const data = validationResult.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return errorResponse("Bu e-posta adresi zaten kullanılıyor", 400)
    }

    // Check staff limit
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: { select: { maxStaff: true } } },
    })

    if (subscription && subscription.plan.maxStaff !== -1) {
      const currentStaffCount = await prisma.user.count({
        where: { tenantId },
      })

      if (currentStaffCount >= subscription.plan.maxStaff) {
        return errorResponse(
          `Personel limitine ulaştınız (${subscription.plan.maxStaff}). Planınızı yükseltin.`,
          400
        )
      }
    }

    const passwordHash = await hashPassword(data.password)

    const newUser = await prisma.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      },
    })

    return successResponse({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }, 201)
  } catch (error) {
    console.error("Settings POST (add staff) error:", error)
    return errorResponse("Personel eklenirken bir hata oluştu", 500)
  }
}

// DELETE - Remove staff member
export async function DELETE(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    // Only TENANT_ADMIN can remove staff
    if (session.user.role !== "TENANT_ADMIN") {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return errorResponse("Kullanıcı ID gerekli", 400)
    }

    // Can't delete yourself
    if (userId === session.user.id) {
      return errorResponse("Kendinizi silemezsiniz", 400)
    }

    // Verify user belongs to tenant and is not TENANT_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    })

    if (!user) {
      return errorResponse("Kullanıcı bulunamadı", 404)
    }

    if (user.role === "TENANT_ADMIN") {
      return errorResponse("Yönetici hesabı silinemez", 400)
    }

    await prisma.user.delete({ where: { id: userId } })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error("Settings DELETE error:", error)
    return errorResponse("Personel silinirken bir hata oluştu", 500)
  }
}

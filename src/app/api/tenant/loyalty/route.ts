import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
  TENANT_ALL_ROLES,
} from "@/lib/api-utils"

// GET - Loyalty config ve ödülleri getir
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_ALL_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!

    const [config, rewards, stats] = await Promise.all([
      prisma.loyaltyConfig.findUnique({
        where: { tenantId },
      }),
      prisma.loyaltyReward.findMany({
        where: { tenantId },
        orderBy: { pointsCost: "asc" },
      }),
      prisma.customer.aggregate({
        where: { tenantId },
        _sum: { loyaltyPoints: true },
        _count: true,
        _avg: { loyaltyPoints: true },
      }),
    ])

    // Tier dağılımı
    const tierDistribution = await prisma.customer.groupBy({
      by: ["loyaltyTier"],
      where: { tenantId },
      _count: true,
    })

    return successResponse({
      config: config || null,
      rewards: rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        pointsCost: r.pointsCost,
        rewardType: r.rewardType,
        value: Number(r.value),
        minTier: r.minTier,
        usageLimit: r.usageLimit,
        usedCount: r.usedCount,
        isActive: r.isActive,
        validUntil: r.validUntil,
      })),
      stats: {
        totalCustomers: stats._count,
        totalPointsIssued: stats._sum.loyaltyPoints || 0,
        avgPoints: Math.round(Number(stats._avg.loyaltyPoints) || 0),
        tierDistribution: tierDistribution.reduce(
          (acc, t) => ({ ...acc, [t.loyaltyTier]: t._count }),
          {}
        ),
      },
    })
  } catch (error) {
    console.error("Loyalty GET error:", error)
    return errorResponse("Veriler alınırken bir hata oluştu", 500)
  }
}

// POST - Loyalty config oluştur/güncelle
const configSchema = z.object({
  pointsPerSpent: z.number().min(0).optional(),
  minSpendForPoints: z.number().min(0).optional(),
  silverThreshold: z.number().min(0).optional(),
  goldThreshold: z.number().min(0).optional(),
  platinumThreshold: z.number().min(0).optional(),
  bronzeMultiplier: z.number().min(1).optional(),
  silverMultiplier: z.number().min(1).optional(),
  goldMultiplier: z.number().min(1).optional(),
  platinumMultiplier: z.number().min(1).optional(),
  pointsValidityDays: z.number().min(0).optional(),
  birthdayBonusPoints: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const body = await request.json()

    const validation = configSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const config = await prisma.loyaltyConfig.upsert({
      where: { tenantId },
      update: validation.data,
      create: {
        tenantId,
        ...validation.data,
      },
    })

    return successResponse({
      id: config.id,
      isActive: config.isActive,
      message: "Loyalty ayarları kaydedildi",
    })
  } catch (error) {
    console.error("Loyalty POST error:", error)
    return errorResponse("Ayarlar kaydedilirken bir hata oluştu", 500)
  }
}

// PATCH - Ödül oluştur/güncelle
const rewardSchema = z.object({
  id: z.string().optional(), // Varsa güncelle, yoksa oluştur
  name: z.string().min(1),
  description: z.string().optional(),
  rewardType: z.enum(["free_item", "discount_percent", "discount_amount"]),
  pointsCost: z.number().min(1),
  value: z.number().min(0),
  applicableItems: z.array(z.string()).optional(),
  minTier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
  usageLimit: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  validUntil: z.string().datetime().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const body = await request.json()

    const validation = rewardSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const { id, validUntil, ...data } = validation.data

    if (id) {
      // Güncelle
      const reward = await prisma.loyaltyReward.update({
        where: { id, tenantId },
        data: {
          ...data,
          validUntil: validUntil ? new Date(validUntil) : undefined,
        },
      })
      return successResponse({ id: reward.id, message: "Ödül güncellendi" })
    } else {
      // Oluştur
      const reward = await prisma.loyaltyReward.create({
        data: {
          tenantId,
          ...data,
          validUntil: validUntil ? new Date(validUntil) : null,
        },
      })
      return successResponse({ id: reward.id, message: "Ödül oluşturuldu" }, 201)
    }
  } catch (error) {
    console.error("Loyalty PATCH error:", error)
    return errorResponse("Ödül kaydedilirken bir hata oluştu", 500)
  }
}

// DELETE - Ödül sil
export async function DELETE(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return errorResponse("Ödül ID gerekli", 400)
    }

    await prisma.loyaltyReward.delete({
      where: { id, tenantId },
    })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error("Loyalty DELETE error:", error)
    return errorResponse("Ödül silinirken bir hata oluştu", 500)
  }
}

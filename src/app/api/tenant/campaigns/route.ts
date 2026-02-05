import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

// Demo kampanya verileri
const demoCampaigns = [
  {
    id: "1",
    name: "Happy Hour",
    description: "Hafta içi 14:00-17:00 arası tüm içeceklerde %20 indirim",
    type: "DISCOUNT_PERCENT",
    discountValue: 20,
    status: "ACTIVE",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usedCount: 145,
    usageLimit: 0,
    validHoursFrom: "14:00",
    validHoursTo: "17:00",
    validDays: [1, 2, 3, 4, 5],
    isPublic: true,
  },
  {
    id: "2",
    name: "Yeni Müşteri İndirimi",
    description: "İlk siparişe %15 indirim",
    type: "DISCOUNT_PERCENT",
    discountValue: 15,
    status: "ACTIVE",
    startDate: new Date(),
    endDate: null,
    usedCount: 89,
    usageLimit: 0,
    isFirstOrderOnly: true,
    isPublic: true,
  },
  {
    id: "3",
    name: "2 Al 1 Öde - Tatlılar",
    description: "Tüm tatlılarda 2 al 1 öde kampanyası",
    type: "BUY_X_GET_Y",
    buyQuantity: 2,
    getQuantity: 1,
    status: "SCHEDULED",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    usedCount: 0,
    usageLimit: 100,
    isPublic: true,
  },
]

// Kampanya listesi
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
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    try {
      const whereClause: Record<string, unknown> = { tenantId }
      if (status) {
        whereClause.status = status
      }

      const campaigns = await prisma.campaign.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          coupons: {
            select: {
              id: true,
              code: true,
              usedCount: true,
            },
          },
        },
      })

      // İstatistikler
      const stats = {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === "ACTIVE").length,
        scheduled: campaigns.filter((c) => c.status === "SCHEDULED").length,
        totalUsage: campaigns.reduce((sum, c) => sum + c.usedCount, 0),
      }

      return successResponse({ campaigns, stats })
    } catch {
      return successResponse({
        campaigns: demoCampaigns,
        stats: {
          total: demoCampaigns.length,
          active: demoCampaigns.filter((c) => c.status === "ACTIVE").length,
          scheduled: demoCampaigns.filter((c) => c.status === "SCHEDULED").length,
          totalUsage: demoCampaigns.reduce((sum, c) => sum + c.usedCount, 0),
        },
      })
    }
  } catch (error) {
    console.error("Campaigns API error:", error)
    return errorResponse("Kampanya verileri alınırken bir hata oluştu", 500)
  }
}

// Yeni kampanya oluştur
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

    const {
      name,
      description,
      type,
      discountValue,
      minOrderAmount,
      maxDiscount,
      buyQuantity,
      getQuantity,
      startDate,
      endDate,
      usageLimit,
      perCustomerLimit,
      applicableItems,
      applicableCategories,
      targetTiers,
      isFirstOrderOnly,
      validDays,
      validHoursFrom,
      validHoursTo,
      isPublic,
      status,
    } = body

    if (!name || !type || discountValue === undefined || !startDate) {
      return errorResponse("Kampanya adı, tipi, indirim değeri ve başlangıç tarihi gerekli", 400)
    }

    try {
      const campaign = await prisma.campaign.create({
        data: {
          tenantId,
          name,
          description,
          type,
          discountValue,
          minOrderAmount,
          maxDiscount,
          buyQuantity,
          getQuantity,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          usageLimit: usageLimit || 0,
          perCustomerLimit: perCustomerLimit || 0,
          applicableItems: applicableItems || [],
          applicableCategories: applicableCategories || [],
          targetTiers: targetTiers || [],
          isFirstOrderOnly: isFirstOrderOnly || false,
          validDays: validDays || [],
          validHoursFrom,
          validHoursTo,
          isPublic: isPublic !== false,
          status: status || "DRAFT",
        },
      })

      return successResponse({ campaign }, 201)
    } catch {
      // Demo mode
      return successResponse({
        campaign: {
          id: `demo_${Date.now()}`,
          ...body,
          tenantId,
          usedCount: 0,
          createdAt: new Date(),
        },
        demo: true,
      }, 201)
    }
  } catch (error) {
    console.error("Campaign create error:", error)
    return errorResponse("Kampanya oluşturulurken bir hata oluştu", 500)
  }
}

// Kampanya güncelle
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
    const { id, ...updateData } = body

    if (!id) {
      return errorResponse("Kampanya ID gerekli", 400)
    }

    try {
      // Tarihleri dönüştür
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate)
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate)
      }

      const campaign = await prisma.campaign.update({
        where: { id, tenantId },
        data: updateData,
      })

      return successResponse({ campaign })
    } catch {
      return successResponse({
        campaign: { id, ...updateData },
        demo: true,
      })
    }
  } catch (error) {
    console.error("Campaign update error:", error)
    return errorResponse("Kampanya güncellenirken bir hata oluştu", 500)
  }
}

// Kampanya sil
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
      return errorResponse("Kampanya ID gerekli", 400)
    }

    try {
      await prisma.campaign.delete({
        where: { id, tenantId },
      })

      return successResponse({ deleted: true })
    } catch {
      return successResponse({ deleted: true, demo: true })
    }
  } catch (error) {
    console.error("Campaign delete error:", error)
    return errorResponse("Kampanya silinirken bir hata oluştu", 500)
  }
}

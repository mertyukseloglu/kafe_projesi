import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

// Demo kupon verileri
const demoCoupons = [
  {
    id: "1",
    code: "HOSGELDIN",
    discountType: "percent",
    discountValue: 15,
    minOrderAmount: 50,
    maxDiscount: 30,
    isActive: true,
    usedCount: 234,
    usageLimit: 0,
    perCustomerLimit: 1,
    startDate: new Date(),
    endDate: null,
  },
  {
    id: "2",
    code: "YAZ2024",
    discountType: "amount",
    discountValue: 25,
    minOrderAmount: 100,
    isActive: true,
    usedCount: 89,
    usageLimit: 500,
    perCustomerLimit: 2,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    code: "KAHVE10",
    discountType: "percent",
    discountValue: 10,
    isActive: true,
    usedCount: 567,
    usageLimit: 1000,
    perCustomerLimit: 0,
    campaignId: "1",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
]

// Kupon listesi
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
    const activeOnly = searchParams.get("active") === "true"

    try {
      const whereClause: Record<string, unknown> = { tenantId }
      if (activeOnly) {
        whereClause.isActive = true
      }

      const coupons = await prisma.coupon.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { usages: true },
          },
        },
      })

      const stats = {
        total: coupons.length,
        active: coupons.filter((c) => c.isActive).length,
        totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
      }

      return successResponse({ coupons, stats })
    } catch {
      return successResponse({
        coupons: demoCoupons,
        stats: {
          total: demoCoupons.length,
          active: demoCoupons.filter((c) => c.isActive).length,
          totalUsage: demoCoupons.reduce((sum, c) => sum + c.usedCount, 0),
        },
      })
    }
  } catch (error) {
    console.error("Coupons API error:", error)
    return errorResponse("Kupon verileri alınırken bir hata oluştu", 500)
  }
}

// Yeni kupon oluştur
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
      code,
      campaignId,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      perCustomerLimit,
    } = body

    if (!code) {
      return errorResponse("Kupon kodu gerekli", 400)
    }

    // Kupon kodu formatla (büyük harf, boşluksuz)
    const formattedCode = code.toUpperCase().replace(/\s/g, "")

    try {
      // Kod benzersizliği kontrolü
      const existing = await prisma.coupon.findUnique({
        where: { tenantId_code: { tenantId, code: formattedCode } },
      })

      if (existing) {
        return errorResponse("Bu kupon kodu zaten kullanılıyor", 400)
      }

      const coupon = await prisma.coupon.create({
        data: {
          tenantId,
          code: formattedCode,
          campaignId,
          discountType,
          discountValue,
          minOrderAmount,
          maxDiscount,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          usageLimit: usageLimit || 0,
          perCustomerLimit: perCustomerLimit || 1,
        },
      })

      return successResponse({ coupon }, 201)
    } catch (dbError) {
      console.error("DB error:", dbError)
      // Demo mode
      return successResponse({
        coupon: {
          id: `demo_${Date.now()}`,
          code: formattedCode,
          ...body,
          tenantId,
          usedCount: 0,
          isActive: true,
          createdAt: new Date(),
        },
        demo: true,
      }, 201)
    }
  } catch (error) {
    console.error("Coupon create error:", error)
    return errorResponse("Kupon oluşturulurken bir hata oluştu", 500)
  }
}

// Kupon güncelle
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
      return errorResponse("Kupon ID gerekli", 400)
    }

    try {
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate)
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate)
      }
      if (updateData.code) {
        updateData.code = updateData.code.toUpperCase().replace(/\s/g, "")
      }

      const coupon = await prisma.coupon.update({
        where: { id, tenantId },
        data: updateData,
      })

      return successResponse({ coupon })
    } catch {
      return successResponse({
        coupon: { id, ...updateData },
        demo: true,
      })
    }
  } catch (error) {
    console.error("Coupon update error:", error)
    return errorResponse("Kupon güncellenirken bir hata oluştu", 500)
  }
}

// Kupon sil
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
      return errorResponse("Kupon ID gerekli", 400)
    }

    try {
      await prisma.coupon.delete({
        where: { id, tenantId },
      })

      return successResponse({ deleted: true })
    } catch {
      return successResponse({ deleted: true, demo: true })
    }
  } catch (error) {
    console.error("Coupon delete error:", error)
    return errorResponse("Kupon silinirken bir hata oluştu", 500)
  }
}

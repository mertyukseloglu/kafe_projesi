import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { ApiResponse } from "@/types"

interface CouponValidation {
  valid: boolean
  discountType?: string
  discountValue?: number
  minOrderAmount?: number
  maxDiscount?: number
  message?: string
}

// Kupon doğrulama (müşteri tarafı)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CouponValidation>>> {
  try {
    const body = await request.json()
    const { code, tenantSlug, orderTotal, customerId } = body

    if (!code || !tenantSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Kupon kodu ve restoran bilgisi gerekli",
        },
        { status: 400 }
      )
    }

    const formattedCode = code.toUpperCase().replace(/\s/g, "")

    try {
      // Tenant'ı bul
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      })

      if (!tenant) {
        return NextResponse.json({
          success: true,
          data: { valid: false, message: "Restoran bulunamadı" },
        })
      }

      // Kuponu bul
      const coupon = await prisma.coupon.findUnique({
        where: {
          tenantId_code: { tenantId: tenant.id, code: formattedCode },
        },
        include: { campaign: true },
      })

      if (!coupon) {
        return NextResponse.json({
          success: true,
          data: { valid: false, message: "Geçersiz kupon kodu" },
        })
      }

      // Aktiflik kontrolü
      if (!coupon.isActive) {
        return NextResponse.json({
          success: true,
          data: { valid: false, message: "Bu kupon artık geçerli değil" },
        })
      }

      // Tarih kontrolü
      const now = new Date()
      if (coupon.startDate > now) {
        return NextResponse.json({
          success: true,
          data: { valid: false, message: "Bu kupon henüz aktif değil" },
        })
      }
      if (coupon.endDate && coupon.endDate < now) {
        return NextResponse.json({
          success: true,
          data: { valid: false, message: "Bu kuponun süresi dolmuş" },
        })
      }

      // Kullanım limiti kontrolü
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({
          success: true,
          data: { valid: false, message: "Bu kuponun kullanım limiti dolmuş" },
        })
      }

      // Müşteri bazlı kullanım kontrolü
      if (customerId && coupon.perCustomerLimit > 0) {
        const customerUsages = await prisma.couponUsage.count({
          where: { couponId: coupon.id, customerId },
        })
        if (customerUsages >= coupon.perCustomerLimit) {
          return NextResponse.json({
            success: true,
            data: { valid: false, message: "Bu kuponu daha önce kullandınız" },
          })
        }
      }

      // Kampanya bağlantılı ise kampanya kurallarını da kontrol et
      const campaign = coupon.campaign
      let discountType = coupon.discountType
      let discountValue = coupon.discountValue ? Number(coupon.discountValue) : 0
      let minOrderAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0
      let maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined

      if (campaign) {
        // Kampanya değerlerini kullan
        discountType = campaign.type === "DISCOUNT_PERCENT" ? "percent" : "amount"
        discountValue = Number(campaign.discountValue)
        minOrderAmount = campaign.minOrderAmount ? Number(campaign.minOrderAmount) : 0
        maxDiscount = campaign.maxDiscount ? Number(campaign.maxDiscount) : undefined

        // Kampanya durumu kontrolü
        if (campaign.status !== "ACTIVE") {
          return NextResponse.json({
            success: true,
            data: { valid: false, message: "Bu kampanya şu an aktif değil" },
          })
        }
      }

      // Minimum tutar kontrolü
      if (orderTotal !== undefined && minOrderAmount > 0 && orderTotal < minOrderAmount) {
        return NextResponse.json({
          success: true,
          data: {
            valid: false,
            message: `Minimum sipariş tutarı ₺${minOrderAmount}`,
          },
        })
      }

      // Kupon geçerli
      return NextResponse.json({
        success: true,
        data: {
          valid: true,
          discountType: discountType || "percent",
          discountValue,
          minOrderAmount,
          maxDiscount,
          message: "Kupon uygulandı!",
        },
      })
    } catch {
      // Demo mode - basit doğrulama
      const demoDiscounts: Record<string, { type: string; value: number; min?: number }> = {
        HOSGELDIN: { type: "percent", value: 15, min: 50 },
        YAZ2024: { type: "amount", value: 25, min: 100 },
        KAHVE10: { type: "percent", value: 10 },
        INDIRIM20: { type: "percent", value: 20 },
      }

      const discount = demoDiscounts[formattedCode]
      if (discount) {
        if (discount.min && orderTotal && orderTotal < discount.min) {
          return NextResponse.json({
            success: true,
            data: {
              valid: false,
              message: `Minimum sipariş tutarı ₺${discount.min}`,
            },
          })
        }
        return NextResponse.json({
          success: true,
          data: {
            valid: true,
            discountType: discount.type,
            discountValue: discount.value,
            minOrderAmount: discount.min,
            message: "Kupon uygulandı!",
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: { valid: false, message: "Geçersiz kupon kodu" },
      })
    }
  } catch (error) {
    console.error("Coupon validation error:", error)
    return NextResponse.json(
      { success: false, error: "Kupon doğrulanırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

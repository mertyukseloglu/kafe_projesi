import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCustomerLoyaltySummary, redeemLoyaltyPoints } from "@/lib/services/loyalty"

// GET - Müşteri loyalty özeti
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantSlug = searchParams.get("tenantSlug")
    const phone = searchParams.get("phone")
    const customerId = searchParams.get("customerId")

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "Restoran slug gerekli" },
        { status: 400 }
      )
    }

    // Tenant bul
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Restoran bulunamadı" },
        { status: 404 }
      )
    }

    // Müşteri bul
    let customer
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, tenantId: true },
      })
    } else if (phone) {
      customer = await prisma.customer.findFirst({
        where: { tenantId: tenant.id, phone },
        select: { id: true, tenantId: true },
      })
    }

    if (!customer || customer.tenantId !== tenant.id) {
      return NextResponse.json(
        { success: false, error: "Müşteri bulunamadı" },
        { status: 404 }
      )
    }

    // Loyalty özeti al
    const summary = await getCustomerLoyaltySummary(tenant.id, customer.id)

    if (!summary) {
      return NextResponse.json(
        { success: false, error: "Loyalty programı aktif değil" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error("Public loyalty GET error:", error)
    return NextResponse.json(
      { success: false, error: "Veriler alınırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// POST - Ödül kullan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantSlug, customerId, phone, rewardId, orderId } = body

    if (!tenantSlug || !rewardId) {
      return NextResponse.json(
        { success: false, error: "Restoran ve ödül ID gerekli" },
        { status: 400 }
      )
    }

    if (!customerId && !phone) {
      return NextResponse.json(
        { success: false, error: "Müşteri ID veya telefon gerekli" },
        { status: 400 }
      )
    }

    // Tenant bul
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Restoran bulunamadı" },
        { status: 404 }
      )
    }

    // Müşteri bul
    let customer
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, tenantId: true },
      })
    } else if (phone) {
      customer = await prisma.customer.findFirst({
        where: { tenantId: tenant.id, phone },
        select: { id: true, tenantId: true },
      })
    }

    if (!customer || customer.tenantId !== tenant.id) {
      return NextResponse.json(
        { success: false, error: "Müşteri bulunamadı" },
        { status: 404 }
      )
    }

    // Ödül kullan
    const result = await redeemLoyaltyPoints(
      tenant.id,
      customer.id,
      rewardId,
      orderId
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        pointsUsed: result.pointsUsed,
        newBalance: result.newBalance,
      },
      message: "Ödül başarıyla kullanıldı",
    })
  } catch (error) {
    console.error("Public loyalty POST error:", error)
    return NextResponse.json(
      { success: false, error: "Ödül kullanılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

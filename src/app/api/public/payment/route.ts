import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { initializePayment, verifyPayment } from "@/lib/payment/iyzico"
import { sendOrderStatusEmail } from "@/lib/email"
import type { ApiResponse } from "@/types"

// Ödeme başlat
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ checkoutUrl: string; paymentId: string }>>> {
  try {
    const body = await request.json()
    const { orderId, customerEmail, customerPhone, customerName } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Sipariş ID gerekli" },
        { status: 400 }
      )
    }

    // Siparişi bul
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        tenant: true,
        items: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı" },
        { status: 404 }
      )
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Bu sipariş zaten ödenmiş" },
        { status: 400 }
      )
    }

    // Callback URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const callbackUrl = `${baseUrl}/api/public/payment/callback`

    // Ödeme başlat
    const result = await initializePayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      customerName: customerName || "Müşteri",
      customerEmail: customerEmail || "musteri@example.com",
      customerPhone: customerPhone || "+905551234567",
      items: order.items.map((item) => ({
        id: item.menuItemId,
        name: item.menuItem.name,
        category: item.menuItem.category?.name || "Genel",
        price: Number(item.unitPrice),
        quantity: item.quantity,
      })),
      callbackUrl,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Ödeme başlatılamadı" },
        { status: 500 }
      )
    }

    // Ödeme ID'sini siparişe kaydet
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: "ONLINE",
        notes: order.notes
          ? `${order.notes}\n[Payment ID: ${result.paymentId}]`
          : `[Payment ID: ${result.paymentId}]`,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl!,
        paymentId: result.paymentId!,
      },
      message: "Ödeme sayfası hazır",
    })
  } catch (error) {
    console.error("Payment init error:", error)
    return NextResponse.json(
      { success: false, error: "Ödeme başlatılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Ödeme callback (iyzico'dan gelen)
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const paymentId = searchParams.get("paymentId")
    const demo = searchParams.get("demo")

    // Demo mode redirect
    if (demo === "true" && paymentId) {
      // Demo payment başarılı sayılır
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      return NextResponse.redirect(`${baseUrl}/customer/payment/success?demo=true&paymentId=${paymentId}`)
    }

    if (!token) {
      return NextResponse.redirect("/customer/payment/failed?error=no_token")
    }

    // Ödemeyi doğrula
    const result = await verifyPayment(token)

    if (result.status === "SUCCESS") {
      // Sipariş ödeme durumunu güncelle
      if (result.orderId && result.orderId !== "unknown") {
        const order = await prisma.order.update({
          where: { id: result.orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED", // Ödeme yapıldığında otomatik onayla
          },
          include: {
            tenant: true,
            customer: true,
          },
        })

        // Müşteriye email gönder
        if (order.customer?.email) {
          sendOrderStatusEmail(order.customer.email, {
            orderNumber: order.orderNumber,
            restaurantName: order.tenant.name,
            status: "CONFIRMED",
            statusLabel: "Ödeme Alındı - Siparişiniz Onaylandı",
          }).catch((err) => console.error("Email error:", err))
        }
      }

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${baseUrl}/customer/payment/success?orderId=${result.orderId}&paymentId=${result.paymentId}`
      )
    } else {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${baseUrl}/customer/payment/failed?error=${result.errorCode || "payment_failed"}&message=${encodeURIComponent(result.errorMessage || "Ödeme başarısız")}`
      )
    }
  } catch (error) {
    console.error("Payment callback error:", error)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/customer/payment/failed?error=system_error`)
  }
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createOrderSchema } from "@/lib/validations/order"
import { notifyNewOrder } from "@/lib/pusher"
import { logOrderCreate } from "@/lib/services/activity"
import { addLoyaltyPoints } from "@/lib/services/loyalty"
import { sendOrderNotification } from "@/lib/email"
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
  validatePrice,
  sanitizeString,
} from "@/lib/api-utils"
import type { ApiResponse, Order } from "@/types"

// Sipariş numarası oluştur
function generateOrderNumber(): string {
  const date = new Date()
  const prefix = "S"
  const timestamp = date.getTime().toString(36).toUpperCase().slice(-4)
  const random = Math.random().toString(36).toUpperCase().slice(-2)
  return `${prefix}${timestamp}${random}`
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ orderId: string; orderNumber: string }>>> {
  try {
    // Rate limiting - 10 sipariş/saat per IP
    const rateLimit = checkRateLimit(request, RATE_LIMITS.publicOrders)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetIn) as NextResponse<ApiResponse<{ orderId: string; orderNumber: string }>>
    }

    const body = await request.json()

    // Validasyon
    const validationResult = createOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz sipariş verisi",
          message: validationResult.error.issues[0]?.message,
        },
        { status: 400 }
      )
    }

    const { tenantSlug, tableNumber, items, customerName, customerPhone, notes } =
      validationResult.data

    // Extra security: Sanitize user inputs
    const safeNotes = notes ? sanitizeString(notes) : undefined
    const safeCustomerName = customerName ? sanitizeString(customerName) : undefined

    // Validate all prices in items
    for (const item of items) {
      const validatedPrice = validatePrice(item.price)
      if (validatedPrice === null || validatedPrice <= 0) {
        return NextResponse.json(
          { success: false, error: "Geçersiz ürün fiyatı" },
          { status: 400 }
        )
      }
    }

    // Tenant'ı bul
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug, isActive: true },
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Restoran bulunamadı" },
        { status: 404 }
      )
    }

    // Masa bilgisini bul (varsa)
    let tableId: string | undefined
    if (tableNumber) {
      const table = await prisma.table.findFirst({
        where: {
          tenantId: tenant.id,
          number: tableNumber,
          isActive: true,
        },
      })
      tableId = table?.id
    }

    // Müşteri bul veya oluştur (telefon varsa)
    let customerId: string | undefined
    if (customerPhone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          tenantId: tenant.id,
          phone: customerPhone,
        },
      })

      if (existingCustomer) {
        customerId = existingCustomer.id
        // Ziyaret sayısını güncelle
        await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            visitCount: { increment: 1 },
            lastVisitAt: new Date(),
            name: safeCustomerName || existingCustomer.name,
          },
        })
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            tenantId: tenant.id,
            phone: customerPhone,
            name: safeCustomerName,
            visitCount: 1,
            lastVisitAt: new Date(),
          },
        })
        customerId = newCustomer.id
      }
    }

    // Toplam hesapla
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Sipariş numarası oluştur
    const orderNumber = generateOrderNumber()

    // Siparişi oluştur
    const order = await prisma.order.create({
      data: {
        orderNumber,
        tenantId: tenant.id,
        tableId,
        customerId,
        status: "PENDING",
        subtotal,
        total: subtotal, // İndirim yoksa aynı
        notes: safeNotes,
        paymentStatus: "PENDING",
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Müşteri toplam harcamasını güncelle
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: { increment: subtotal },
        },
      })
    }

    // Abonelik kullanımını artır (varsa)
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
    })
    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          ordersUsed: { increment: 1 },
        },
      })
    }

    // Real-time bildirim gönder
    notifyNewOrder(tenant.id, {
      id: order.id,
      orderNumber: order.orderNumber,
      table: tableNumber || null,
      total: subtotal,
      items: items.map((item) => ({
        name: item.name || "Ürün",
        quantity: item.quantity,
      })),
    }).catch((err) => console.error("Pusher notification error:", err))

    // Activity log
    logOrderCreate({
      tenantId: tenant.id,
      customerId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: subtotal,
      itemCount: items.length,
      tableNumber,
    }).catch((err) => console.error("Activity log error:", err))

    // Loyalty puanları (sipariş oluşturulduğunda - ödeme sonrası da olabilir)
    if (customerId) {
      addLoyaltyPoints(tenant.id, customerId, order.id, subtotal)
        .then((result) => {
          if (result.pointsEarned > 0) {
            console.log(`Loyalty: ${result.pointsEarned} puan kazanıldı`)
          }
        })
        .catch((err) => console.error("Loyalty points error:", err))
    }

    // Email bildirim gönder (restoran sahibine)
    if (tenant.email) {
      sendOrderNotification(tenant.email, {
        orderNumber: order.orderNumber,
        restaurantName: tenant.name,
        tableNumber: tableNumber || undefined,
        items: items.map((item) => ({
          name: item.name || "Ürün",
          quantity: item.quantity,
          price: item.price,
        })),
        total: subtotal,
        customerName: safeCustomerName || undefined,
      }).catch((err) => console.error("Email notification error:", err))
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
        message: "Siparişiniz başarıyla oluşturuldu",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { success: false, error: "Sipariş oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Sipariş durumunu sorgulama (müşteri için)
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Partial<Order>>>> {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")
    const orderNumber = searchParams.get("number")

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { success: false, error: "Sipariş ID veya numarası gerekli" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findFirst({
      where: orderId ? { id: orderId } : { orderNumber: orderNumber! },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            totalPrice: true,
            menuItem: {
              select: {
                name: true,
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

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: Number(item.totalPrice),
        })),
      } as Partial<Order>,
    })
  } catch (error) {
    console.error("Order fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Sipariş sorgulanırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

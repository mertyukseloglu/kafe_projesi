import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { notifyOrderStatusChanged } from "@/lib/pusher"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_ALL_ROLES,
} from "@/lib/api-utils"

// GET - List orders
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
    const { searchParams } = new URL(request.url)

    // Query params
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Build where clause
    const where: Record<string, unknown> = { tenantId }

    if (status && status !== "all") {
      where.status = status
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(dateFrom)
      }
      if (dateTo) {
        (where.createdAt as Record<string, Date>).lte = new Date(dateTo)
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          table: { select: { number: true, area: true } },
          customer: { select: { name: true, phone: true } },
          items: {
            include: {
              menuItem: { select: { name: true, price: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ])

    return successResponse({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        table: order.table ? { number: order.table.number, area: order.table.area } : null,
        customer: order.customer,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total),
        notes: order.notes,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          notes: item.notes,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Orders GET error:", error)
    return errorResponse("Siparişler alınırken bir hata oluştu", 500)
  }
}

// PATCH - Update order status
const updateOrderSchema = z.object({
  orderId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  notes: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_ALL_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const body = await request.json()

    const validationResult = updateOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const { orderId, status, paymentStatus, notes } = validationResult.data

    // Verify order belongs to tenant
    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
    })

    if (!existingOrder) {
      return errorResponse("Sipariş bulunamadı", 404)
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (notes !== undefined) updateData.notes = notes
    if (status === "DELIVERED") updateData.completedAt = new Date()

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        table: { select: { number: true } },
        items: {
          include: {
            menuItem: { select: { name: true } },
          },
        },
      },
    })

    // Real-time bildirim gönder (status değiştiyse)
    if (status && status !== existingOrder.status) {
      notifyOrderStatusChanged(tenantId, {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        previousStatus: existingOrder.status,
      }).catch((err) => console.error("Pusher notification error:", err))
    }

    return successResponse({
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      updatedAt: updatedOrder.updatedAt,
    })
  } catch (error) {
    console.error("Orders PATCH error:", error)
    return errorResponse("Sipariş güncellenirken bir hata oluştu", 500)
  }
}

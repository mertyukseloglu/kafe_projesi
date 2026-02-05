import { prisma } from "@/lib/prisma"
import { ActivityType, SessionStatus } from "@prisma/client"

// Yeni session başlat (QR tarama)
export async function startSession(params: {
  tenantId: string
  tableNumber?: string
  tableId?: string
  customerId?: string
  deviceId?: string
  userAgent?: string
  ipAddress?: string
}): Promise<string> {
  const session = await prisma.customerSession.create({
    data: {
      tenantId: params.tenantId,
      tableNumber: params.tableNumber,
      tableId: params.tableId,
      customerId: params.customerId,
      deviceId: params.deviceId,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      status: "ACTIVE",
    },
  })

  // Session start log
  await logActivity({
    tenantId: params.tenantId,
    sessionId: session.id,
    customerId: params.customerId,
    type: "SESSION_START",
    tableNumber: params.tableNumber,
    data: { deviceId: params.deviceId },
  })

  return session.id
}

// Session güncelle
export async function updateSession(
  sessionId: string,
  updates: {
    status?: SessionStatus
    customerId?: string
    pageViews?: number
    menuItemViews?: number
    cartAdditions?: number
    orderCount?: number
    totalSpent?: number
  }
) {
  const data: Record<string, unknown> = {
    lastActiveAt: new Date(),
  }

  if (updates.status) data.status = updates.status
  if (updates.customerId) data.customerId = updates.customerId
  if (updates.pageViews) data.pageViews = { increment: updates.pageViews }
  if (updates.menuItemViews) data.menuItemViews = { increment: updates.menuItemViews }
  if (updates.cartAdditions) data.cartAdditions = { increment: updates.cartAdditions }
  if (updates.orderCount) data.orderCount = { increment: updates.orderCount }
  if (updates.totalSpent) data.totalSpent = { increment: updates.totalSpent }

  if (updates.status === "COMPLETED" || updates.status === "ABANDONED") {
    data.endedAt = new Date()
  }

  return prisma.customerSession.update({
    where: { id: sessionId },
    data,
  })
}

// Session sonlandır
export async function endSession(sessionId: string, status: "COMPLETED" | "ABANDONED" = "COMPLETED") {
  const session = await prisma.customerSession.update({
    where: { id: sessionId },
    data: {
      status,
      endedAt: new Date(),
    },
  })

  // Session end log
  await logActivity({
    tenantId: session.tenantId,
    sessionId: session.id,
    customerId: session.customerId || undefined,
    type: "SESSION_END",
    tableNumber: session.tableNumber || undefined,
    data: {
      duration: session.endedAt
        ? Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000)
        : 0,
      pageViews: session.pageViews,
      orderCount: session.orderCount,
      totalSpent: Number(session.totalSpent),
    },
  })

  return session
}

// Aktivite logla
export async function logActivity(params: {
  tenantId: string
  sessionId?: string
  customerId?: string
  type: ActivityType
  tableNumber?: string
  data?: Record<string, unknown>
}) {
  return prisma.activityLog.create({
    data: {
      tenantId: params.tenantId,
      sessionId: params.sessionId,
      customerId: params.customerId,
      type: params.type,
      tableNumber: params.tableNumber,
      data: params.data ? JSON.parse(JSON.stringify(params.data)) : {},
    },
  })
}

// Menü görüntüleme logla
export async function logMenuView(params: {
  tenantId: string
  sessionId?: string
  customerId?: string
  tableNumber?: string
}) {
  if (params.sessionId) {
    await updateSession(params.sessionId, { pageViews: 1 })
  }

  return logActivity({
    ...params,
    type: "MENU_VIEW",
  })
}

// Ürün görüntüleme logla
export async function logItemView(params: {
  tenantId: string
  sessionId?: string
  customerId?: string
  menuItemId: string
  menuItemName: string
  tableNumber?: string
}) {
  if (params.sessionId) {
    await updateSession(params.sessionId, { menuItemViews: 1 })
  }

  return logActivity({
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    customerId: params.customerId,
    type: "ITEM_VIEW",
    tableNumber: params.tableNumber,
    data: {
      menuItemId: params.menuItemId,
      menuItemName: params.menuItemName,
    },
  })
}

// Sepete ekleme logla
export async function logCartAdd(params: {
  tenantId: string
  sessionId?: string
  customerId?: string
  menuItemId: string
  menuItemName: string
  quantity: number
  price: number
  tableNumber?: string
}) {
  if (params.sessionId) {
    await updateSession(params.sessionId, { cartAdditions: 1 })
  }

  return logActivity({
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    customerId: params.customerId,
    type: "CART_ADD",
    tableNumber: params.tableNumber,
    data: {
      menuItemId: params.menuItemId,
      menuItemName: params.menuItemName,
      quantity: params.quantity,
      price: params.price,
    },
  })
}

// Sipariş oluşturma logla
export async function logOrderCreate(params: {
  tenantId: string
  sessionId?: string
  customerId?: string
  orderId: string
  orderNumber: string
  total: number
  itemCount: number
  tableNumber?: string
}) {
  if (params.sessionId) {
    await updateSession(params.sessionId, {
      status: "WAITING",
      orderCount: 1,
      totalSpent: params.total,
    })

    // Order ID'yi session'a ekle
    const session = await prisma.customerSession.findUnique({
      where: { id: params.sessionId },
      select: { orderIds: true },
    })
    const orderIds = (session?.orderIds as string[]) || []
    await prisma.customerSession.update({
      where: { id: params.sessionId },
      data: { orderIds: [...orderIds, params.orderId] },
    })
  }

  return logActivity({
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    customerId: params.customerId,
    type: "ORDER_CREATE",
    tableNumber: params.tableNumber,
    data: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      total: params.total,
      itemCount: params.itemCount,
    },
  })
}

// Garson çağırma logla
export async function logWaiterCall(params: {
  tenantId: string
  sessionId?: string
  customerId?: string
  tableNumber: string
  reason: string
  message?: string
}) {
  // WaiterCall kaydı oluştur
  await prisma.waiterCall.create({
    data: {
      tenantId: params.tenantId,
      tableNumber: params.tableNumber,
      reason: params.reason,
      message: params.message,
      status: "PENDING",
    },
  })

  return logActivity({
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    customerId: params.customerId,
    type: "WAITER_CALL",
    tableNumber: params.tableNumber,
    data: {
      reason: params.reason,
      message: params.message,
    },
  })
}

// Ödeme başarılı logla
export async function logPaymentSuccess(params: {
  tenantId: string
  sessionId?: string
  customerId?: string
  orderId: string
  amount: number
  paymentMethod: string
  tableNumber?: string
}) {
  if (params.sessionId) {
    await updateSession(params.sessionId, { status: "COMPLETED" })
  }

  return logActivity({
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    customerId: params.customerId,
    type: "PAYMENT_SUCCESS",
    tableNumber: params.tableNumber,
    data: {
      orderId: params.orderId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
    },
  })
}

// Session istatistiklerini al
export async function getSessionStats(tenantId: string, dateFrom: Date, dateTo: Date) {
  const sessions = await prisma.customerSession.findMany({
    where: {
      tenantId,
      startedAt: { gte: dateFrom, lte: dateTo },
    },
    select: {
      status: true,
      startedAt: true,
      endedAt: true,
      pageViews: true,
      menuItemViews: true,
      cartAdditions: true,
      orderCount: true,
      totalSpent: true,
    },
  })

  const totalSessions = sessions.length
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length
  const abandonedSessions = sessions.filter((s) => s.status === "ABANDONED").length
  const sessionsWithOrders = sessions.filter((s) => s.orderCount > 0).length
  const conversionRate = totalSessions > 0 ? (sessionsWithOrders / totalSessions) * 100 : 0

  // Ortalama session süresi
  const sessionsWithDuration = sessions.filter((s) => s.endedAt)
  const avgDuration =
    sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => {
          const duration = s.endedAt!.getTime() - s.startedAt.getTime()
          return sum + duration
        }, 0) /
        sessionsWithDuration.length /
        1000 // saniye
      : 0

  const totalRevenue = sessions.reduce((sum, s) => sum + Number(s.totalSpent), 0)
  const avgPageViews = totalSessions > 0
    ? sessions.reduce((sum, s) => sum + s.pageViews, 0) / totalSessions
    : 0

  return {
    totalSessions,
    completedSessions,
    abandonedSessions,
    sessionsWithOrders,
    conversionRate: Math.round(conversionRate * 100) / 100,
    avgDurationSeconds: Math.round(avgDuration),
    totalRevenue,
    avgPageViews: Math.round(avgPageViews * 10) / 10,
  }
}

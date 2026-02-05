import Pusher from "pusher"

// Pusher server instance (singleton)
let pusherInstance: Pusher | null = null

export function getPusher(): Pusher | null {
  // Return null if credentials not configured
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET ||
    !process.env.PUSHER_CLUSTER
  ) {
    console.log("Pusher credentials not configured, real-time disabled")
    return null
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    })
  }

  return pusherInstance
}

// Channel names
export const CHANNELS = {
  tenant: (tenantId: string) => `private-tenant-${tenantId}`,
  orders: (tenantId: string) => `private-orders-${tenantId}`,
  kitchen: (tenantId: string) => `private-kitchen-${tenantId}`,
}

// Event names
export const EVENTS = {
  NEW_ORDER: "new-order",
  ORDER_UPDATED: "order-updated",
  ORDER_STATUS_CHANGED: "order-status-changed",
  WAITER_CALLED: "waiter-called",
  TABLE_STATUS_CHANGED: "table-status-changed",
}

// Helper to trigger events safely
export async function triggerEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const pusher = getPusher()
  if (!pusher) {
    console.log(`[Pusher Demo] ${channel} -> ${event}:`, data)
    return false
  }

  try {
    await pusher.trigger(channel, event, data)
    return true
  } catch (error) {
    console.error("Pusher trigger error:", error)
    return false
  }
}

// Typed event triggers
export async function notifyNewOrder(
  tenantId: string,
  order: {
    id: string
    orderNumber: string
    table?: string | null
    total: number
    items: { name: string; quantity: number }[]
  }
) {
  return triggerEvent(CHANNELS.orders(tenantId), EVENTS.NEW_ORDER, {
    ...order,
    timestamp: new Date().toISOString(),
  })
}

export async function notifyOrderStatusChanged(
  tenantId: string,
  order: {
    id: string
    orderNumber: string
    status: string
    previousStatus: string
  }
) {
  return triggerEvent(CHANNELS.orders(tenantId), EVENTS.ORDER_STATUS_CHANGED, {
    ...order,
    timestamp: new Date().toISOString(),
  })
}

export async function notifyWaiterCalled(
  tenantId: string,
  data: {
    tableNumber: string
    message?: string
  }
) {
  return triggerEvent(CHANNELS.tenant(tenantId), EVENTS.WAITER_CALLED, {
    ...data,
    timestamp: new Date().toISOString(),
  })
}

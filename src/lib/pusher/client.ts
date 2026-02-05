"use client"

import Pusher from "pusher-js"
import { useEffect, useState, useCallback, useRef } from "react"

// Singleton Pusher client
let pusherClient: Pusher | null = null

export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

  if (!key || !cluster) {
    return null
  }

  if (!pusherClient) {
    pusherClient = new Pusher(key, {
      cluster,
      // For private channels, you'd add authEndpoint here
      // authEndpoint: "/api/pusher/auth",
    })
  }

  return pusherClient
}

// Channel names (same as server)
export const CHANNELS = {
  tenant: (tenantId: string) => `private-tenant-${tenantId}`,
  orders: (tenantId: string) => `private-orders-${tenantId}`,
  kitchen: (tenantId: string) => `private-kitchen-${tenantId}`,
  // Public channels for demo (no auth required)
  publicOrders: (tenantId: string) => `orders-${tenantId}`,
  publicTenant: (tenantId: string) => `tenant-${tenantId}`,
}

export const EVENTS = {
  NEW_ORDER: "new-order",
  ORDER_UPDATED: "order-updated",
  ORDER_STATUS_CHANGED: "order-status-changed",
  WAITER_CALLED: "waiter-called",
  TABLE_STATUS_CHANGED: "table-status-changed",
}

// Hook for subscribing to a channel
export function usePusherChannel(channelName: string | null) {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<ReturnType<Pusher["subscribe"]> | null>(null)

  useEffect(() => {
    if (!channelName) return

    const pusher = getPusherClient()
    if (!pusher) {
      console.log("Pusher not configured, using polling fallback")
      return
    }

    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true)
    })

    channel.bind("pusher:subscription_error", () => {
      setIsConnected(false)
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [channelName])

  const bind = useCallback(
    <T>(event: string, callback: (data: T) => void) => {
      if (channelRef.current) {
        channelRef.current.bind(event, callback)
        return () => channelRef.current?.unbind(event, callback)
      }
      return () => {}
    },
    []
  )

  return { isConnected, bind }
}

// Hook for real-time orders
interface OrderEvent {
  id: string
  orderNumber: string
  table?: string | null
  total?: number
  status?: string
  previousStatus?: string
  items?: { name: string; quantity: number }[]
  timestamp: string
}

export function useRealtimeOrders(
  tenantId: string | null,
  options?: {
    onNewOrder?: (order: OrderEvent) => void
    onOrderStatusChanged?: (order: OrderEvent) => void
  }
) {
  const channelName = tenantId ? CHANNELS.publicOrders(tenantId) : null
  const { isConnected, bind } = usePusherChannel(channelName)

  useEffect(() => {
    if (!isConnected) return

    const unbindNew = options?.onNewOrder
      ? bind(EVENTS.NEW_ORDER, options.onNewOrder)
      : () => {}

    const unbindStatus = options?.onOrderStatusChanged
      ? bind(EVENTS.ORDER_STATUS_CHANGED, options.onOrderStatusChanged)
      : () => {}

    return () => {
      unbindNew()
      unbindStatus()
    }
  }, [isConnected, bind, options])

  return { isConnected }
}

// Hook for waiter calls
interface WaiterCallEvent {
  tableNumber: string
  message?: string
  timestamp: string
}

export function useWaiterCalls(
  tenantId: string | null,
  onWaiterCalled?: (data: WaiterCallEvent) => void
) {
  const channelName = tenantId ? CHANNELS.publicTenant(tenantId) : null
  const { isConnected, bind } = usePusherChannel(channelName)

  useEffect(() => {
    if (!isConnected || !onWaiterCalled) return

    return bind(EVENTS.WAITER_CALLED, onWaiterCalled)
  }, [isConnected, bind, onWaiterCalled])

  return { isConnected }
}

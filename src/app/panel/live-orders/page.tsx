"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRealtimeOrders } from "@/lib/pusher/client"
import {
  CheckCircle,
  ChefHat,
  Bell,
  Utensils,
  XCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Timer,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"

// Sipariş durumları
const statusConfig = {
  PENDING: {
    label: "Yeni",
    color: "bg-red-500",
    textColor: "text-red-500",
    bgLight: "bg-red-50 border-red-200",
    icon: Bell,
    next: "CONFIRMED",
    nextLabel: "Onayla",
  },
  CONFIRMED: {
    label: "Onaylandı",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgLight: "bg-yellow-50 border-yellow-200",
    icon: CheckCircle,
    next: "PREPARING",
    nextLabel: "Hazırlamaya Başla",
  },
  PREPARING: {
    label: "Hazırlanıyor",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50 border-blue-200",
    icon: ChefHat,
    next: "READY",
    nextLabel: "Hazır",
  },
  READY: {
    label: "Hazır",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgLight: "bg-green-50 border-green-200",
    icon: Utensils,
    next: "DELIVERED",
    nextLabel: "Teslim Et",
  },
  DELIVERED: {
    label: "Teslim Edildi",
    color: "bg-slate-500",
    textColor: "text-slate-600",
    bgLight: "bg-slate-50 border-slate-200",
    icon: CheckCircle,
    next: null,
    nextLabel: null,
  },
  CANCELLED: {
    label: "İptal",
    color: "bg-red-700",
    textColor: "text-red-700",
    bgLight: "bg-red-50 border-red-300",
    icon: XCircle,
    next: null,
    nextLabel: null,
  },
}

type OrderStatus = keyof typeof statusConfig

interface OrderItem {
  id: string
  name: string
  quantity: number
  notes?: string
  extras?: string[]
}

interface Order {
  id: string
  orderNumber: string
  tableNumber: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  notes?: string
  createdAt: string
  customerName?: string
}

// Demo siparişler
const generateDemoOrders = (): Order[] => [
  {
    id: "1",
    orderNumber: "S001",
    tableNumber: "5",
    status: "PENDING",
    items: [
      { id: "1", name: "Latte", quantity: 2, notes: "Az şekerli" },
      { id: "2", name: "Cheesecake", quantity: 1 },
    ],
    total: 185,
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: "2",
    orderNumber: "S002",
    tableNumber: "3",
    status: "CONFIRMED",
    items: [
      { id: "3", name: "Türk Kahvesi", quantity: 3 },
      { id: "4", name: "Su", quantity: 3 },
    ],
    total: 165,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "S003",
    tableNumber: "8",
    status: "PREPARING",
    items: [
      { id: "5", name: "Cappuccino", quantity: 2 },
      { id: "6", name: "Sandviç", quantity: 2, notes: "Acısız" },
      { id: "7", name: "Tiramisu", quantity: 1 },
    ],
    total: 320,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: "4",
    orderNumber: "S004",
    tableNumber: "1",
    status: "READY",
    items: [
      { id: "8", name: "Americano", quantity: 1 },
    ],
    total: 55,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: "5",
    orderNumber: "S005",
    tableNumber: "12",
    status: "PENDING",
    items: [
      { id: "9", name: "Mocha", quantity: 2 },
      { id: "10", name: "Brownie", quantity: 2 },
    ],
    total: 220,
    notes: "Hızlı lütfen",
    createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
  },
]

export default function LiveOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>(generateDemoOrders())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real-time subscription
  const { isConnected } = useRealtimeOrders(session?.user?.tenantId || null, {
    onNewOrder: (order) => {
      // Yeni siparişi listeye ekle
      setOrders((prev) => [
        {
          id: order.id,
          orderNumber: order.orderNumber,
          tableNumber: order.table || "?",
          status: "PENDING" as OrderStatus,
          items: order.items?.map((item, idx) => ({
            id: `${order.id}-${idx}`,
            name: item.name,
            quantity: item.quantity,
          })) || [],
          total: order.total || 0,
          createdAt: order.timestamp,
        },
        ...prev,
      ])
      // Ses çal
      if (soundEnabled) {
        try {
          const audio = new Audio("/notification.mp3")
          audio.play().catch(() => {})
        } catch {}
      }
    },
    onOrderStatusChanged: (order) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: order.status as OrderStatus } : o
        )
      )
    },
  })

  // Zaman hesaplama
  const getElapsedTime = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Az önce"
    if (minutes < 60) return `${minutes} dk`
    return `${Math.floor(minutes / 60)} sa ${minutes % 60} dk`
  }

  // Sipariş durumunu güncelle - API'ye gönder
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ))

    // API'ye gönder
    try {
      await fetch("/api/tenant/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
    } catch (err) {
      console.error("Failed to update order status:", err)
    }

    // Ses çal
    if (soundEnabled && newStatus === "READY") {
      try {
        const audio = new Audio("/notification.mp3")
        audio.play().catch(() => {})
      } catch {}
    }
  }, [soundEnabled])

  // Siparişi iptal et
  const cancelOrder = (orderId: string) => {
    if (confirm("Siparişi iptal etmek istediğinize emin misiniz?")) {
      updateOrderStatus(orderId, "CANCELLED")
    }
  }

  // Yenile - API'den çek
  const refreshOrders = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch("/api/tenant/orders?status=all&limit=50")
      const data = await res.json()
      if (data.success && data.data?.orders) {
        setOrders(
          data.data.orders.map((o: Record<string, unknown>) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            tableNumber: (o.table as Record<string, string>)?.number || "?",
            status: o.status as OrderStatus,
            items: (o.items as Array<Record<string, unknown>>)?.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              notes: item.notes,
            })) || [],
            total: o.total,
            notes: o.notes,
            createdAt: o.createdAt,
          }))
        )
      }
    } catch {
      // Fallback to demo data
      setOrders(generateDemoOrders())
    }
    setIsRefreshing(false)
  }

  // İlk yüklemede API'den çek
  useEffect(() => {
    refreshOrders()
  }, [])

  // Otomatik yenileme (her 30 saniye - Pusher yoksa fallback)
  useEffect(() => {
    if (isConnected) return // Pusher varsa polling yapma
    const interval = setInterval(() => {
      refreshOrders()
    }, 30000)
    return () => clearInterval(interval)
  }, [isConnected])

  // Filtrelenmiş siparişler
  const filteredOrders = filter === "ALL"
    ? orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED")
    : orders.filter(o => o.status === filter)

  // Durum sayıları
  const statusCounts: Record<OrderStatus, number> = {
    PENDING: orders.filter(o => o.status === "PENDING").length,
    CONFIRMED: orders.filter(o => o.status === "CONFIRMED").length,
    PREPARING: orders.filter(o => o.status === "PREPARING").length,
    READY: orders.filter(o => o.status === "READY").length,
    DELIVERED: orders.filter(o => o.status === "DELIVERED").length,
    CANCELLED: orders.filter(o => o.status === "CANCELLED").length,
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Canlı Siparişler</h1>
          <p className="text-slate-600">Mutfak ve servis yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Real-time connection status */}
          <div className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${isConnected ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? "Canlı" : "Polling"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? "bg-green-50" : "bg-red-50"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Durum Filtreleri */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
        >
          Tümü ({orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status)).length})
        </Button>
        {(["PENDING", "CONFIRMED", "PREPARING", "READY"] as OrderStatus[]).map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          return (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className={filter === status ? config.color : ""}
            >
              <Icon className="mr-1 h-4 w-4" />
              {config.label} ({statusCounts[status]})
            </Button>
          )
        })}
      </div>

      {/* Sipariş Kartları Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h3 className="text-xl font-semibold text-slate-700">Bekleyen sipariş yok</h3>
          <p className="mt-2 text-slate-500">Yeni siparişler burada görünecek</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status]
            const StatusIcon = config.icon
            const elapsed = getElapsedTime(order.createdAt)
            const isUrgent = order.status === "PENDING" &&
              (Date.now() - new Date(order.createdAt).getTime()) > 5 * 60000

            return (
              <Card
                key={order.id}
                className={`overflow-hidden border-2 ${config.bgLight} ${isUrgent ? "animate-pulse" : ""}`}
              >
                {/* Kart Header */}
                <div className={`${config.color} px-4 py-2 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">#{order.orderNumber}</span>
                      <span className="rounded bg-white/20 px-2 py-0.5 text-sm">
                        Masa {order.tableNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Timer className="h-4 w-4" />
                      {elapsed}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Ürünler */}
                  <div className="mb-4 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between">
                        <div>
                          <span className="font-medium">
                            {item.quantity}x {item.name}
                          </span>
                          {item.notes && (
                            <p className="text-sm text-orange-600">📝 {item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sipariş Notu */}
                  {order.notes && (
                    <div className="mb-4 flex items-start gap-2 rounded bg-yellow-100 p-2 text-sm text-yellow-800">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      {order.notes}
                    </div>
                  )}

                  {/* Durum ve Toplam */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex items-center gap-1 ${config.textColor}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <span className="text-lg font-bold">₺{order.total}</span>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex gap-2">
                    {config.next && (
                      <Button
                        className={`flex-1 ${config.color} hover:opacity-90`}
                        onClick={() => updateOrderStatus(order.id, config.next as OrderStatus)}
                      >
                        {config.nextLabel}
                      </Button>
                    )}
                    {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => cancelOrder(order.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Alt Bilgi */}
      <div className="mt-6 text-center text-sm text-slate-500">
        Sayfa otomatik olarak yenileniyor • Son güncelleme: {new Date().toLocaleTimeString("tr-TR")}
      </div>
    </div>
  )
}

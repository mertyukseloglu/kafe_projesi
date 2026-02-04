"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  XCircle,
  Truck,
  Filter,
  Search,
  MoreVertical,
  Phone,
} from "lucide-react"

// Demo siparişler
const demoOrders = [
  {
    id: "1",
    orderNumber: "S4A2B1",
    tableNumber: "3",
    items: [
      { name: "Latte", quantity: 1, price: 65 },
      { name: "Cheesecake", quantity: 1, price: 85 },
    ],
    total: 150,
    status: "PREPARING",
    notes: "Şeker az olsun",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "2",
    orderNumber: "S4A2B2",
    tableNumber: "7",
    items: [
      { name: "Türk Kahvesi", quantity: 2, price: 90 },
      { name: "Brownie", quantity: 1, price: 75 },
    ],
    total: 165,
    status: "PENDING",
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "3",
    orderNumber: "S4A2B3",
    tableNumber: "1",
    items: [
      { name: "Cappuccino", quantity: 1, price: 60 },
      { name: "Sandviç", quantity: 1, price: 95 },
    ],
    total: 155,
    status: "READY",
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: "4",
    orderNumber: "S4A2B0",
    tableNumber: "5",
    items: [
      { name: "Ice Latte", quantity: 2, price: 140 },
      { name: "Tiramisu", quantity: 1, price: 90 },
    ],
    total: 230,
    status: "DELIVERED",
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
]

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"

const statusConfig: Record<OrderStatus, {
  label: string
  color: string
  bgColor: string
  icon: React.ElementType
  nextStatus?: OrderStatus
  nextLabel?: string
}> = {
  PENDING: {
    label: "Bekliyor",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: Clock,
    nextStatus: "CONFIRMED",
    nextLabel: "Onayla"
  },
  CONFIRMED: {
    label: "Onaylandı",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: CheckCircle2,
    nextStatus: "PREPARING",
    nextLabel: "Hazırlamaya Başla"
  },
  PREPARING: {
    label: "Hazırlanıyor",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    icon: ChefHat,
    nextStatus: "READY",
    nextLabel: "Hazır"
  },
  READY: {
    label: "Hazır",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: Package,
    nextStatus: "DELIVERED",
    nextLabel: "Teslim Et"
  },
  DELIVERED: {
    label: "Teslim Edildi",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: Truck
  },
  CANCELLED: {
    label: "İptal",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: XCircle
  },
}

const filterOptions: { value: string; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "active", label: "Aktif" },
  { value: "PENDING", label: "Bekleyen" },
  { value: "PREPARING", label: "Hazırlanan" },
  { value: "READY", label: "Hazır" },
  { value: "DELIVERED", label: "Teslim Edilmiş" },
]

function formatTimeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000 / 60)
  if (diff < 1) return "Az önce"
  if (diff < 60) return `${diff} dk önce`
  return `${Math.floor(diff / 60)} saat önce`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(demoOrders)
  const [filter, setFilter] = useState("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  // Filtreleme
  const filteredOrders = orders.filter(order => {
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!order.orderNumber.toLowerCase().includes(query) &&
          !order.tableNumber.includes(query)) {
        return false
      }
    }

    // Durum filtresi
    if (filter === "all") return true
    if (filter === "active") {
      return ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(order.status)
    }
    return order.status === filter
  })

  // Sipariş durumu güncelle
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // İstatistikler
  const stats = {
    pending: orders.filter(o => o.status === "PENDING").length,
    preparing: orders.filter(o => o.status === "PREPARING").length,
    ready: orders.filter(o => o.status === "READY").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Siparişler</h1>
          <p className="text-muted-foreground">Sipariş yönetimi ve takibi</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-yellow-600">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-orange-600">Hazırlanan</p>
              <p className="text-2xl font-bold text-orange-700">{stats.preparing}</p>
            </div>
            <ChefHat className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-green-600">Hazır</p>
              <p className="text-2xl font-bold text-green-700">{stats.ready}</p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Sipariş no veya masa ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="whitespace-nowrap"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? "Arama sonucu bulunamadı" : "Bu filtrede sipariş yok"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status as OrderStatus]
            const StatusIcon = status.icon
            const isExpanded = selectedOrder === order.id

            return (
              <Card
                key={order.id}
                className={`transition-shadow ${isExpanded ? "ring-2 ring-primary" : ""}`}
              >
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between p-4"
                    onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold">
                        {order.tableNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">#{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Masa {order.tableNumber} • {formatTimeAgo(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">₺{order.total}</p>
                        <p className="text-xs text-muted-foreground">{order.items.length} ürün</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4 pt-3">
                      {/* Order Items */}
                      <div className="mb-4 space-y-2">
                        <p className="text-sm font-medium">Sipariş Detayı</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-muted-foreground">₺{item.price}</span>
                          </div>
                        ))}
                        {order.notes && (
                          <p className="mt-2 rounded bg-muted p-2 text-sm">
                            <span className="font-medium">Not:</span> {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {status.nextStatus && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, status.nextStatus!)}
                            className="flex-1"
                          >
                            {status.nextLabel}
                          </Button>
                        )}
                        {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                          <Button
                            variant="destructive"
                            onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            İptal
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

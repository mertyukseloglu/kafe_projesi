"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Clock,
  ChefHat,
  Utensils,
  Bell,
  ArrowLeft,
  Phone,
  MessageCircle,
} from "lucide-react"

// Sipariş durumları
const orderSteps = [
  { status: "PENDING", label: "Sipariş Alındı", icon: Bell, description: "Siparişiniz restoran tarafından inceleniyor" },
  { status: "CONFIRMED", label: "Onaylandı", icon: CheckCircle, description: "Siparişiniz onaylandı" },
  { status: "PREPARING", label: "Hazırlanıyor", icon: ChefHat, description: "Siparişiniz mutfakta hazırlanıyor" },
  { status: "READY", label: "Hazır", icon: Utensils, description: "Siparişiniz hazır, masanıza getiriliyor" },
]

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string
}

interface Order {
  id: string
  orderNumber: string
  tableNumber: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  total: number
  createdAt: string
  estimatedTime?: number
}

// Demo sipariş
const getDemoOrder = (orderId: string): Order => ({
  id: orderId,
  orderNumber: "S" + orderId.slice(-3).toUpperCase(),
  tableNumber: "5",
  status: "PREPARING",
  items: [
    { id: "1", name: "Latte", quantity: 2, price: 65 },
    { id: "2", name: "Cheesecake", quantity: 1, price: 55 },
  ],
  subtotal: 185,
  total: 185,
  createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  estimatedTime: 10,
})

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Gerçek API'de: fetch(`/api/public/orders/${orderId}`)
    setTimeout(() => {
      setOrder(getDemoOrder(orderId))
      setLoading(false)
    }, 500)
  }, [orderId])

  // Simüle sipariş durumu güncelleme (demo için)
  useEffect(() => {
    if (!order) return

    const statusOrder: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED"]
    const currentIndex = statusOrder.indexOf(order.status)

    if (currentIndex < statusOrder.length - 1 && currentIndex < 3) {
      const timer = setTimeout(() => {
        setOrder(prev => prev ? {
          ...prev,
          status: statusOrder[currentIndex + 1]
        } : null)
      }, 15000) // Her 15 saniyede bir durum ilerlet (demo)

      return () => clearTimeout(timer)
    }
  }, [order?.status])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="mt-4 text-slate-600">Sipariş yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold">Sipariş Bulunamadı</h2>
            <p className="mt-2 text-slate-600">Bu sipariş numarası geçersiz veya süresi dolmuş olabilir.</p>
            <Button asChild className="mt-6">
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStepIndex = orderSteps.findIndex(s => s.status === order.status)
  const isDelivered = order.status === "DELIVERED"
  const isCancelled = order.status === "CANCELLED"

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Geri</span>
            </Link>
            <span className="font-semibold text-orange-600">#{order.orderNumber}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Durum Kartı */}
        <Card className="mb-6 overflow-hidden">
          <div className={`p-6 text-center text-white ${
            isCancelled ? "bg-red-500" : isDelivered ? "bg-green-500" : "bg-orange-500"
          }`}>
            {isCancelled ? (
              <>
                <h1 className="text-2xl font-bold">Sipariş İptal Edildi</h1>
                <p className="mt-2 opacity-90">Siparişiniz iptal edilmiştir</p>
              </>
            ) : isDelivered ? (
              <>
                <CheckCircle className="mx-auto h-16 w-16" />
                <h1 className="mt-4 text-2xl font-bold">Afiyet Olsun!</h1>
                <p className="mt-2 opacity-90">Siparişiniz teslim edildi</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                  {(() => {
                    const CurrentIcon = orderSteps[currentStepIndex]?.icon || Clock
                    return <CurrentIcon className="h-10 w-10" />
                  })()}
                </div>
                <h1 className="mt-4 text-2xl font-bold">{orderSteps[currentStepIndex]?.label}</h1>
                <p className="mt-2 opacity-90">{orderSteps[currentStepIndex]?.description}</p>
                {order.estimatedTime && order.status !== "READY" && (
                  <p className="mt-4 text-lg">
                    Tahmini süre: <span className="font-bold">~{order.estimatedTime} dakika</span>
                  </p>
                )}
              </>
            )}
          </div>
        </Card>

        {/* İlerleme Çubuğu */}
        {!isCancelled && !isDelivered && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                {/* Çizgi */}
                <div className="absolute left-5 top-0 h-full w-0.5 bg-slate-200" />
                <div
                  className="absolute left-5 top-0 w-0.5 bg-orange-500 transition-all duration-500"
                  style={{ height: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
                />

                {/* Adımlar */}
                <div className="space-y-6">
                  {orderSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const StepIcon = step.icon

                    return (
                      <div key={step.status} className="relative flex items-center gap-4">
                        <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                          isCompleted ? "bg-orange-500 text-white" :
                          isCurrent ? "bg-orange-500 text-white animate-pulse" :
                          "bg-slate-200 text-slate-400"
                        }`}>
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`font-medium ${isCurrent ? "text-orange-600" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-slate-500">{step.description}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sipariş Detayları */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Sipariş Detayları</h3>
            <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
              <span>Masa {order.tableNumber}</span>
              <span>{new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                  </span>
                  <span className="font-medium">₺{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Toplam</span>
                <span>₺{order.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yardım Butonları */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <Bell className="h-6 w-6" />
            <span>Garson Çağır</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <MessageCircle className="h-6 w-6" />
            <span>Mesaj Gönder</span>
          </Button>
        </div>

        {/* Alt Bilgi */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Sipariş durumu otomatik olarak güncellenir
        </p>
      </div>
    </div>
  )
}

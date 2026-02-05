"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  ChefHat,
  Utensils,
  Bell,
  ArrowLeft,
  Phone,
  MessageCircle,
  Star,
  Gift,
  Sparkles,
  XCircle,
  Package,
} from "lucide-react"

// Sipariş durumları
const orderSteps = [
  { status: "PENDING", label: "Sipariş Alındı", icon: Bell, description: "Siparişiniz restoran tarafından inceleniyor", color: "bg-yellow-500" },
  { status: "CONFIRMED", label: "Onaylandı", icon: CheckCircle, description: "Siparişiniz onaylandı ve hazırlanmaya başlanacak", color: "bg-blue-500" },
  { status: "PREPARING", label: "Hazırlanıyor", icon: ChefHat, description: "Siparişiniz mutfakta özenle hazırlanıyor", color: "bg-orange-500" },
  { status: "READY", label: "Hazır", icon: Utensils, description: "Siparişiniz hazır, masanıza getiriliyor!", color: "bg-green-500" },
]

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"

interface SelectedVariation {
  variationName: string
  optionName: string
}

interface SelectedExtra {
  name: string
  price: number
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string
  selectedVariations?: SelectedVariation[]
  selectedExtras?: SelectedExtra[]
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
  loyaltyPointsEarned?: number
}

// Demo sipariş
const getDemoOrder = (orderId: string): Order => ({
  id: orderId,
  orderNumber: "S" + orderId.slice(-3).toUpperCase(),
  tableNumber: "5",
  status: "PREPARING",
  items: [
    {
      id: "1",
      name: "Latte",
      quantity: 2,
      price: 83,
      selectedVariations: [
        { variationName: "Boyut", optionName: "Medium" },
        { variationName: "Süt", optionName: "Yulaf Sütü" },
      ],
      selectedExtras: [{ name: "Ekstra Shot", price: 12 }],
    },
    {
      id: "2",
      name: "Cheesecake",
      quantity: 1,
      price: 100,
      selectedVariations: [{ variationName: "Sos", optionName: "Çikolata" }],
      selectedExtras: [{ name: "Dondurma", price: 15 }],
    },
  ],
  subtotal: 266,
  total: 266,
  createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  estimatedTime: 10,
  loyaltyPointsEarned: 27,
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Sipariş yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold">Sipariş Bulunamadı</h2>
            <p className="mt-2 text-muted-foreground">Bu sipariş numarası geçersiz veya süresi dolmuş olabilir.</p>
            <Button asChild className="mt-6 rounded-xl">
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
  const currentStep = orderSteps[currentStepIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Geri</span>
            </Link>
            <Badge variant="outline" className="text-sm font-semibold">
              #{order.orderNumber}
            </Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Durum Kartı */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className={`p-8 text-center text-white ${
            isCancelled ? "bg-gradient-to-br from-red-500 to-red-600" :
            isDelivered ? "bg-gradient-to-br from-green-500 to-green-600" :
            `bg-gradient-to-br from-primary to-primary/80`
          }`}>
            {isCancelled ? (
              <>
                <XCircle className="mx-auto h-20 w-20" />
                <h1 className="mt-4 text-2xl font-bold">Sipariş İptal Edildi</h1>
                <p className="mt-2 opacity-90">Siparişiniz iptal edilmiştir</p>
              </>
            ) : isDelivered ? (
              <>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20">
                  <Sparkles className="h-12 w-12" />
                </div>
                <h1 className="mt-4 text-3xl font-bold">Afiyet Olsun!</h1>
                <p className="mt-2 opacity-90">Siparişiniz teslim edildi</p>
                {order.loyaltyPointsEarned && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-semibold">+{order.loyaltyPointsEarned} puan kazandınız!</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 animate-pulse">
                  {currentStep && (() => {
                    const CurrentIcon = currentStep.icon
                    return <CurrentIcon className="h-12 w-12" />
                  })()}
                </div>
                <h1 className="mt-4 text-3xl font-bold">{currentStep?.label}</h1>
                <p className="mt-2 opacity-90">{currentStep?.description}</p>
                {order.estimatedTime && order.status !== "READY" && (
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Tahmini: ~{order.estimatedTime} dakika</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Loyalty Points Indicator (not delivered yet) */}
          {!isDelivered && !isCancelled && order.loyaltyPointsEarned && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-3 flex items-center justify-center gap-2">
              <Gift className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">
                Bu siparişten <strong>+{order.loyaltyPointsEarned}</strong> puan kazanacaksınız!
              </span>
            </div>
          )}
        </Card>

        {/* İlerleme Çubuğu */}
        {!isCancelled && !isDelivered && (
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                {/* Background line */}
                <div className="absolute left-5 top-0 h-full w-0.5 bg-muted" />
                {/* Progress line */}
                <div
                  className="absolute left-5 top-0 w-0.5 bg-primary transition-all duration-1000 ease-out"
                  style={{ height: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                <div className="space-y-6">
                  {orderSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const StepIcon = step.icon

                    return (
                      <div key={step.status} className="relative flex items-center gap-4">
                        <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-primary text-primary-foreground scale-100" :
                          isCurrent ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <StepIcon className={`h-5 w-5 ${isCurrent ? "animate-pulse" : ""}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold transition-colors ${
                            isCurrent ? "text-primary" :
                            isCompleted ? "text-foreground" :
                            "text-muted-foreground"
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                          )}
                        </div>
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Tamam
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sipariş Detayları */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Sipariş Detayları
              </h3>
              <div className="text-sm text-muted-foreground">
                Masa {order.tableNumber}
              </div>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-xl bg-muted/50 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {item.quantity}
                        </span>
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      {/* Variations */}
                      {item.selectedVariations && item.selectedVariations.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 ml-8">
                          {item.selectedVariations.map(v => v.optionName).join(" • ")}
                        </p>
                      )}
                      {/* Extras */}
                      {item.selectedExtras && item.selectedExtras.length > 0 && (
                        <p className="text-xs text-primary mt-0.5 ml-8">
                          + {item.selectedExtras.map(e => e.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-bold">₺{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-xl font-bold">
                <span>Toplam</span>
                <span>₺{order.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(order.createdAt).toLocaleString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Yardım Butonları */}
        {!isDelivered && !isCancelled && (
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-5 rounded-xl">
              <div className="p-2 rounded-full bg-orange-100">
                <Phone className="h-6 w-6 text-orange-600" />
              </div>
              <span className="font-medium">Garson Çağır</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-5 rounded-xl">
              <div className="p-2 rounded-full bg-blue-100">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium">Mesaj Gönder</span>
            </Button>
          </div>
        )}

        {/* Alt Bilgi */}
        <p className="text-center text-sm text-muted-foreground">
          Sipariş durumu otomatik olarak güncellenir
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Calendar,
  Percent,
  Repeat,
  UserPlus,
  Star,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { useFetch } from "@/hooks/use-api"

interface AnalyticsData {
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    conversionRate: number
    cancelRate: number
  }
  comparison: {
    revenueDiff: number
    ordersDiff: number
    customersDiff: number
    avgOrderDiff: number
  }
  trends: {
    revenueGrowth: number[]
    orderGrowth: number[]
  }
  peakHours: { hour: number; orders: number; revenue: number }[]
  customerMetrics: {
    retentionRate: number
    repeatPurchaseRate: number
    averageLifetimeValue: number
    churnRate: number
  }
  topPerformingDays: { day: string; revenue: number; orders: number }[]
  recommendations: { type: "success" | "warning" | "info"; title: string; description: string }[]
}

// Demo analytics data
const demoAnalytics: AnalyticsData = {
  summary: {
    totalRevenue: 45680,
    totalOrders: 386,
    averageOrderValue: 118.34,
    totalCustomers: 142,
    newCustomers: 38,
    returningCustomers: 104,
    conversionRate: 68,
    cancelRate: 3.2,
  },
  comparison: {
    revenueDiff: 12.5,
    ordersDiff: 8.3,
    customersDiff: 15.2,
    avgOrderDiff: 4.1,
  },
  trends: {
    revenueGrowth: [85, 92, 88, 95, 102, 98, 110],
    orderGrowth: [42, 48, 45, 52, 55, 51, 58],
  },
  peakHours: [
    { hour: 9, orders: 12, revenue: 1200 },
    { hour: 10, orders: 18, revenue: 1800 },
    { hour: 11, orders: 25, revenue: 2500 },
    { hour: 12, orders: 42, revenue: 4200 },
    { hour: 13, orders: 48, revenue: 4800 },
    { hour: 14, orders: 35, revenue: 3500 },
    { hour: 15, orders: 28, revenue: 2800 },
    { hour: 16, orders: 32, revenue: 3200 },
    { hour: 17, orders: 45, revenue: 4500 },
    { hour: 18, orders: 55, revenue: 5500 },
    { hour: 19, orders: 52, revenue: 5200 },
    { hour: 20, orders: 38, revenue: 3800 },
    { hour: 21, orders: 22, revenue: 2200 },
  ],
  customerMetrics: {
    retentionRate: 73,
    repeatPurchaseRate: 45,
    averageLifetimeValue: 856,
    churnRate: 12,
  },
  topPerformingDays: [
    { day: "Cumartesi", revenue: 8450, orders: 72 },
    { day: "Pazar", revenue: 7820, orders: 65 },
    { day: "Cuma", revenue: 6540, orders: 58 },
    { day: "Perşembe", revenue: 5890, orders: 52 },
    { day: "Çarşamba", revenue: 5680, orders: 48 },
  ],
  recommendations: [
    {
      type: "success",
      title: "Öğle saatleri güçlü performans",
      description: "12:00-14:00 arası en yoğun dönem. Bu saatlerde ekstra personel planlaması yapabilirsiniz.",
    },
    {
      type: "warning",
      title: "Sabah saatleri potansiyel",
      description: "09:00-11:00 arası sipariş sayısı düşük. Kahvaltı menüsü veya sabah indirimi düşünebilirsiniz.",
    },
    {
      type: "info",
      title: "Müşteri sadakati artıyor",
      description: "Tekrar eden müşteri oranı %45. Sadakat programı ile bu oranı %60'a çıkarmayı hedefleyebilirsiniz.",
    },
    {
      type: "success",
      title: "Hafta sonu başarılı",
      description: "Cumartesi ve Pazar günleri ciro ortalamanın %35 üzerinde. Hafta içi kampanyalarla dengeleyebilirsiniz.",
    },
  ],
}

// Period options
const periodOptions = [
  { value: "week", label: "Son 7 Gün" },
  { value: "month", label: "Son 30 Gün" },
  { value: "quarter", label: "Son 3 Ay" },
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data, isLoading, refetch } = useFetch<AnalyticsData>(
    `/api/tenant/analytics?period=${selectedPeriod}`
  )

  // Use API data or demo
  const analytics = data || demoAnalytics

  useEffect(() => {
    refetch()
  }, [selectedPeriod, refetch])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const formatChange = (change: number, inverse: boolean = false) => {
    const isPositive = inverse ? change < 0 : change > 0
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(change).toFixed(1)}%
      </span>
    )
  }

  const maxPeakOrders = Math.max(...analytics.peakHours.map(h => h.orders), 1)
  const peakHour = analytics.peakHours.reduce((max, h) => h.orders > max.orders ? h : max, analytics.peakHours[0])

  if (isLoading && !analytics) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Analiz verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">İş Analizi</h1>
          <p className="text-muted-foreground">Detaylı performans metrikleri ve AI destekli öneriler</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>
      </div>

      {/* AI Recommendations */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Destekli Öneriler
          </CardTitle>
          <CardDescription>Verilerinize dayalı akıllı iş önerileri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {analytics.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg border p-4 ${
                  rec.type === "success" ? "border-green-200 bg-green-50" :
                  rec.type === "warning" ? "border-yellow-200 bg-yellow-50" :
                  "border-blue-200 bg-blue-50"
                }`}
              >
                {rec.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                ) : rec.type === "warning" ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                ) : (
                  <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${
                    rec.type === "success" ? "text-green-900" :
                    rec.type === "warning" ? "text-yellow-900" :
                    "text-blue-900"
                  }`}>{rec.title}</p>
                  <p className={`text-sm mt-1 ${
                    rec.type === "success" ? "text-green-700" :
                    rec.type === "warning" ? "text-yellow-700" :
                    "text-blue-700"
                  }`}>{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                <p className="mt-1 text-2xl font-bold">₺{analytics.summary.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {formatChange(analytics.comparison.revenueDiff)}
              <span className="text-xs text-muted-foreground">vs önceki dönem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sipariş Sayısı</p>
                <p className="mt-1 text-2xl font-bold">{analytics.summary.totalOrders}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {formatChange(analytics.comparison.ordersDiff)}
              <span className="text-xs text-muted-foreground">vs önceki dönem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Sepet</p>
                <p className="mt-1 text-2xl font-bold">₺{analytics.summary.averageOrderValue.toFixed(0)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {formatChange(analytics.comparison.avgOrderDiff)}
              <span className="text-xs text-muted-foreground">vs önceki dönem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dönüşüm Oranı</p>
                <p className="mt-1 text-2xl font-bold">%{analytics.summary.conversionRate}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Percent className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                İptal: %{analytics.summary.cancelRate}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Müşteri</p>
                <p className="text-xl font-bold">{analytics.summary.totalCustomers}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Badge variant="outline" className="text-xs">
                <UserPlus className="mr-1 h-3 w-3" />
                {analytics.summary.newCustomers} yeni
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Repeat className="mr-1 h-3 w-3" />
                {analytics.summary.returningCustomers} tekrar
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Repeat className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Müşteri Tutma</p>
                <p className="text-xl font-bold">%{analytics.customerMetrics.retentionRate}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${analytics.customerMetrics.retentionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tekrar Alım</p>
                <p className="text-xl font-bold">%{analytics.customerMetrics.repeatPurchaseRate}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${analytics.customerMetrics.repeatPurchaseRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Müşteri Değeri</p>
                <p className="text-xl font-bold">₺{analytics.customerMetrics.averageLifetimeValue}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Ortalama yaşam boyu değer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Peak Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Saatlik Yoğunluk Analizi
            </CardTitle>
            <CardDescription>
              En yoğun saat: {peakHour?.hour}:00 ({peakHour?.orders} sipariş)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-1">
              {analytics.peakHours.map((hour) => (
                <div key={hour.hour} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${
                      hour.hour === peakHour?.hour ? "bg-primary" : "bg-primary/40"
                    } hover:bg-primary/80`}
                    style={{ height: `${(hour.orders / maxPeakOrders) * 160}px` }}
                  />
                  <p className="text-[10px] text-muted-foreground">{hour.hour}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p className="text-muted-foreground">Düşük yoğunluk</p>
                <p className="font-medium">09:00 - 11:00</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Yüksek yoğunluk</p>
                <p className="font-medium">12:00 - 14:00, 17:00 - 19:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              En İyi Günler
            </CardTitle>
            <CardDescription>Ciro bazında en yüksek performans gösteren günler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformingDays.map((day, index) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                    index === 1 ? "bg-gray-100 text-gray-700" :
                    index === 2 ? "bg-amber-100 text-amber-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{day.day}</p>
                      <p className="font-semibold">₺{day.revenue.toLocaleString()}</p>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{day.orders} sipariş</span>
                      <span>Ort: ₺{(day.revenue / day.orders).toFixed(0)}/sipariş</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${
                          index === 0 ? "bg-yellow-500" :
                          index === 1 ? "bg-gray-400" :
                          index === 2 ? "bg-amber-500" :
                          "bg-primary/50"
                        }`}
                        style={{ width: `${(day.revenue / analytics.topPerformingDays[0].revenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Büyüme Trendi
          </CardTitle>
          <CardDescription>Son 7 günlük ciro ve sipariş değişimi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-3">Günlük Ciro (₺K)</p>
              <div className="flex h-32 items-end gap-2">
                {analytics.trends.revenueGrowth.map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-green-500/70 hover:bg-green-500 transition-all"
                      style={{ height: `${(value / Math.max(...analytics.trends.revenueGrowth)) * 100}px` }}
                    />
                    <p className="text-[10px] text-muted-foreground">{["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"][index]}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Günlük Sipariş</p>
              <div className="flex h-32 items-end gap-2">
                {analytics.trends.orderGrowth.map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-blue-500/70 hover:bg-blue-500 transition-all"
                      style={{ height: `${(value / Math.max(...analytics.trends.orderGrowth)) * 100}px` }}
                    />
                    <p className="text-[10px] text-muted-foreground">{["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"][index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

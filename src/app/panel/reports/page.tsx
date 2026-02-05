"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Users,
  Clock,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  Cake,
  GlassWater,
  Sandwich,
} from "lucide-react"

// Demo veri
const periodOptions = [
  { value: "today", label: "Bugün" },
  { value: "yesterday", label: "Dün" },
  { value: "week", label: "Bu Hafta" },
  { value: "month", label: "Bu Ay" },
  { value: "quarter", label: "Son 3 Ay" },
  { value: "year", label: "Bu Yıl" },
]

const summaryStats = {
  today: {
    revenue: 2450,
    revenueChange: 12,
    orders: 32,
    ordersChange: 8,
    avgTicket: 76.5,
    avgTicketChange: 3.5,
    customers: 28,
    customersChange: 15,
  },
  week: {
    revenue: 15680,
    revenueChange: 18,
    orders: 198,
    ordersChange: 12,
    avgTicket: 79.2,
    avgTicketChange: 5,
    customers: 156,
    customersChange: 22,
  },
}

const dailySales = [
  { day: "Pzt", revenue: 1850, orders: 24 },
  { day: "Sal", revenue: 2100, orders: 28 },
  { day: "Çar", revenue: 1950, orders: 26 },
  { day: "Per", revenue: 2300, orders: 30 },
  { day: "Cum", revenue: 2850, orders: 38 },
  { day: "Cmt", revenue: 3200, orders: 42 },
  { day: "Paz", revenue: 2450, orders: 32 },
]

const topProducts = [
  { name: "Latte", quantity: 145, revenue: 9425, icon: Coffee },
  { name: "Cheesecake", quantity: 98, revenue: 8330, icon: Cake },
  { name: "Türk Kahvesi", quantity: 89, revenue: 4005, icon: Coffee },
  { name: "Cappuccino", quantity: 76, revenue: 4560, icon: Coffee },
  { name: "Sandviç", quantity: 62, revenue: 5890, icon: Sandwich },
  { name: "Ice Latte", quantity: 58, revenue: 4060, icon: GlassWater },
  { name: "Tiramisu", quantity: 45, revenue: 4050, icon: Cake },
  { name: "Limonata", quantity: 42, revenue: 1890, icon: GlassWater },
]

const categoryBreakdown = [
  { name: "Sıcak İçecekler", percentage: 45, revenue: 7056, color: "bg-orange-500" },
  { name: "Tatlılar", percentage: 28, revenue: 4390, color: "bg-pink-500" },
  { name: "Soğuk İçecekler", percentage: 17, revenue: 2666, color: "bg-blue-500" },
  { name: "Atıştırmalıklar", percentage: 10, revenue: 1568, color: "bg-green-500" },
]

const hourlyData = [
  { hour: "09:00", orders: 8 },
  { hour: "10:00", orders: 15 },
  { hour: "11:00", orders: 22 },
  { hour: "12:00", orders: 35 },
  { hour: "13:00", orders: 42 },
  { hour: "14:00", orders: 28 },
  { hour: "15:00", orders: 32 },
  { hour: "16:00", orders: 38 },
  { hour: "17:00", orders: 45 },
  { hour: "18:00", orders: 52 },
  { hour: "19:00", orders: 48 },
  { hour: "20:00", orders: 35 },
  { hour: "21:00", orders: 22 },
  { hour: "22:00", orders: 12 },
]

const recentOrders = [
  { id: "S048", time: "14:32", items: 4, total: 185, status: "Teslim Edildi" },
  { id: "S047", time: "14:15", items: 2, total: 95, status: "Teslim Edildi" },
  { id: "S046", time: "13:58", items: 3, total: 145, status: "Teslim Edildi" },
  { id: "S045", time: "13:42", items: 1, total: 65, status: "Teslim Edildi" },
  { id: "S044", time: "13:25", items: 5, total: 220, status: "Teslim Edildi" },
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  const stats = selectedPeriod === "today" ? summaryStats.today : summaryStats.week
  const maxDailyRevenue = Math.max(...dailySales.map((d) => d.revenue))
  const maxHourlyOrders = Math.max(...hourlyData.map((h) => h.orders))

  const formatChange = (change: number) => {
    const isPositive = change > 0
    return (
      <span className={`flex items-center text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(change)}%
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground">Satış ve performans analizleri</p>
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Özet İstatistikler */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                <p className="mt-1 text-2xl font-bold">₺{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2">{formatChange(stats.revenueChange)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sipariş Sayısı</p>
                <p className="mt-1 text-2xl font-bold">{stats.orders}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">{formatChange(stats.ordersChange)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Sepet</p>
                <p className="mt-1 text-2xl font-bold">₺{stats.avgTicket.toFixed(0)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">{formatChange(stats.avgTicketChange)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Müşteri Sayısı</p>
                <p className="mt-1 text-2xl font-bold">{stats.customers}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2">{formatChange(stats.customersChange)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Günlük Satış Grafiği */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Günlük Satış</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-2">
              {dailySales.map((day) => (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full">
                    <div
                      className="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
                      style={{ height: `${(day.revenue / maxDailyRevenue) * 180}px` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{day.day}</p>
                    <p className="text-xs text-muted-foreground">₺{(day.revenue / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Saatlik Sipariş Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saatlik Yoğunluk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-1">
              {hourlyData.map((hour) => (
                <div key={hour.hour} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-400"
                    style={{ height: `${(hour.orders / maxHourlyOrders) * 180}px` }}
                  />
                  <p className="text-[10px] text-muted-foreground">{hour.hour.split(":")[0]}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">En yoğun saat: 18:00 - 19:00</p>
          </CardContent>
        </Card>
      </div>

      {/* Alt Kısım */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* En Çok Satanlar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">En Çok Satan Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.slice(0, 6).map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <product.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity} adet satıldı</p>
                  </div>
                  <p className="font-semibold">₺{product.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kategori Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kategori Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{cat.name}</span>
                    <span className="font-medium">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${cat.color} transition-all`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">₺{cat.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Pie Chart Temsili */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative h-32 w-32">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeDasharray="45, 100"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="3"
                    strokeDasharray="28, 100"
                    strokeDashoffset="-45"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="17, 100"
                    strokeDashoffset="-73"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-90"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-bold">₺15.7K</p>
                    <p className="text-xs text-muted-foreground">Toplam</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Son Siparişler */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Son Siparişler</CardTitle>
          <Button variant="link" className="text-sm">
            Tümünü Gör →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Sipariş No</th>
                  <th className="pb-3 font-medium">Saat</th>
                  <th className="pb-3 font-medium">Ürün</th>
                  <th className="pb-3 font-medium">Tutar</th>
                  <th className="pb-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">#{order.id}</td>
                    <td className="py-3 text-muted-foreground">{order.time}</td>
                    <td className="py-3">{order.items} ürün</td>
                    <td className="py-3 font-semibold">₺{order.total}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

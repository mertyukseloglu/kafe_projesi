"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  Plus,
  QrCode,
  ArrowRight,
  RefreshCw,
} from "lucide-react"

// Demo veriler
const demoStats = {
  activeOrders: 3,
  pendingOrders: 1,
  todayRevenue: 1250,
  todayOrders: 18,
  occupiedTables: 6,
  totalTables: 10,
  monthlyOrders: 342,
  monthlyLimit: -1, // -1 = sınırsız
  revenueChange: 12.5,
}

const demoOrders = [
  {
    id: "1",
    orderNumber: "S4A2B1",
    tableNumber: "3",
    items: ["Latte", "Cheesecake"],
    total: 150,
    status: "PREPARING",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "2",
    orderNumber: "S4A2B2",
    tableNumber: "7",
    items: ["Türk Kahvesi x2", "Brownie"],
    total: 165,
    status: "PENDING",
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "3",
    orderNumber: "S4A2B3",
    tableNumber: "1",
    items: ["Cappuccino", "Sandviç"],
    total: 155,
    status: "READY",
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
  },
]

const demoPopularItems = [
  { name: "Latte", count: 45, revenue: 2925 },
  { name: "Türk Kahvesi", count: 38, revenue: 1710 },
  { name: "Cheesecake", count: 24, revenue: 2040 },
  { name: "Cappuccino", count: 22, revenue: 1320 },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Onaylandı", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  PREPARING: { label: "Hazırlanıyor", color: "bg-orange-100 text-orange-800", icon: ChefHat },
  READY: { label: "Hazır", color: "bg-green-100 text-green-800", icon: Package },
}

function formatTimeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000 / 60)
  if (diff < 1) return "Az önce"
  if (diff < 60) return `${diff} dk önce`
  return `${Math.floor(diff / 60)} saat önce`
}

export default function TenantDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Bugünün özeti ve canlı veriler</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Aktif Siparişler</CardDescription>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{demoStats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">{demoStats.pendingOrders} bekliyor</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Bugünün Cirosu</CardDescription>
            {demoStats.revenueChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₺{demoStats.todayRevenue.toLocaleString("tr-TR")}</div>
            <p className="text-xs text-muted-foreground">
              <span className={demoStats.revenueChange >= 0 ? "text-green-600" : "text-red-600"}>
                {demoStats.revenueChange >= 0 ? "+" : ""}{demoStats.revenueChange}%
              </span>{" "}
              düne göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Dolu Masalar</CardDescription>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {demoStats.occupiedTables}/{demoStats.totalTables}
            </div>
            <p className="text-xs text-muted-foreground">
              Doluluk: %{Math.round((demoStats.occupiedTables / demoStats.totalTables) * 100)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Aylık Sipariş</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{demoStats.monthlyOrders}</div>
            <p className="text-xs text-muted-foreground">
              Kalan limit: {demoStats.monthlyLimit === -1 ? "∞" : demoStats.monthlyLimit - demoStats.monthlyOrders}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Canlı Siparişler</CardTitle>
            <CardDescription>Aktif siparişlerin durumu</CardDescription>
          </div>
          <Link href="/panel/orders">
            <Button variant="outline" size="sm">
              Tümünü Gör
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {demoOrders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Henüz aktif sipariş yok. Müşteriler QR kod tarayarak sipariş verebilir.
            </p>
          ) : (
            <div className="space-y-3">
              {demoOrders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium">
                        {order.tableNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₺{order.total}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(order.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle>Popüler Ürünler</CardTitle>
            <CardDescription>Bu hafta en çok satan ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoPopularItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₺{item.revenue.toLocaleString("tr-TR")}</p>
                    <p className="text-xs text-muted-foreground">{item.count} adet</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Sık kullanılan işlemler</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href="/panel/menu/new">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                <Plus className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Yeni Ürün</p>
                  <p className="text-xs text-muted-foreground">Menüye ekle</p>
                </div>
              </Button>
            </Link>
            <Link href="/panel/tables/new">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                <Plus className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Yeni Masa</p>
                  <p className="text-xs text-muted-foreground">Masa ekle</p>
                </div>
              </Button>
            </Link>
            <Link href="/panel/tables">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                <QrCode className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">QR Kodları</p>
                  <p className="text-xs text-muted-foreground">İndir / Yazdır</p>
                </div>
              </Button>
            </Link>
            <Link href="/panel/reports">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Raporlar</p>
                  <p className="text-xs text-muted-foreground">Satış analizi</p>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

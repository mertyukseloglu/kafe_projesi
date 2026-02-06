"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  Loader2,
  Users,
  Award,
  Eye,
  MousePointer,
} from "lucide-react"
import { useFetch, API } from "@/hooks/use-api"
import { DashboardSkeleton } from "@/components/ui/skeleton"

// Tip tanımları
interface DashboardData {
  today: { orders: number; revenue: number }
  pending: number
  month: { orders: number; revenue: number }
  customers: number
  revenueChange: number
  loyalty: {
    totalPoints: number
    tiers: { BRONZE: number; SILVER: number; GOLD: number; PLATINUM: number }
  }
  sessions: {
    today: number
    avgPageViews: number
    avgItemViews: number
  }
  popularItems: { id: string; name: string; price: number; quantity: number }[]
  recentOrders: {
    id: string
    orderNumber: string
    table: string | null
    status: string
    total: number
    items: { name: string; quantity: number }[]
    createdAt: string
  }[]
}

// Demo veriler (API başarısız olursa fallback)
const demoStats = {
  activeOrders: 3,
  pendingOrders: 1,
  todayRevenue: 1250,
  todayOrders: 18,
  occupiedTables: 6,
  totalTables: 10,
  monthlyOrders: 342,
  monthlyLimit: -1,
  revenueChange: 12.5,
  customers: 45,
}

const demoLoyalty = {
  totalPoints: 12500,
  tiers: { BRONZE: 25, SILVER: 12, GOLD: 6, PLATINUM: 2 },
}

const demoSessions = {
  today: 23,
  avgPageViews: 4.2,
  avgItemViews: 8.5,
}

const demoOrders = [
  {
    id: "1",
    orderNumber: "S4A2B1",
    table: "3",
    items: [{ name: "Latte", quantity: 1 }, { name: "Cheesecake", quantity: 1 }],
    total: 150,
    status: "PREPARING",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    orderNumber: "S4A2B2",
    table: "7",
    items: [{ name: "Türk Kahvesi", quantity: 2 }, { name: "Brownie", quantity: 1 }],
    total: 165,
    status: "PENDING",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "S4A2B3",
    table: "1",
    items: [{ name: "Cappuccino", quantity: 1 }, { name: "Sandviç", quantity: 1 }],
    total: 155,
    status: "READY",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
]

const demoPopularItems = [
  { id: "1", name: "Latte", quantity: 45, price: 65 },
  { id: "2", name: "Türk Kahvesi", quantity: 38, price: 45 },
  { id: "3", name: "Cheesecake", quantity: 24, price: 85 },
  { id: "4", name: "Cappuccino", quantity: 22, price: 60 },
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
  const { data, isLoading, refetch } = useFetch<DashboardData>(API.tenant.dashboard)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  // Use API data or fallback to demo
  const stats = {
    activeOrders: data?.pending || demoStats.activeOrders,
    pendingOrders: data?.recentOrders?.filter(o => o.status === "PENDING").length || demoStats.pendingOrders,
    todayRevenue: data?.today?.revenue || demoStats.todayRevenue,
    todayOrders: data?.today?.orders || demoStats.todayOrders,
    monthlyOrders: data?.month?.orders || demoStats.monthlyOrders,
    monthlyLimit: -1,
    revenueChange: data?.revenueChange ?? demoStats.revenueChange,
    customers: data?.customers || demoStats.customers,
  }

  const loyalty = data?.loyalty || demoLoyalty
  const sessions = data?.sessions || demoSessions

  const orders = data?.recentOrders?.filter(o =>
    ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status)
  ) || demoOrders

  const popularItems = data?.popularItems || demoPopularItems

  // Tier toplam hesaplama
  const totalTierCustomers = Object.values(loyalty.tiers).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Bugünün özeti ve canlı veriler</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          )}
          {isLoading ? "Yükleniyor..." : "Yenile"}
        </Button>
      </div>

      {/* Stats Cards - Satır 1 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Aktif Siparişler</CardDescription>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">{stats.pendingOrders} bekliyor</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Bugünün Cirosu</CardDescription>
            {stats.revenueChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₺{stats.todayRevenue.toLocaleString("tr-TR")}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.revenueChange >= 0 ? "+" : ""}{stats.revenueChange}%
              </span>{" "}
              düne göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Bugünün Siparişi</CardDescription>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              Toplam sipariş adedi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Aylık Sipariş</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.monthlyOrders}</div>
            <p className="text-xs text-muted-foreground">
              Kalan limit: {stats.monthlyLimit === -1 ? "∞" : stats.monthlyLimit - stats.monthlyOrders}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Satır 2: Müşteri & Analitik */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Toplam Müşteri</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı müşteri sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Bugünkü Ziyaret</CardDescription>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessions.today}</div>
            <p className="text-xs text-muted-foreground">
              Ort. {sessions.avgPageViews} sayfa görüntüleme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Ürün İnceleme</CardDescription>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessions.avgItemViews}</div>
            <p className="text-xs text-muted-foreground">
              Ort. ürün görüntüleme/ziyaret
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Sadakat Puanı</CardDescription>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loyalty.totalPoints.toLocaleString("tr-TR")}</div>
            <p className="text-xs text-muted-foreground">
              Toplam dağıtılan puan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Müşteri Sadakat Dağılımı
          </CardTitle>
          <CardDescription>Tier bazında müşteri sayıları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { tier: "BRONZE", label: "Bronze", color: "bg-amber-600", count: loyalty.tiers.BRONZE },
              { tier: "SILVER", label: "Silver", color: "bg-gray-400", count: loyalty.tiers.SILVER },
              { tier: "GOLD", label: "Gold", color: "bg-yellow-500", count: loyalty.tiers.GOLD },
              { tier: "PLATINUM", label: "Platinum", color: "bg-purple-500", count: loyalty.tiers.PLATINUM },
            ].map((t) => (
              <div key={t.tier} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className="text-sm text-muted-foreground">{t.count}</span>
                </div>
                <Progress
                  value={totalTierCustomers > 0 ? (t.count / totalTierCustomers) * 100 : 0}
                  className="h-2"
                  indicatorClassName={t.color}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
          {orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Henüz aktif sipariş yok. Müşteriler QR kod tarayarak sipariş verebilir.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => {
                const status = statusConfig[order.status] || statusConfig.PENDING
                const StatusIcon = status.icon
                const itemsText = order.items.map(i =>
                  i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name
                ).join(", ")
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium">
                        {order.table || "-"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {itemsText}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₺{order.total}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(new Date(order.createdAt))}</p>
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
              {popularItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₺{(item.price * item.quantity).toLocaleString("tr-TR")}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} adet</p>
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

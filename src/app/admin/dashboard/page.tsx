"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Store,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react"

// Demo veriler
const demoStats = {
  totalRestaurants: 12,
  newThisMonth: 3,
  activeSubscriptions: 10,
  trialSubscriptions: 2,
  todayOrders: 156,
  todayRevenue: 24850,
  mrr: 5990,
  mrrChange: 15.2,
}

const demoRestaurants = [
  { id: "1", name: "Demo Kafe", slug: "demo-kafe", plan: "Growth", status: "active", orders: 18 },
  { id: "2", name: "Lezzet Durağı", slug: "lezzet-duragi", plan: "Pro", status: "active", orders: 32 },
  { id: "3", name: "Kahve Evi", slug: "kahve-evi", plan: "Starter", status: "trial", orders: 8 },
  { id: "4", name: "Tatlı Köşe", slug: "tatli-kose", plan: "Growth", status: "active", orders: 24 },
]

const systemStatus = [
  { name: "Veritabanı", status: "operational", latency: "12ms" },
  { name: "API Sunucusu", status: "operational", latency: "45ms" },
  { name: "AI Servisi", status: "configured", latency: "320ms" },
  { name: "Ödeme Gateway", status: "pending", latency: "-" },
]

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
        <p className="text-slate-400">Platform genel durumu ve istatistikler</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-slate-400">Toplam Restoran</CardDescription>
            <Store className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{demoStats.totalRestaurants}</div>
            <p className="text-xs text-slate-400">
              <span className="text-green-400">+{demoStats.newThisMonth}</span> bu ay
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-slate-400">Aktif Abonelik</CardDescription>
            <CreditCard className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{demoStats.activeSubscriptions}</div>
            <p className="text-xs text-slate-400">
              <span className="text-yellow-400">{demoStats.trialSubscriptions} trial</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-slate-400">Bugünün Siparişleri</CardDescription>
            <ShoppingCart className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{demoStats.todayOrders}</div>
            <p className="text-xs text-slate-400">
              Toplam: ₺{demoStats.todayRevenue.toLocaleString("tr-TR")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-slate-400">Aylık Gelir (MRR)</CardDescription>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ₺{demoStats.mrr.toLocaleString("tr-TR")}
            </div>
            <p className="text-xs text-slate-400">
              <span className="text-green-400">+{demoStats.mrrChange}%</span> geçen aya göre
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Restaurants */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Son Restoranlar</CardTitle>
              <CardDescription className="text-slate-400">Platform üzerindeki işletmeler</CardDescription>
            </div>
            <Link href="/admin/restaurants">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                Tümü
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold text-white">
                      {restaurant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{restaurant.name}</p>
                      <p className="text-xs text-slate-400">/{restaurant.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      restaurant.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {restaurant.plan}
                    </span>
                    <span className="text-sm text-slate-400">{restaurant.orders} sipariş</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Sistem Durumu</CardTitle>
            <CardDescription className="text-slate-400">Servis sağlığı ve performans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {service.status === "operational" ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : service.status === "configured" ? (
                      <CheckCircle className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                    <span className="text-white">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">{service.latency}</span>
                    <span className={`rounded px-2 py-0.5 text-xs ${
                      service.status === "operational"
                        ? "bg-green-500/20 text-green-400"
                        : service.status === "configured"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {service.status === "operational" ? "Aktif" : service.status === "configured" ? "Hazır" : "Beklemede"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-slate-700 bg-slate-700/30 p-4">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-white">AI Servisi Aktif</p>
                  <p className="text-sm text-slate-400">
                    Claude API bağlantısı yapılandırıldı. Müşteri chatbot'u kullanıma hazır.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/restaurants/new">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 border-slate-600 bg-slate-700/50 p-4 text-left hover:bg-slate-700">
                <Store className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-white">Restoran Ekle</p>
                  <p className="text-xs text-slate-400">Yeni işletme oluştur</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/subscriptions">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 border-slate-600 bg-slate-700/50 p-4 text-left hover:bg-slate-700">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-white">Plan Düzenle</p>
                  <p className="text-xs text-slate-400">Abonelik planları</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 border-slate-600 bg-slate-700/50 p-4 text-left hover:bg-slate-700">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-white">AI Ayarları</p>
                  <p className="text-xs text-slate-400">Claude API yapılandır</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 border-slate-600 bg-slate-700/50 p-4 text-left hover:bg-slate-700">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-white">Gelir Raporu</p>
                  <p className="text-xs text-slate-400">Finansal analiz</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Building2,
} from "lucide-react"
import { useFetch } from "@/hooks/use-api"

interface Restaurant {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  plan: string
  status: string
  isActive: boolean
  orders: number
  revenue: number
  tables: number
  createdAt: string
}

// Fallback demo data
const fallbackRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Demo Kafe",
    slug: "demo-kafe",
    email: "info@demo-kafe.com",
    phone: "0212 555 0001",
    plan: "Growth",
    status: "active",
    isActive: true,
    orders: 342,
    revenue: 28500,
    tables: 10,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Lezzet Durağı",
    slug: "lezzet-duragi",
    email: "info@lezzet-duragi.com",
    phone: "0216 555 0002",
    plan: "Pro",
    status: "active",
    isActive: true,
    orders: 856,
    revenue: 72400,
    tables: 25,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Kahve Evi",
    slug: "kahve-evi",
    email: "info@kahve-evi.com",
    phone: "0312 555 0003",
    plan: "Starter",
    status: "trial",
    isActive: true,
    orders: 45,
    revenue: 3200,
    tables: 6,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Tatlı Köşe",
    slug: "tatli-kose",
    email: "info@tatli-kose.com",
    phone: "0232 555 0004",
    plan: "Growth",
    status: "active",
    isActive: true,
    orders: 428,
    revenue: 38900,
    tables: 15,
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    name: "Şehir Bistro",
    slug: "sehir-bistro",
    email: "info@sehir-bistro.com",
    phone: "0242 555 0005",
    plan: "Growth",
    status: "past_due",
    isActive: false,
    orders: 156,
    revenue: 12800,
    tables: 12,
    createdAt: "2024-01-25",
  },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Aktif", color: "bg-green-500/20 text-green-400" },
  trial: { label: "Deneme", color: "bg-yellow-500/20 text-yellow-400" },
  past_due: { label: "Ödeme Bekliyor", color: "bg-red-500/20 text-red-400" },
  cancelled: { label: "İptal", color: "bg-slate-500/20 text-slate-400" },
}

const planConfig: Record<string, { color: string }> = {
  Starter: { color: "border-slate-500 text-slate-300" },
  Growth: { color: "border-blue-500 text-blue-400" },
  Pro: { color: "border-purple-500 text-purple-400" },
}

export default function RestaurantsPage() {
  const { data: apiData, isLoading } = useFetch<Restaurant[]>("/api/admin/restaurants")
  const [restaurants, setRestaurants] = useState<Restaurant[]>(fallbackRestaurants)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Use API data when available
  useEffect(() => {
    if (apiData) {
      setRestaurants(apiData)
    }
  }, [apiData])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-slate-400">Restoranlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  const filteredRestaurants = restaurants.filter(r => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!r.name.toLowerCase().includes(query) && !r.slug.includes(query)) {
        return false
      }
    }
    if (filterStatus !== "all" && r.status !== filterStatus) {
      return false
    }
    return true
  })

  const toggleActive = (id: string) => {
    setRestaurants(prev => prev.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Restoranlar</h1>
          <p className="text-slate-400">Platform üzerindeki işletmeleri yönetin</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Restoran Ekle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Toplam</p>
            <p className="text-2xl font-bold text-white">{restaurants.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Aktif</p>
            <p className="text-2xl font-bold text-green-400">
              {restaurants.filter(r => r.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Deneme</p>
            <p className="text-2xl font-bold text-yellow-400">
              {restaurants.filter(r => r.status === "trial").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Toplam Sipariş</p>
            <p className="text-2xl font-bold text-white">
              {restaurants.reduce((sum, r) => sum + r.orders, 0).toLocaleString("tr-TR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Restoran ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-400 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "trial", "past_due"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={filterStatus !== status ? "border-slate-600 text-slate-300 hover:bg-slate-700" : ""}
            >
              {status === "all" ? "Tümü" : statusConfig[status]?.label || status}
            </Button>
          ))}
        </div>
      </div>

      {/* Restaurants Table */}
      <Card className="border-slate-700 bg-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700 bg-slate-800/50">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Restoran</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Plan</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Durum</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Sipariş</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Ciro</th>
                  <th className="p-4 text-right text-sm font-medium text-slate-400">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className={`border-b border-slate-700 last:border-0 ${
                      !restaurant.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 font-bold text-white">
                          {restaurant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{restaurant.name}</p>
                          <p className="text-xs text-slate-400">/{restaurant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`rounded border px-2 py-0.5 text-xs font-medium ${planConfig[restaurant.plan]?.color}`}>
                        {restaurant.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusConfig[restaurant.status]?.color}`}>
                        {statusConfig[restaurant.status]?.label}
                      </span>
                    </td>
                    <td className="p-4 text-white">{restaurant.orders.toLocaleString("tr-TR")}</td>
                    <td className="p-4 text-white">₺{restaurant.revenue.toLocaleString("tr-TR")}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white"
                          asChild
                        >
                          <a href={`/customer/menu/${restaurant.slug}`} target="_blank" rel="noopener">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white"
                          onClick={() => toggleActive(restaurant.id)}
                        >
                          {restaurant.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRestaurants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Building2 className="mx-auto h-12 w-12 text-slate-600" />
                      <p className="mt-4 text-slate-400">
                        {searchQuery ? "Arama sonucu bulunamadı" : "Henüz restoran yok"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

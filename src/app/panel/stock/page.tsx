"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
} from "lucide-react"

interface StockItem {
  id: string
  name: string
  categoryName?: string
  stockQuantity: number
  lowStockAlert: number
  stockUnit: string
  trackStock: boolean
  isAvailable: boolean
  isLowStock: boolean
  isOutOfStock: boolean
}

interface StockStats {
  totalTracked: number
  lowStockCount: number
  outOfStockCount: number
}

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [stats, setStats] = useState<StockStats>({ totalTracked: 0, lowStockCount: 0, outOfStockCount: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "low" | "out">("all")
  const [search, setSearch] = useState("")
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [adjustAmount, setAdjustAmount] = useState(0)

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tenant/stock?movements=true")
      const data = await res.json()
      if (data.success) {
        setItems(data.data.items)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error("Stock fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (menuItemId: string, quantity: number, type: string) => {
    try {
      const res = await fetch("/api/tenant/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, quantity, type, reason: "Manuel düzeltme" }),
      })
      const data = await res.json()
      if (data.success) {
        fetchStock()
        setAdjustingId(null)
        setAdjustAmount(0)
      }
    } catch (error) {
      console.error("Stock update error:", error)
    }
  }

  const filteredItems = items.filter((item) => {
    if (filter === "low" && !item.isLowStock) return false
    if (filter === "out" && !item.isOutOfStock) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Yönetimi</h1>
          <p className="text-slate-500">Ürün stoklarını takip edin ve yönetin</p>
        </div>
        <Button onClick={fetchStock} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalTracked}</p>
              <p className="text-sm text-slate-500">Takip Edilen Ürün</p>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.lowStockCount > 0 ? "border-yellow-200 bg-yellow-50" : ""}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`rounded-full p-3 ${stats.lowStockCount > 0 ? "bg-yellow-200" : "bg-slate-100"}`}>
              <TrendingDown className={`h-6 w-6 ${stats.lowStockCount > 0 ? "text-yellow-600" : "text-slate-600"}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.lowStockCount}</p>
              <p className="text-sm text-slate-500">Düşük Stok</p>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.outOfStockCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`rounded-full p-3 ${stats.outOfStockCount > 0 ? "bg-red-200" : "bg-slate-100"}`}>
              <AlertTriangle className={`h-6 w-6 ${stats.outOfStockCount > 0 ? "text-red-600" : "text-slate-600"}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.outOfStockCount}</p>
              <p className="text-sm text-slate-500">Stok Yok</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Tümü
              </Button>
              <Button
                variant={filter === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("low")}
                className={filter === "low" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <TrendingDown className="mr-1 h-4 w-4" />
                Düşük
              </Button>
              <Button
                variant={filter === "out" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("out")}
                className={filter === "out" ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <AlertTriangle className="mr-1 h-4 w-4" />
                Yok
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stok Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-slate-500">
                  <th className="pb-3">Ürün</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3 text-center">Stok</th>
                  <th className="pb-3 text-center">Uyarı Seviyesi</th>
                  <th className="pb-3 text-center">Durum</th>
                  <th className="pb-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-4 font-medium">{item.name}</td>
                    <td className="py-4 text-slate-500">{item.categoryName || "-"}</td>
                    <td className="py-4 text-center">
                      <span className={`font-bold ${item.isOutOfStock ? "text-red-600" : item.isLowStock ? "text-yellow-600" : "text-green-600"}`}>
                        {item.stockQuantity}
                      </span>
                      <span className="ml-1 text-sm text-slate-400">{item.stockUnit}</span>
                    </td>
                    <td className="py-4 text-center text-slate-500">{item.lowStockAlert}</td>
                    <td className="py-4 text-center">
                      {item.isOutOfStock ? (
                        <Badge variant="destructive">Stok Yok</Badge>
                      ) : item.isLowStock ? (
                        <Badge className="bg-yellow-100 text-yellow-700">Düşük</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">Yeterli</Badge>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {adjustingId === item.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                            className="w-20 rounded border px-2 py-1 text-center"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStock(item.id, adjustAmount, "IN")}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStock(item.id, adjustAmount, "OUT")}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAdjustingId(null)
                              setAdjustAmount(0)
                            }}
                          >
                            İptal
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAdjustingId(item.id)}
                        >
                          <ArrowUpDown className="mr-1 h-4 w-4" />
                          Düzelt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {search ? "Arama sonucu bulunamadı" : "Stok takibi aktif ürün bulunmuyor"}
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

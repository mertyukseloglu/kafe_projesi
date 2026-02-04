"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  QrCode,
  Download,
  Printer,
  Edit,
  Trash2,
  Users,
  ExternalLink,
  Grid3X3,
  LayoutGrid,
  List,
} from "lucide-react"

// Demo masalar
const demoTables = [
  { id: "1", number: "1", area: "İç Mekan", capacity: 2, isActive: true, hasActiveOrder: true },
  { id: "2", number: "2", area: "İç Mekan", capacity: 4, isActive: true, hasActiveOrder: false },
  { id: "3", number: "3", area: "İç Mekan", capacity: 4, isActive: true, hasActiveOrder: true },
  { id: "4", number: "4", area: "İç Mekan", capacity: 6, isActive: true, hasActiveOrder: false },
  { id: "5", number: "5", area: "Bahçe", capacity: 4, isActive: true, hasActiveOrder: true },
  { id: "6", number: "6", area: "Bahçe", capacity: 4, isActive: true, hasActiveOrder: false },
  { id: "7", number: "7", area: "Bahçe", capacity: 6, isActive: true, hasActiveOrder: true },
  { id: "8", number: "8", area: "Teras", capacity: 2, isActive: true, hasActiveOrder: false },
  { id: "9", number: "9", area: "Teras", capacity: 2, isActive: true, hasActiveOrder: false },
  { id: "10", number: "10", area: "Teras", capacity: 4, isActive: false, hasActiveOrder: false },
]

const areas = ["Tümü", "İç Mekan", "Bahçe", "Teras"]

export default function TablesPage() {
  const [tables, setTables] = useState(demoTables)
  const [selectedArea, setSelectedArea] = useState("Tümü")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTable, setEditTable] = useState<typeof demoTables[0] | null>(null)
  const [selectedTables, setSelectedTables] = useState<string[]>([])

  // Demo restoran slug
  const restaurantSlug = "demo-kafe"

  // Filtreleme
  const filteredTables = tables.filter(table => {
    if (selectedArea !== "Tümü" && table.area !== selectedArea) return false
    return true
  })

  // İstatistikler
  const stats = {
    total: tables.filter(t => t.isActive).length,
    occupied: tables.filter(t => t.isActive && t.hasActiveOrder).length,
    available: tables.filter(t => t.isActive && !t.hasActiveOrder).length,
  }

  // QR URL oluştur
  const getQRUrl = (tableNumber: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `${baseUrl}/customer/menu/${restaurantSlug}?table=${tableNumber}`
  }

  // Masa toggle
  const toggleTable = (tableId: string) => {
    if (selectedTables.includes(tableId)) {
      setSelectedTables(prev => prev.filter(id => id !== tableId))
    } else {
      setSelectedTables(prev => [...prev, tableId])
    }
  }

  // Toplu QR indir
  const downloadSelectedQR = () => {
    if (selectedTables.length === 0) {
      alert("Lütfen en az bir masa seçin")
      return
    }
    alert(`${selectedTables.length} adet QR kod indiriliyor... (Demo)`)
  }

  // Tek QR indir
  const downloadQR = (tableNumber: string) => {
    const url = getQRUrl(tableNumber)
    // Gerçek uygulamada QR kod görseli oluşturulup indirilir
    alert(`Masa ${tableNumber} QR kodu indiriliyor...\n\nURL: ${url}`)
  }

  // Masa sil
  const deleteTable = (tableId: string) => {
    if (confirm("Bu masayı silmek istediğinize emin misiniz?")) {
      setTables(prev => prev.filter(t => t.id !== tableId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Masa Yönetimi</h1>
          <p className="text-muted-foreground">Masaları düzenle ve QR kodları yönet</p>
        </div>
        <div className="flex gap-2">
          {selectedTables.length > 0 && (
            <Button variant="outline" onClick={downloadSelectedQR}>
              <Download className="mr-2 h-4 w-4" />
              QR İndir ({selectedTables.length})
            </Button>
          )}
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Masa Ekle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Toplam Masa</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Grid3X3 className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-green-600">Müsait</p>
              <p className="text-2xl font-bold text-green-700">{stats.available}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-orange-600">Dolu</p>
              <p className="text-2xl font-bold text-orange-700">{stats.occupied}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {areas.map((area) => (
            <Button
              key={area}
              variant={selectedArea === area ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedArea(area)}
            >
              {area}
              {area !== "Tümü" && (
                <span className="ml-1 text-xs opacity-70">
                  ({tables.filter(t => t.area === area).length})
                </span>
              )}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tables Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredTables.map((table) => (
            <Card
              key={table.id}
              className={`cursor-pointer transition-all ${
                selectedTables.includes(table.id) ? "ring-2 ring-primary" : ""
              } ${!table.isActive ? "opacity-50" : ""}`}
              onClick={() => toggleTable(table.id)}
            >
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold ${
                      table.hasActiveOrder
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {table.number}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`h-2 w-2 rounded-full ${
                      table.hasActiveOrder ? "bg-orange-500" : "bg-green-500"
                    }`} />
                    <span className="text-xs text-muted-foreground">{table.area}</span>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{table.capacity} kişilik</span>
                </div>

                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => downloadQR(table.number)}
                  >
                    <QrCode className="mr-1 h-3 w-3" />
                    QR
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditTable(table)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a href={getQRUrl(table.number)} target="_blank" rel="noopener">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Masa</th>
                  <th className="p-3 text-left text-sm font-medium">Alan</th>
                  <th className="p-3 text-left text-sm font-medium">Kapasite</th>
                  <th className="p-3 text-left text-sm font-medium">Durum</th>
                  <th className="p-3 text-right text-sm font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.map((table) => (
                  <tr key={table.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTables.includes(table.id)}
                          onChange={() => toggleTable(table.id)}
                          className="rounded"
                        />
                        <span className="font-medium">Masa {table.number}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{table.area}</td>
                    <td className="p-3 text-sm">{table.capacity} kişi</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                        table.hasActiveOrder
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          table.hasActiveOrder ? "bg-orange-500" : "bg-green-500"
                        }`} />
                        {table.hasActiveOrder ? "Dolu" : "Müsait"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => downloadQR(table.number)}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditTable(table)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={getQRUrl(table.number)} target="_blank" rel="noopener">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteTable(table.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {filteredTables.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Bu alanda masa yok</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editTable) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {editTable ? "Masa Düzenle" : "Yeni Masa Ekle"}
              </h2>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); setEditTable(null); }}>
                <div>
                  <label className="mb-1 block text-sm font-medium">Masa Numarası</label>
                  <input
                    type="text"
                    defaultValue={editTable?.number || ""}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="örn: 11"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Alan</label>
                  <select
                    defaultValue={editTable?.area || ""}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seçin...</option>
                    <option value="İç Mekan">İç Mekan</option>
                    <option value="Bahçe">Bahçe</option>
                    <option value="Teras">Teras</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Kapasite</label>
                  <input
                    type="number"
                    defaultValue={editTable?.capacity || 4}
                    min={1}
                    max={20}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowAddModal(false); setEditTable(null); }}
                  >
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editTable ? "Güncelle" : "Ekle"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

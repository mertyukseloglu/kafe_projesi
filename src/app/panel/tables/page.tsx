"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import {
  Plus,
  QrCode,
  Download,
  Edit,
  Trash2,
  Users,
  ExternalLink,
  Grid3X3,
  LayoutGrid,
  List,
  RefreshCw,
  Loader2,
  X,
  Printer,
} from "lucide-react"
import { useFetch, useMutation, API } from "@/hooks/use-api"
import { QRCodeSVG } from "qrcode.react"
import { getTableQrUrl } from "@/lib/subdomain"

// Tip tanımları
interface Table {
  id: string
  number: string
  area?: string
  capacity: number
  isActive: boolean
  qrCodeUrl?: string
  hasActiveOrder?: boolean
}

interface TablesData {
  tables: Table[]
  stats?: {
    total: number
    occupied: number
    available: number
  }
}

// Demo masalar
const demoTables: Table[] = [
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

const defaultAreas = ["Tümü", "İç Mekan", "Bahçe", "Teras"]

export default function TablesPage() {
  const { data, isLoading, refetch } = useFetch<TablesData>(API.tenant.tables)
  const { mutate, isLoading: isMutating } = useMutation()

  const [selectedArea, setSelectedArea] = useState("Tümü")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTable, setEditTable] = useState<Table | null>(null)
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<string | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    number: "",
    area: "",
    capacity: 4,
  })

  // Use API data or fallback to demo
  const tables = data?.tables || demoTables

  // Demo restoran slug
  const restaurantSlug = "demo-kafe"

  // Get unique areas from tables
  const areas = useMemo((): string[] => {
    const uniqueAreas = tables.map(t => t.area).filter((a): a is string => Boolean(a))
    return ["Tümü", ...Array.from(new Set(uniqueAreas))]
  }, [tables])

  // Filtreleme
  const filteredTables = useMemo(() => {
    return tables.filter(table => {
      if (selectedArea !== "Tümü" && table.area !== selectedArea) return false
      return true
    })
  }, [tables, selectedArea])

  // İstatistikler
  const stats = useMemo(() => ({
    total: tables.filter(t => t.isActive).length,
    occupied: tables.filter(t => t.isActive && t.hasActiveOrder).length,
    available: tables.filter(t => t.isActive && !t.hasActiveOrder).length,
  }), [tables])

  // Link için relative URL (hydration mismatch önlemek için)
  const getMenuUrl = (tableNumber: string) => {
    return `/customer/menu/${restaurantSlug}?table=${tableNumber}`
  }

  // QR kod için absolute URL (QR taraması için gerekli)
  const getQRUrl = (tableNumber: string) => {
    return getTableQrUrl(restaurantSlug, parseInt(tableNumber, 10))
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

  // QR modal aç
  const openQRModal = (table: Table) => {
    setQrModalTable(table)
  }

  // QR kodu indir
  const downloadQRCode = () => {
    if (!qrModalTable || !qrRef.current) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, 400, 400)

        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `masa-${qrModalTable.number}-qr.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  // QR yazdır
  const printQR = () => {
    if (!qrModalTable) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const url = getQRUrl(qrModalTable.number)
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Masa ${qrModalTable.number} QR Kod</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .qr-container { display: inline-block; padding: 20px; border: 2px solid #000; border-radius: 10px; }
            h1 { margin: 0 0 10px 0; font-size: 24px; }
            p { margin: 5px 0; color: #666; font-size: 14px; }
            .table-num { font-size: 48px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Demo Kafe</h1>
            <div class="table-num">Masa ${qrModalTable.number}</div>
            <div id="qr"></div>
            <p>QR kodu okutarak menüyü görüntüleyin</p>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"><\/script>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${url}', { width: 200 }, function(err, canvas) {
              if (!err) document.getElementById('qr').appendChild(canvas);
              setTimeout(() => window.print(), 500);
            });
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Masa sil - AlertDialog aç
  const handleDeleteClick = (tableId: string) => {
    setTableToDelete(tableId)
    setDeleteDialogOpen(true)
  }

  // Silme onayı
  const confirmDeleteTable = async () => {
    if (tableToDelete) {
      await mutate(`${API.tenant.tables}?id=${tableToDelete}`, {
        method: "DELETE",
      })
      await refetch()
      toast.success("Masa Silindi", "Masa başarıyla silindi.")
    }
    setDeleteDialogOpen(false)
    setTableToDelete(null)
  }

  // Masa ekle
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    await mutate(API.tenant.tables, {
      method: "POST",
      body: JSON.stringify({
        number: formData.number,
        area: formData.area,
        capacity: formData.capacity,
      }),
    })
    setShowAddModal(false)
    setFormData({ number: "", area: "", capacity: 4 })
    await refetch()
  }

  // Masa güncelle
  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTable) return
    await mutate(API.tenant.tables, {
      method: "PATCH",
      body: JSON.stringify({
        id: editTable.id,
        number: formData.number,
        area: formData.area,
        capacity: formData.capacity,
      }),
    })
    setEditTable(null)
    setFormData({ number: "", area: "", capacity: 4 })
    await refetch()
  }

  // Edit modal aç
  const openEditModal = (table: Table) => {
    setEditTable(table)
    setFormData({
      number: table.number,
      area: table.area || "",
      capacity: table.capacity,
    })
  }

  // Yenile
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
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
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            )}
          </Button>
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
          {(areas.length > 0 ? areas : defaultAreas).map((area) => (
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
                    onClick={() => openQRModal(table)}
                  >
                    <QrCode className="mr-1 h-3 w-3" />
                    QR
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditModal(table)}
                    aria-label="Masayı düzenle"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a href={getMenuUrl(table.number)} target="_blank" rel="noopener" aria-label="Menüyü yeni sekmede aç">
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
                        <Button variant="ghost" size="sm" onClick={() => openQRModal(table)} aria-label="QR kodu göster">
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(table)} aria-label="Masayı düzenle">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={getMenuUrl(table.number)} target="_blank" rel="noopener" aria-label="Menüyü yeni sekmede aç">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(table.id)}
                          disabled={isMutating}
                          aria-label="Masayı sil"
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

              <form className="space-y-4" onSubmit={editTable ? handleUpdateTable : handleAddTable}>
                <div>
                  <label className="mb-1 block text-sm font-medium">Masa Numarası</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="örn: 11"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Alan</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
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
                  <Button type="submit" className="flex-1" disabled={isMutating}>
                    {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editTable ? "Güncelle" : "Ekle"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Masa {qrModalTable.number} QR Kodu</h2>
                <Button variant="ghost" size="icon" onClick={() => setQrModalTable(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div ref={qrRef} className="mb-4 flex justify-center rounded-lg bg-white p-6">
                <QRCodeSVG
                  value={getQRUrl(qrModalTable.number)}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>

              <p className="mb-4 text-center text-sm text-muted-foreground">
                {qrModalTable.area} • {qrModalTable.capacity} kişilik
              </p>

              <div className="mb-4 rounded-lg bg-muted p-3">
                <p className="break-all text-xs text-muted-foreground">
                  {getQRUrl(qrModalTable.number)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={downloadQRCode}>
                  <Download className="mr-1 h-4 w-4" />
                  İndir
                </Button>
                <Button variant="outline" onClick={printQR}>
                  <Printer className="mr-1 h-4 w-4" />
                  Yazdır
                </Button>
                <Button variant="outline" asChild>
                  <a href={getQRUrl(qrModalTable.number)} target="_blank" rel="noopener">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Aç
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Silme Onay Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Masayı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu masayı silmek istediğinize emin misiniz? QR kodu artık çalışmayacaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTable}>
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

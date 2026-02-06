"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/hooks/use-toast"
import {
  Tag,
  Plus,
  Calendar,
  Percent,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Play,
  Pause,
  Clock,
  Gift,
  Ticket,
  Loader2,
  X,
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  description?: string
  type: string
  discountValue: number
  status: string
  startDate: string
  endDate?: string
  usedCount: number
  usageLimit: number
  isPublic: boolean
  validHoursFrom?: string
  validHoursTo?: string
  validDays?: number[]
  isFirstOrderOnly?: boolean
  buyQuantity?: number
  getQuantity?: number
}

interface CampaignStats {
  total: number
  active: number
  scheduled: number
  totalUsage: number
}

const campaignTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  DISCOUNT_PERCENT: { label: "% İndirim", icon: <Percent className="h-4 w-4" /> },
  DISCOUNT_AMOUNT: { label: "TL İndirim", icon: <Tag className="h-4 w-4" /> },
  BUY_X_GET_Y: { label: "X Al Y Öde", icon: <Gift className="h-4 w-4" /> },
  FREE_ITEM: { label: "Ücretsiz Ürün", icon: <Gift className="h-4 w-4" /> },
  BUNDLE: { label: "Paket", icon: <Tag className="h-4 w-4" /> },
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  ENDED: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  DRAFT: "Taslak",
  SCHEDULED: "Planlandı",
  ACTIVE: "Aktif",
  PAUSED: "Duraklatıldı",
  ENDED: "Sona Erdi",
}

const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats>({ total: 0, active: 0, scheduled: 0, totalUsage: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "DISCOUNT_PERCENT",
    discountValue: 10,
    minOrderAmount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    usageLimit: 0,
    isPublic: true,
    status: "DRAFT",
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tenant/campaigns")
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.data.campaigns)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error("Campaigns fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingCampaign ? "PATCH" : "POST"
      const body = editingCampaign ? { id: editingCampaign.id, ...formData } : formData

      const res = await fetch("/api/tenant/campaigns", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        fetchCampaigns()
        setShowForm(false)
        setEditingCampaign(null)
        resetForm()
      }
    } catch (error) {
      console.error("Campaign save error:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "DISCOUNT_PERCENT",
      discountValue: 10,
      minOrderAmount: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      usageLimit: 0,
      isPublic: true,
      status: "DRAFT",
    })
  }

  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
    try {
      await fetch("/api/tenant/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id, status: newStatus }),
      })
      fetchCampaigns()
    } catch (error) {
      console.error("Status toggle error:", error)
    }
  }

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return
    try {
      await fetch(`/api/tenant/campaigns?id=${campaignToDelete.id}`, { method: "DELETE" })
      fetchCampaigns()
      toast.success("Kampanya başarıyla silindi")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Kampanya silinirken bir hata oluştu")
    } finally {
      setDeleteDialogOpen(false)
      setCampaignToDelete(null)
    }
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Kampanyalar</h1>
          <p className="text-slate-500">İndirim ve promosyon kampanyalarını yönetin</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kampanya
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-purple-100 p-3">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-slate-500">Toplam Kampanya</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-green-100 p-3">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-slate-500">Aktif</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-blue-100 p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
              <p className="text-sm text-slate-500">Planlandı</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-orange-100 p-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalUsage}</p>
              <p className="text-sm text-slate-500">Toplam Kullanım</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingCampaign ? "Kampanya Düzenle" : "Yeni Kampanya"}</CardTitle>
              <Button variant="ghost" size="icon" aria-label="Formu kapat" onClick={() => { setShowForm(false); setEditingCampaign(null); resetForm(); }}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kampanya Adı</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border p-2"
                    placeholder="Örn: Happy Hour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border p-2"
                    rows={2}
                    placeholder="Kampanya detayları..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kampanya Tipi</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full rounded-lg border p-2"
                    >
                      <option value="DISCOUNT_PERCENT">% İndirim</option>
                      <option value="DISCOUNT_AMOUNT">TL İndirim</option>
                      <option value="BUY_X_GET_Y">X Al Y Öde</option>
                      <option value="FREE_ITEM">Ücretsiz Ürün</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {formData.type === "DISCOUNT_PERCENT" ? "İndirim %" : "İndirim TL"}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                      className="w-full rounded-lg border p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Başlangıç</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full rounded-lg border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş (Opsiyonel)</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full rounded-lg border p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min. Sipariş (TL)</label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                      className="w-full rounded-lg border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Kullanım Limiti</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                      className="w-full rounded-lg border p-2"
                      placeholder="0 = Sınırsız"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Menüde Göster</span>
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="rounded-lg border p-2"
                  >
                    <option value="DRAFT">Taslak</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="SCHEDULED">Planlandı</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCampaign ? "Güncelle" : "Oluştur"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingCampaign(null); resetForm(); }}>
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns List */}
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-3 ${campaign.status === "ACTIVE" ? "bg-green-100" : "bg-slate-100"}`}>
                    {campaignTypeLabels[campaign.type]?.icon || <Tag className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge className={statusColors[campaign.status]}>
                        {statusLabels[campaign.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{campaign.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        {campaignTypeLabels[campaign.type]?.label}:
                        <strong className="text-orange-600">
                          {campaign.type === "BUY_X_GET_Y"
                            ? `${campaign.buyQuantity} Al ${campaign.getQuantity} Öde`
                            : campaign.type === "DISCOUNT_PERCENT"
                            ? `%${campaign.discountValue}`
                            : `₺${campaign.discountValue}`}
                        </strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.startDate).toLocaleDateString("tr-TR")}
                        {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString("tr-TR")}`}
                      </span>
                      {campaign.validHoursFrom && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {campaign.validHoursFrom} - {campaign.validHoursTo}
                        </span>
                      )}
                      {campaign.validDays && campaign.validDays.length > 0 && campaign.validDays.length < 7 && (
                        <span>{campaign.validDays.map((d) => dayNames[d]).join(", ")}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.usedCount} kullanım
                        {campaign.usageLimit > 0 && ` / ${campaign.usageLimit}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {campaign.status === "ACTIVE" || campaign.status === "PAUSED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(campaign)}
                    >
                      {campaign.status === "ACTIVE" ? (
                        <>
                          <Pause className="mr-1 h-4 w-4" /> Duraklat
                        </>
                      ) : (
                        <>
                          <Play className="mr-1 h-4 w-4" /> Başlat
                        </>
                      )}
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Kampanyayı düzenle"
                    onClick={() => {
                      setEditingCampaign(campaign)
                      setFormData({
                        name: campaign.name,
                        description: campaign.description || "",
                        type: campaign.type,
                        discountValue: campaign.discountValue,
                        minOrderAmount: 0,
                        startDate: campaign.startDate.split("T")[0],
                        endDate: campaign.endDate?.split("T")[0] || "",
                        usageLimit: campaign.usageLimit,
                        isPublic: campaign.isPublic,
                        status: campaign.status,
                      })
                      setShowForm(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Kampanyayı sil"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteClick(campaign)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {campaigns.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">Henüz kampanya oluşturulmamış</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Kampanyayı Oluştur
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kampanyayı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{campaignToDelete?.name}&quot; kampanyasını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCampaign}>
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

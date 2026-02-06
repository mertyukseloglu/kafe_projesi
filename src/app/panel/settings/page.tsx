"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Store,
  Clock,
  Palette,
  Bot,
  Users,
  Save,
  Upload,
  Trash2,
  Plus,
  X,
  Check,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { useFetch, useMutation, API } from "@/hooks/use-api"
import { staffSchema } from "@/lib/validations/settings"

// Tip tanımları
interface Staff {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface SettingsData {
  restaurant: {
    id: string
    name: string
    slug: string
    description?: string
    phone?: string
    email?: string
    address?: string
    city?: string
    district?: string
    logo?: string | null
    coverImage?: string | null
    settings?: Record<string, unknown>
  }
  staff: Staff[]
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd?: string
    limits?: {
      maxOrders: number
      maxTables: number
      maxAiRequests: number
      maxStaff: number
    }
  }
}

// Demo veriler
const demoRestaurant = {
  id: "demo-1",
  name: "Demo Kafe",
  slug: "demo-kafe",
  description: "Şehrin en keyifli kahve durağı",
  phone: "0212 555 0001",
  email: "info@demo-kafe.com",
  address: "Bağdat Caddesi No:123",
  city: "İstanbul",
  district: "Kadıköy",
  logo: null,
  coverImage: null,
  settings: {},
}

const demoWorkingHours = {
  monday: { open: "08:00", close: "23:00", isOpen: true },
  tuesday: { open: "08:00", close: "23:00", isOpen: true },
  wednesday: { open: "08:00", close: "23:00", isOpen: true },
  thursday: { open: "08:00", close: "23:00", isOpen: true },
  friday: { open: "08:00", close: "00:00", isOpen: true },
  saturday: { open: "09:00", close: "00:00", isOpen: true },
  sunday: { open: "09:00", close: "22:00", isOpen: true },
}

const demoStaff: Staff[] = [
  { id: "1", name: "Demo Kafe Admin", email: "demo@kafe.com", role: "TENANT_ADMIN", isActive: true },
  { id: "2", name: "Ahmet Garson", email: "ahmet@demo-kafe.com", role: "STAFF", isActive: true },
  { id: "3", name: "Ayşe Yönetici", email: "ayse@demo-kafe.com", role: "MANAGER", isActive: true },
]

const demoAiSettings = {
  enabled: true,
  welcomeMessage: "Merhaba! Demo Kafe'ye hoş geldiniz. Size nasıl yardımcı olabilirim?",
  personality: "friendly",
  suggestPopular: true,
  suggestUpsell: true,
}

const tabs = [
  { id: "general", label: "Genel", icon: Store },
  { id: "hours", label: "Çalışma Saatleri", icon: Clock },
  { id: "appearance", label: "Görünüm", icon: Palette },
  { id: "ai", label: "AI Asistan", icon: Bot },
  { id: "staff", label: "Personel", icon: Users },
]

const dayNames: Record<string, string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar",
}

const roleLabels: Record<string, string> = {
  TENANT_ADMIN: "Yönetici",
  MANAGER: "Müdür",
  STAFF: "Personel",
}

export default function SettingsPage() {
  const { data, isLoading, refetch } = useFetch<SettingsData>(API.tenant.settings)
  const { mutate, isLoading: isMutating } = useMutation()

  const [activeTab, setActiveTab] = useState("general")
  const [showSaved, setShowSaved] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null)

  // Form states
  const [restaurant, setRestaurant] = useState(demoRestaurant)
  const [workingHours, setWorkingHours] = useState(demoWorkingHours)
  const [aiSettings, setAiSettings] = useState(demoAiSettings)
  const [staff, setStaff] = useState<Staff[]>(demoStaff)
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [themeColor, setThemeColor] = useState("#f97316")

  // Staff form
  const [staffForm, setStaffForm] = useState<{
    name: string
    email: string
    password: string
    role: "MANAGER" | "STAFF"
  }>({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
  })
  const [staffFormErrors, setStaffFormErrors] = useState<Record<string, string>>({})

  const clearStaffFormError = (field: string) => {
    if (staffFormErrors[field]) {
      setStaffFormErrors({ ...staffFormErrors, [field]: "" })
    }
  }

  // Update form when data loads
  useEffect(() => {
    if (data?.restaurant) {
      setRestaurant(data.restaurant as typeof demoRestaurant)
    }
    if (data?.staff) {
      setStaff(data.staff)
    }
  }, [data])

  const handleSave = async () => {
    await mutate(API.tenant.settings, {
      method: "PATCH",
      body: JSON.stringify({
        name: restaurant.name,
        description: restaurant.description,
        phone: restaurant.phone,
        email: restaurant.email,
        address: restaurant.address,
        city: restaurant.city,
        district: restaurant.district,
        settings: {
          workingHours,
          aiSettings,
          themeColor,
        },
      }),
    })
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 3000)
    await refetch()
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setStaffFormErrors({})

    // Zod validation
    const result = staffSchema.safeParse(staffForm)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        if (!errors[field]) {
          errors[field] = issue.message
        }
      })
      setStaffFormErrors(errors)
      return
    }

    await mutate(API.tenant.settings, {
      method: "POST",
      body: JSON.stringify({
        name: staffForm.name,
        email: staffForm.email,
        password: staffForm.password,
        role: staffForm.role,
      }),
    })
    setIsAddStaffOpen(false)
    setStaffForm({ name: "", email: "", password: "", role: "STAFF" })
    await refetch()
  }

  // Personel sil - AlertDialog aç
  const handleDeleteClick = (userId: string) => {
    setStaffToDelete(userId)
    setDeleteDialogOpen(true)
  }

  // Silme onayı
  const confirmDeleteStaff = async () => {
    if (staffToDelete) {
      await mutate(`${API.tenant.settings}?userId=${staffToDelete}`, {
        method: "DELETE",
      })
      await refetch()
      toast.success("Personel Silindi", "Personel başarıyla silindi.")
    }
    setDeleteDialogOpen(false)
    setStaffToDelete(null)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const colors = [
    { name: "Turuncu", value: "#f97316" },
    { name: "Mavi", value: "#3b82f6" },
    { name: "Yeşil", value: "#22c55e" },
    { name: "Mor", value: "#8b5cf6" },
    { name: "Kırmızı", value: "#ef4444" },
    { name: "Pembe", value: "#ec4899" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">Restoran ve sistem ayarları</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            )}
          </Button>
          <Button onClick={handleSave} disabled={isMutating}>
            {isMutating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : showSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Kaydedildi
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Restoran Bilgileri</CardTitle>
              <CardDescription>Temel işletme bilgilerini düzenleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Restoran Adı</label>
                <input
                  type="text"
                  value={restaurant.name}
                  onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium">URL Slug</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/menu/</span>
                  <input
                    type="text"
                    value={restaurant.slug}
                    onChange={(e) => setRestaurant({ ...restaurant, slug: e.target.value })}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Açıklama</label>
                <textarea
                  value={restaurant.description || ""}
                  onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
              <CardDescription>Müşterilerin size ulaşabileceği bilgiler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Telefon</label>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={restaurant.phone || ""}
                    onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">E-posta</label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={restaurant.email || ""}
                    onChange={(e) => setRestaurant({ ...restaurant, email: e.target.value })}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Adres</label>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={restaurant.address || ""}
                    onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">İl</label>
                  <input
                    type="text"
                    value={restaurant.city || ""}
                    onChange={(e) => setRestaurant({ ...restaurant, city: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">İlçe</label>
                  <input
                    type="text"
                    value={restaurant.district || ""}
                    onChange={(e) => setRestaurant({ ...restaurant, district: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Logo ve Kapak Görseli</CardTitle>
              <CardDescription>Marka görsellerinizi yükleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                    <Store className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Logo</p>
                    <p className="text-sm text-muted-foreground">200x200 px önerilir</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Yükle
                  </Button>
                </div>
                <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-6">
                  <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-muted">
                    <Palette className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Kapak Görseli</p>
                    <p className="text-sm text-muted-foreground">1200x400 px önerilir</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Yükle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "hours" && (
        <Card>
          <CardHeader>
            <CardTitle>Çalışma Saatleri</CardTitle>
            <CardDescription>Haftalık açılış ve kapanış saatlerini belirleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="w-28">
                    <p className="font-medium">{dayNames[day]}</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={(e) =>
                        setWorkingHours({
                          ...workingHours,
                          [day]: { ...hours, isOpen: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Açık</span>
                  </label>
                  {hours.isOpen && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          setWorkingHours({
                            ...workingHours,
                            [day]: { ...hours, open: e.target.value },
                          })
                        }
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          setWorkingHours({
                            ...workingHours,
                            [day]: { ...hours, close: e.target.value },
                          })
                        }
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </>
                  )}
                  {!hours.isOpen && (
                    <span className="text-sm text-muted-foreground">Kapalı</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "appearance" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tema Rengi</CardTitle>
              <CardDescription>Ana renginizi seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setThemeColor(color.value)}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                      themeColor === color.value ? "border-primary ring-2 ring-primary" : ""
                    }`}
                  >
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm">{color.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menü Düzeni</CardTitle>
              <CardDescription>Menü görüntüleme şeklini seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-2 rounded-lg border-2 border-primary p-4 ring-2 ring-primary">
                  <div className="grid h-16 w-full grid-cols-2 gap-1">
                    <div className="rounded bg-muted" />
                    <div className="rounded bg-muted" />
                    <div className="rounded bg-muted" />
                    <div className="rounded bg-muted" />
                  </div>
                  <span className="text-sm font-medium">Grid</span>
                </button>
                <button className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-primary">
                  <div className="flex h-16 w-full flex-col gap-1">
                    <div className="h-5 rounded bg-muted" />
                    <div className="h-5 rounded bg-muted" />
                    <div className="h-5 rounded bg-muted" />
                  </div>
                  <span className="text-sm font-medium">Liste</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>AI Asistan Ayarları</CardTitle>
              <CardDescription>Sipariş asistanınızın davranışını özelleştirin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AI Asistan Aktif</p>
                  <p className="text-sm text-muted-foreground">Müşteriler chatbot ile etkileşebilir</p>
                </div>
                <button
                  onClick={() => setAiSettings({ ...aiSettings, enabled: !aiSettings.enabled })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    aiSettings.enabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      aiSettings.enabled ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium">Karşılama Mesajı</label>
                <textarea
                  value={aiSettings.welcomeMessage}
                  onChange={(e) => setAiSettings({ ...aiSettings, welcomeMessage: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Kişilik</label>
                <select
                  value={aiSettings.personality}
                  onChange={(e) => setAiSettings({ ...aiSettings, personality: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="friendly">Samimi ve Arkadaş Canlısı</option>
                  <option value="professional">Profesyonel ve Resmi</option>
                  <option value="casual">Rahat ve Gündelik</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Öneri Ayarları</CardTitle>
              <CardDescription>AI&apos;ın müşterilere öneri yapma davranışı</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Popüler Ürün Önerisi</p>
                  <p className="text-sm text-muted-foreground">En çok satanları öner</p>
                </div>
                <button
                  onClick={() => setAiSettings({ ...aiSettings, suggestPopular: !aiSettings.suggestPopular })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    aiSettings.suggestPopular ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      aiSettings.suggestPopular ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Upsell Önerisi</p>
                  <p className="text-sm text-muted-foreground">Ekstra ürün öner (tatlı, içecek)</p>
                </div>
                <button
                  onClick={() => setAiSettings({ ...aiSettings, suggestUpsell: !aiSettings.suggestUpsell })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    aiSettings.suggestUpsell ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      aiSettings.suggestUpsell ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "staff" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personel Yönetimi</CardTitle>
              <CardDescription>Ekibinizi yönetin ve yetkilerini düzenleyin</CardDescription>
            </div>
            <Button onClick={() => setIsAddStaffOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Personel Ekle
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        member.role === "TENANT_ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : member.role === "MANAGER"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {roleLabels[member.role] || member.role}
                    </span>
                    {member.role !== "TENANT_ADMIN" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteClick(member.id)}
                        disabled={isMutating}
                        aria-label="Personeli sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>Yeni Personel</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddStaffOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleAddStaff}>
                <div>
                  <label className="text-sm font-medium">Ad Soyad *</label>
                  <input
                    type="text"
                    placeholder="Personel adı"
                    value={staffForm.name}
                    onChange={(e) => { setStaffForm({ ...staffForm, name: e.target.value }); clearStaffFormError("name") }}
                    className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${staffFormErrors.name ? "border-destructive" : ""}`}
                  />
                  {staffFormErrors.name && <p className="mt-1 text-xs text-destructive">{staffFormErrors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">E-posta *</label>
                  <input
                    type="email"
                    placeholder="ornek@email.com"
                    value={staffForm.email}
                    onChange={(e) => { setStaffForm({ ...staffForm, email: e.target.value }); clearStaffFormError("email") }}
                    className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${staffFormErrors.email ? "border-destructive" : ""}`}
                  />
                  {staffFormErrors.email && <p className="mt-1 text-xs text-destructive">{staffFormErrors.email}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Şifre *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={staffForm.password}
                    onChange={(e) => { setStaffForm({ ...staffForm, password: e.target.value }); clearStaffFormError("password") }}
                    className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${staffFormErrors.password ? "border-destructive" : ""}`}
                  />
                  {staffFormErrors.password && <p className="mt-1 text-xs text-destructive">{staffFormErrors.password}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Rol *</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as "MANAGER" | "STAFF" })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="STAFF">Personel (Garson)</option>
                    <option value="MANAGER">Müdür</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddStaffOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isMutating}>
                    {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Ekle
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Silme Onay Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu personeli silmek istediğinize emin misiniz? Kullanıcı artık sisteme erişemeyecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStaff}>
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

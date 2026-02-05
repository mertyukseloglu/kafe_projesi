"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Calendar,
  X,
  Gift,
  ShoppingBag,
  Edit,
  MoreVertical,
} from "lucide-react"

// Demo müşteri verisi
interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  loyaltyPoints: number
  totalSpent: number
  visitCount: number
  lastVisitAt: string
  tags: string[]
  createdAt: string
  orders: {
    id: string
    orderNumber: string
    total: number
    date: string
    items: string[]
  }[]
}

const demoCustomers: Customer[] = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    phone: "555-123-4567",
    email: "ahmet@email.com",
    loyaltyPoints: 150,
    totalSpent: 1450,
    visitCount: 12,
    lastVisitAt: "2024-02-03",
    tags: ["vip", "düzenli"],
    createdAt: "2023-06-15",
    orders: [
      { id: "o1", orderNumber: "S045", total: 145, date: "2024-02-03", items: ["Latte", "Cheesecake"] },
      { id: "o2", orderNumber: "S038", total: 85, date: "2024-01-28", items: ["Türk Kahvesi", "Brownie"] },
      { id: "o3", orderNumber: "S025", total: 120, date: "2024-01-15", items: ["Cappuccino", "Sandviç"] },
    ],
  },
  {
    id: "2",
    name: "Ayşe Kaya",
    phone: "555-987-6543",
    email: "ayse.kaya@email.com",
    loyaltyPoints: 80,
    totalSpent: 680,
    visitCount: 6,
    lastVisitAt: "2024-01-25",
    tags: ["yeni"],
    createdAt: "2023-12-01",
    orders: [
      { id: "o4", orderNumber: "S032", total: 95, date: "2024-01-25", items: ["Ice Latte", "Tiramisu"] },
      { id: "o5", orderNumber: "S019", total: 65, date: "2024-01-10", items: ["Limonata", "Kurabiye"] },
    ],
  },
  {
    id: "3",
    name: "Mehmet Demir",
    phone: "555-444-3322",
    loyaltyPoints: 320,
    totalSpent: 2890,
    visitCount: 24,
    lastVisitAt: "2024-02-04",
    tags: ["vip", "düzenli", "kahve sever"],
    createdAt: "2023-01-20",
    orders: [
      { id: "o6", orderNumber: "S048", total: 180, date: "2024-02-04", items: ["Filtre Kahve x2", "Cheesecake", "Tost"] },
      { id: "o7", orderNumber: "S042", total: 95, date: "2024-02-01", items: ["Latte", "Brownie"] },
    ],
  },
  {
    id: "4",
    name: "Zeynep Aksoy",
    email: "zeynep@company.com",
    loyaltyPoints: 45,
    totalSpent: 320,
    visitCount: 3,
    lastVisitAt: "2024-01-18",
    tags: ["yeni"],
    createdAt: "2024-01-05",
    orders: [
      { id: "o8", orderNumber: "S022", total: 120, date: "2024-01-18", items: ["Smoothie", "Sandviç"] },
    ],
  },
  {
    id: "5",
    name: "Can Özkan",
    phone: "555-222-1111",
    email: "can.ozkan@email.com",
    loyaltyPoints: 200,
    totalSpent: 1850,
    visitCount: 15,
    lastVisitAt: "2024-02-02",
    tags: ["düzenli", "tatlı sever"],
    createdAt: "2023-08-10",
    orders: [
      { id: "o9", orderNumber: "S046", total: 165, date: "2024-02-02", items: ["Sıcak Çikolata", "San Sebastian", "Tiramisu"] },
    ],
  },
]

// İstatistikler
const stats = {
  totalCustomers: 156,
  newThisMonth: 23,
  avgLoyaltyPoints: 125,
  totalLoyaltyGiven: 19500,
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("lastVisit")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filtreleme
  const filteredCustomers = demoCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag = selectedTag === "all" || customer.tags.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  // Sıralama
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "lastVisit":
        return new Date(b.lastVisitAt).getTime() - new Date(a.lastVisitAt).getTime()
      case "totalSpent":
        return b.totalSpent - a.totalSpent
      case "loyaltyPoints":
        return b.loyaltyPoints - a.loyaltyPoints
      case "visitCount":
        return b.visitCount - a.visitCount
      default:
        return 0
    }
  })

  const allTags = ["all", "vip", "düzenli", "yeni", "kahve sever", "tatlı sever"]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Bugün"
    if (diffDays === 1) return "Dün"
    if (diffDays < 7) return `${diffDays} gün önce`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`
    return date.toLocaleDateString("tr-TR")
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "vip":
        return "bg-yellow-100 text-yellow-800"
      case "düzenli":
        return "bg-green-100 text-green-800"
      case "yeni":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Müşteriler</h1>
          <p className="text-muted-foreground">Müşteri bilgileri ve sadakat programı</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Müşteri
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Müşteri</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bu Ay Yeni</p>
                <p className="text-2xl font-bold">{stats.newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ort. Puan</p>
                <p className="text-2xl font-bold">{stats.avgLoyaltyPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Puan</p>
                <p className="text-2xl font-bold">{stats.totalLoyaltyGiven.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Arama */}
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="İsim, telefon veya email ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Tag filtreleri */}
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {tag === "all" ? "Tümü" : tag}
                </button>
              ))}
            </div>

            {/* Sıralama */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="lastVisit">Son Ziyaret</option>
              <option value="totalSpent">Toplam Harcama</option>
              <option value="loyaltyPoints">Puan</option>
              <option value="visitCount">Ziyaret Sayısı</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Müşteri Listesi */}
      <div className="space-y-3">
        {sortedCustomers.map((customer) => (
          <Card
            key={customer.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setSelectedCustomer(customer)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Sol: Müşteri Bilgisi */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {customer.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                      )}
                      {customer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {customer.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-2 py-0.5 text-xs ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sağ: İstatistikler */}
                <div className="hidden items-center gap-6 text-center sm:flex">
                  <div>
                    <p className="text-lg font-semibold text-yellow-600">
                      <Star className="mr-1 inline h-4 w-4" />
                      {customer.loyaltyPoints}
                    </p>
                    <p className="text-xs text-muted-foreground">Puan</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">₺{customer.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Harcama</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{customer.visitCount}</p>
                    <p className="text-xs text-muted-foreground">Ziyaret</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(customer.lastVisitAt)}</p>
                    <p className="text-xs text-muted-foreground">Son ziyaret</p>
                  </div>
                </div>

                {/* Mobil için istatistikler */}
                <div className="flex items-center gap-2 sm:hidden">
                  <span className="flex items-center text-sm text-yellow-600">
                    <Star className="mr-1 h-4 w-4" />
                    {customer.loyaltyPoints}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedCustomers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">Müşteri bulunamadı</p>
              <p className="text-sm text-muted-foreground">Arama kriterlerinize uygun müşteri yok</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Müşteri Detay Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between border-b">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                  {selectedCustomer.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <CardTitle>{selectedCustomer.name}</CardTitle>
                  <div className="mt-1 flex gap-1">
                    {selectedCustomer.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-2 py-0.5 text-xs ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">
              {/* İletişim Bilgileri */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefon</p>
                      <p className="font-medium">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">E-posta</p>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Müşteri Oldu</p>
                    <p className="font-medium">{new Date(selectedCustomer.createdAt).toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <Star className="mx-auto h-6 w-6 text-yellow-500" />
                  <p className="mt-2 text-2xl font-bold">{selectedCustomer.loyaltyPoints}</p>
                  <p className="text-sm text-muted-foreground">Sadakat Puanı</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <TrendingUp className="mx-auto h-6 w-6 text-green-500" />
                  <p className="mt-2 text-2xl font-bold">₺{selectedCustomer.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <ShoppingBag className="mx-auto h-6 w-6 text-blue-500" />
                  <p className="mt-2 text-2xl font-bold">{selectedCustomer.visitCount}</p>
                  <p className="text-sm text-muted-foreground">Ziyaret</p>
                </div>
              </div>

              {/* Sipariş Geçmişi */}
              <div>
                <h3 className="mb-3 font-semibold">Son Siparişler</h3>
                <div className="space-y-2">
                  {selectedCustomer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.items.join(", ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₺{order.total}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Puan İşlemleri */}
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Gift className="mr-2 h-4 w-4" />
                  Puan Ekle
                </Button>
                <Button variant="outline" className="flex-1">
                  <Star className="mr-2 h-4 w-4" />
                  Puan Kullan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Yeni Müşteri Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>Yeni Müşteri</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Ad Soyad *</label>
                  <input
                    type="text"
                    placeholder="Müşteri adı"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefon</label>
                  <input
                    type="tel"
                    placeholder="555-XXX-XXXX"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">E-posta</label>
                  <input
                    type="email"
                    placeholder="ornek@email.com"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Başlangıç Puanı</label>
                  <input
                    type="number"
                    placeholder="0"
                    defaultValue={0}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1">
                    Kaydet
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

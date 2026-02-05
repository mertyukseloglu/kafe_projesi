"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FolderOpen,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { useFetch, useMutation, API } from "@/hooks/use-api"

// Tip tanımları
interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  isActive: boolean
  sortOrder: number
  itemCount?: number
}

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  category: { id: string; name: string }
  tags: string[]
  allergens: string[]
  isAvailable: boolean
  isFeatured: boolean
  sortOrder: number
}

interface MenuData {
  items: MenuItem[]
  categories: Category[]
}

// Demo kategoriler
const demoCategories: Category[] = [
  { id: "1", name: "Sıcak İçecekler", isActive: true, sortOrder: 1, itemCount: 6 },
  { id: "2", name: "Soğuk İçecekler", isActive: true, sortOrder: 2, itemCount: 4 },
  { id: "3", name: "Tatlılar", isActive: true, sortOrder: 3, itemCount: 4 },
  { id: "4", name: "Atıştırmalıklar", isActive: true, sortOrder: 4, itemCount: 4 },
]

// Demo menü öğeleri
const demoMenuItems: MenuItem[] = [
  { id: "1", name: "Türk Kahvesi", price: 45, category: { id: "1", name: "Sıcak İçecekler" }, isAvailable: true, isFeatured: false, tags: ["popüler"], allergens: [], sortOrder: 1 },
  { id: "2", name: "Latte", price: 65, category: { id: "1", name: "Sıcak İçecekler" }, isAvailable: true, isFeatured: false, tags: [], allergens: ["süt"], sortOrder: 2 },
  { id: "3", name: "Cappuccino", price: 60, category: { id: "1", name: "Sıcak İçecekler" }, isAvailable: true, isFeatured: false, tags: ["popüler"], allergens: ["süt"], sortOrder: 3 },
  { id: "4", name: "Filtre Kahve", price: 40, category: { id: "1", name: "Sıcak İçecekler" }, isAvailable: true, isFeatured: false, tags: [], allergens: [], sortOrder: 4 },
  { id: "5", name: "Sıcak Çikolata", price: 55, category: { id: "1", name: "Sıcak İçecekler" }, isAvailable: true, isFeatured: false, tags: [], allergens: ["süt"], sortOrder: 5 },
  { id: "6", name: "Çay", price: 20, category: { id: "1", name: "Sıcak İçecekler" }, isAvailable: true, isFeatured: false, tags: [], allergens: [], sortOrder: 6 },
  { id: "7", name: "Ice Latte", price: 70, category: { id: "2", name: "Soğuk İçecekler" }, isAvailable: true, isFeatured: false, tags: [], allergens: ["süt"], sortOrder: 1 },
  { id: "8", name: "Limonata", price: 45, category: { id: "2", name: "Soğuk İçecekler" }, isAvailable: true, isFeatured: false, tags: ["vegan"], allergens: [], sortOrder: 2 },
  { id: "9", name: "Ice Americano", price: 55, category: { id: "2", name: "Soğuk İçecekler" }, isAvailable: true, isFeatured: false, tags: [], allergens: [], sortOrder: 3 },
  { id: "10", name: "Smoothie", price: 65, category: { id: "2", name: "Soğuk İçecekler" }, isAvailable: false, isFeatured: false, tags: ["vegan", "yeni"], allergens: [], sortOrder: 4 },
  { id: "11", name: "Cheesecake", price: 85, category: { id: "3", name: "Tatlılar" }, isAvailable: true, isFeatured: true, tags: ["popüler"], allergens: ["süt", "gluten"], sortOrder: 1 },
  { id: "12", name: "Tiramisu", price: 90, category: { id: "3", name: "Tatlılar" }, isAvailable: true, isFeatured: false, tags: [], allergens: ["süt", "gluten", "yumurta"], sortOrder: 2 },
  { id: "13", name: "Brownie", price: 75, category: { id: "3", name: "Tatlılar" }, isAvailable: true, isFeatured: false, tags: [], allergens: ["süt", "gluten", "yumurta"], sortOrder: 3 },
  { id: "14", name: "San Sebastian", price: 95, category: { id: "3", name: "Tatlılar" }, isAvailable: true, isFeatured: false, tags: ["yeni"], allergens: ["süt", "gluten", "yumurta"], sortOrder: 4 },
  { id: "15", name: "Sandviç", price: 95, category: { id: "4", name: "Atıştırmalıklar" }, isAvailable: true, isFeatured: false, tags: [], allergens: ["gluten"], sortOrder: 1 },
  { id: "16", name: "Tost", price: 65, category: { id: "4", name: "Atıştırmalıklar" }, isAvailable: true, isFeatured: false, tags: [], allergens: ["gluten", "süt"], sortOrder: 2 },
  { id: "17", name: "Kurabiye", price: 35, category: { id: "4", name: "Atıştırmalıklar" }, isAvailable: true, isFeatured: false, tags: ["vegan"], allergens: ["gluten"], sortOrder: 3 },
  { id: "18", name: "Muffin", price: 45, category: { id: "4", name: "Atıştırmalıklar" }, isAvailable: true, isFeatured: false, tags: [], allergens: ["gluten", "süt", "yumurta"], sortOrder: 4 },
]

export default function MenuPage() {
  const { data, isLoading, refetch } = useFetch<MenuData>(API.tenant.menu)
  const { mutate, isLoading: isMutating } = useMutation()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form state for new/edit item
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    tags: [] as string[],
    isAvailable: true,
  })

  // Use API data or fallback to demo
  const categories = data?.categories || demoCategories
  const menuItems = data?.items || demoMenuItems

  // Filtreleme
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (selectedCategory && item.category.id !== selectedCategory) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!item.name.toLowerCase().includes(query)) return false
      }
      return true
    })
  }, [menuItems, selectedCategory, searchQuery])

  // Görünürlük toggle
  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    await mutate(API.tenant.menu, {
      method: "PATCH",
      body: JSON.stringify({ id: itemId, isAvailable: !currentStatus }),
    })
    await refetch()
  }

  // Silme
  const deleteItem = async (itemId: string) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      await mutate(`${API.tenant.menu}?id=${itemId}`, {
        method: "DELETE",
      })
      await refetch()
    }
  }

  // Yeni ürün ekle
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    await mutate(API.tenant.menu, {
      method: "POST",
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        tags: formData.tags,
        isAvailable: formData.isAvailable,
      }),
    })
    setShowAddModal(false)
    setFormData({ name: "", description: "", price: "", categoryId: "", tags: [], isAvailable: true })
    await refetch()
  }

  // Ürün güncelle
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    await mutate(API.tenant.menu, {
      method: "PATCH",
      body: JSON.stringify({
        id: editItem.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        tags: formData.tags,
        isAvailable: formData.isAvailable,
      }),
    })
    setEditItem(null)
    setFormData({ name: "", description: "", price: "", categoryId: "", tags: [], isAvailable: true })
    await refetch()
  }

  // Edit modal aç
  const openEditModal = (item: MenuItem) => {
    setEditItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      categoryId: item.category.id,
      tags: item.tags,
      isAvailable: item.isAvailable,
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
          <h1 className="text-2xl font-bold sm:text-3xl">Menü Yönetimi</h1>
          <p className="text-muted-foreground">Kategoriler ve ürünleri düzenle</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            )}
          </Button>
          <Button variant="outline" onClick={() => setShowCategoryModal(true)}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Kategori Ekle
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ürün Ekle
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          Tümü ({menuItems.length})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="whitespace-nowrap"
          >
            {cat.name} ({menuItems.filter(i => i.category.id === cat.id).length})
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          return (
            <Card
              key={item.id}
              className={`overflow-hidden transition-opacity ${!item.isAvailable ? "opacity-60" : ""}`}
            >
              <CardContent className="p-0">
                {/* Item Image Placeholder */}
                <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  )}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded bg-black/60 px-2 py-1 text-sm font-medium text-white">
                        Satışta Değil
                      </span>
                    </div>
                  )}
                  {item.tags.length > 0 && (
                    <div className="absolute left-2 top-2 flex gap-1">
                      {item.tags.map(tag => (
                        <span
                          key={tag}
                          className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category.name}</p>
                    </div>
                    <span className="text-lg font-bold">₺{item.price}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditModal(item)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleAvailability(item.id, item.isAvailable)}
                      title={item.isAvailable ? "Satıştan Kaldır" : "Satışa Aç"}
                      disabled={isMutating}
                    >
                      {item.isAvailable ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => deleteItem(item.id)}
                      disabled={isMutating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "Arama sonucu bulunamadı" : "Bu kategoride ürün yok"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {editItem ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
              </h2>

              <form className="space-y-4" onSubmit={editItem ? handleUpdateItem : handleAddItem}>
                <div>
                  <label className="mb-1 block text-sm font-medium">Ürün Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="örn: Latte"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Fiyat (₺)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="65"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Seçin...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                    placeholder="Ürün açıklaması..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="isAvailable" className="text-sm">Satışta</label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowAddModal(false); setEditItem(null); }}
                  >
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isMutating}>
                    {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editItem ? "Güncelle" : "Ekle"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Yeni Kategori Ekle</h2>

              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const nameInput = form.elements.namedItem("categoryName") as HTMLInputElement
                await mutate(API.tenant.categories, {
                  method: "POST",
                  body: JSON.stringify({ name: nameInput.value }),
                })
                setShowCategoryModal(false)
                await refetch()
              }}>
                <div>
                  <label className="mb-1 block text-sm font-medium">Kategori Adı</label>
                  <input
                    type="text"
                    name="categoryName"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="örn: Kahvaltı"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCategoryModal(false)}
                  >
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
    </div>
  )
}

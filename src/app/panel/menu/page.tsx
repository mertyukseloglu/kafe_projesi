"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  FolderOpen,
} from "lucide-react"

// Demo kategoriler
const demoCategories = [
  { id: "1", name: "Sıcak İçecekler", itemCount: 6, isActive: true },
  { id: "2", name: "Soğuk İçecekler", itemCount: 4, isActive: true },
  { id: "3", name: "Tatlılar", itemCount: 4, isActive: true },
  { id: "4", name: "Atıştırmalıklar", itemCount: 4, isActive: true },
]

// Demo menü öğeleri
const demoMenuItems = [
  { id: "1", name: "Türk Kahvesi", price: 45, category: "1", isAvailable: true, tags: ["popüler"] },
  { id: "2", name: "Latte", price: 65, category: "1", isAvailable: true, tags: [] },
  { id: "3", name: "Cappuccino", price: 60, category: "1", isAvailable: true, tags: ["popüler"] },
  { id: "4", name: "Filtre Kahve", price: 40, category: "1", isAvailable: true, tags: [] },
  { id: "5", name: "Sıcak Çikolata", price: 55, category: "1", isAvailable: true, tags: [] },
  { id: "6", name: "Çay", price: 20, category: "1", isAvailable: true, tags: [] },
  { id: "7", name: "Ice Latte", price: 70, category: "2", isAvailable: true, tags: [] },
  { id: "8", name: "Limonata", price: 45, category: "2", isAvailable: true, tags: ["vegan"] },
  { id: "9", name: "Ice Americano", price: 55, category: "2", isAvailable: true, tags: [] },
  { id: "10", name: "Smoothie", price: 65, category: "2", isAvailable: false, tags: ["vegan", "yeni"] },
  { id: "11", name: "Cheesecake", price: 85, category: "3", isAvailable: true, tags: ["popüler"] },
  { id: "12", name: "Tiramisu", price: 90, category: "3", isAvailable: true, tags: [] },
  { id: "13", name: "Brownie", price: 75, category: "3", isAvailable: true, tags: [] },
  { id: "14", name: "San Sebastian", price: 95, category: "3", isAvailable: true, tags: ["yeni"] },
  { id: "15", name: "Sandviç", price: 95, category: "4", isAvailable: true, tags: [] },
  { id: "16", name: "Tost", price: 65, category: "4", isAvailable: true, tags: [] },
  { id: "17", name: "Kurabiye", price: 35, category: "4", isAvailable: true, tags: ["vegan"] },
  { id: "18", name: "Muffin", price: 45, category: "4", isAvailable: true, tags: [] },
]

export default function MenuPage() {
  const [categories] = useState(demoCategories)
  const [menuItems, setMenuItems] = useState(demoMenuItems)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState<typeof demoMenuItems[0] | null>(null)

  // Filtreleme
  const filteredItems = menuItems.filter(item => {
    if (selectedCategory && item.category !== selectedCategory) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!item.name.toLowerCase().includes(query)) return false
    }
    return true
  })

  // Görünürlük toggle
  const toggleAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    ))
  }

  // Silme
  const deleteItem = (itemId: string) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      setMenuItems(prev => prev.filter(item => item.id !== itemId))
    }
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
          <Button variant="outline" onClick={() => alert("Kategori ekleme - Yakında!")}>
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
            {cat.name} ({menuItems.filter(i => i.category === cat.id).length})
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const category = categories.find(c => c.id === item.category)
          return (
            <Card
              key={item.id}
              className={`overflow-hidden transition-opacity ${!item.isAvailable ? "opacity-60" : ""}`}
            >
              <CardContent className="p-0">
                {/* Item Image Placeholder */}
                <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50">
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
                      <p className="text-xs text-muted-foreground">{category?.name}</p>
                    </div>
                    <span className="text-lg font-bold">₺{item.price}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditItem(item)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleAvailability(item.id)}
                      title={item.isAvailable ? "Satıştan Kaldır" : "Satışa Aç"}
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

      {/* Add/Edit Modal (Simplified) */}
      {(showAddModal || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {editItem ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
              </h2>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); setEditItem(null); }}>
                <div>
                  <label className="mb-1 block text-sm font-medium">Ürün Adı</label>
                  <input
                    type="text"
                    defaultValue={editItem?.name || ""}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="örn: Latte"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Fiyat (₺)</label>
                  <input
                    type="number"
                    defaultValue={editItem?.price || ""}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="65"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Kategori</label>
                  <select
                    defaultValue={editItem?.category || ""}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                    placeholder="Ürün açıklaması..."
                  />
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
                  <Button type="submit" className="flex-1">
                    {editItem ? "Güncelle" : "Ekle"}
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

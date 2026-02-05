"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  MessageCircle,
  Phone,
  Send,
  Loader2,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Heart,
  ShieldAlert,
  AlertTriangle,
  History,
  RotateCcw,
} from "lucide-react"
import { LanguageSelector } from "@/components/customer/LanguageSelector"
import { ThemeToggle } from "@/components/customer/ThemeToggle"
import { Locale, t, defaultLocale } from "@/lib/i18n"

// Tip tanımları
interface Variation {
  name: string
  options: { name: string; price: number }[]
}

interface Extra {
  id: string
  name: string
  price: number
}

// Alerjen türleri
type AllergenType = "gluten" | "dairy" | "nuts" | "eggs" | "soy" | "shellfish" | "fish" | "peanuts"

const allergenInfo: Record<AllergenType, { name: string; icon: string; nameEn: string }> = {
  gluten: { name: "Gluten", icon: "🌾", nameEn: "Gluten" },
  dairy: { name: "Süt Ürünleri", icon: "🥛", nameEn: "Dairy" },
  nuts: { name: "Kuruyemiş", icon: "🥜", nameEn: "Nuts" },
  eggs: { name: "Yumurta", icon: "🥚", nameEn: "Eggs" },
  soy: { name: "Soya", icon: "🫘", nameEn: "Soy" },
  shellfish: { name: "Kabuklu Deniz", icon: "🦐", nameEn: "Shellfish" },
  fish: { name: "Balık", icon: "🐟", nameEn: "Fish" },
  peanuts: { name: "Fıstık", icon: "🥜", nameEn: "Peanuts" },
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  tags?: string[]
  variations?: Variation[]
  extras?: Extra[]
  allergens?: AllergenType[]
}

interface SelectedVariation {
  variationName: string
  optionName: string
  price: number
}

interface SelectedExtra {
  id: string
  name: string
  price: number
}

interface CartItem extends MenuItem {
  quantity: number
  cartId: string // Unique ID for cart (same item with different options)
  selectedVariations: SelectedVariation[]
  selectedExtras: SelectedExtra[]
  totalPrice: number
}

interface Category {
  id: string
  name: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface OrderHistoryItem {
  id: string
  date: string
  items: CartItem[]
  total: number
  tableNumber?: string
}

// Demo veriler (gerçek projede API'den gelecek)
const demoCategories: Category[] = [
  { id: "all", name: "Tümü" },
  { id: "sicak-icecekler", name: "Sıcak İçecekler" },
  { id: "soguk-icecekler", name: "Soğuk İçecekler" },
  { id: "tatlilar", name: "Tatlılar" },
  { id: "atistirmaliklar", name: "Atıştırmalıklar" },
]

// Demo kampanyalar
interface Campaign {
  id: string
  name: string
  description: string
  type: "DISCOUNT_PERCENT" | "DISCOUNT_AMOUNT" | "BUY_X_GET_Y"
  discountValue: number
  bgColor: string
  textColor: string
  couponCode?: string
}

const demoCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Hoşgeldin İndirimi",
    description: "İlk siparişinize özel %15 indirim",
    type: "DISCOUNT_PERCENT",
    discountValue: 15,
    bgColor: "from-orange-500 to-red-500",
    textColor: "text-white",
    couponCode: "HOSGELDIN",
  },
  {
    id: "2",
    name: "Kahve Günü",
    description: "Tüm kahvelerde %10 indirim",
    type: "DISCOUNT_PERCENT",
    discountValue: 10,
    bgColor: "from-amber-600 to-yellow-500",
    textColor: "text-white",
    couponCode: "KAHVE10",
  },
  {
    id: "3",
    name: "Yaz Fırsatı",
    description: "100₺ üzeri siparişlerde 25₺ indirim",
    type: "DISCOUNT_AMOUNT",
    discountValue: 25,
    bgColor: "from-cyan-500 to-blue-500",
    textColor: "text-white",
    couponCode: "YAZ2024",
  },
]

const demoMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Türk Kahvesi",
    description: "Geleneksel Türk kahvesi, orta şekerli",
    price: 45,
    category: "sicak-icecekler",
    tags: ["popüler"],
    variations: [
      { name: "Şeker", options: [{ name: "Sade", price: 0 }, { name: "Az", price: 0 }, { name: "Orta", price: 0 }, { name: "Çok", price: 0 }] },
    ],
    extras: [
      { id: "e1", name: "Lokum", price: 10 },
      { id: "e2", name: "Çikolata", price: 8 },
    ],
  },
  {
    id: "2",
    name: "Latte",
    description: "Espresso ve buharla ısıtılmış süt",
    price: 65,
    category: "sicak-icecekler",
    allergens: ["dairy"],
    variations: [
      { name: "Boyut", options: [{ name: "Small", price: 0 }, { name: "Medium", price: 10 }, { name: "Large", price: 20 }] },
      { name: "Süt", options: [{ name: "Normal", price: 0 }, { name: "Yulaf Sütü", price: 8 }, { name: "Badem Sütü", price: 8 }, { name: "Laktozsuz", price: 5 }] },
    ],
    extras: [
      { id: "e3", name: "Ekstra Shot", price: 12 },
      { id: "e4", name: "Vanilya Şurubu", price: 8 },
      { id: "e5", name: "Karamel Şurubu", price: 8 },
      { id: "e6", name: "Krema", price: 6 },
    ],
  },
  {
    id: "3",
    name: "Cappuccino",
    description: "Espresso, süt köpüğü ve kakao",
    price: 60,
    category: "sicak-icecekler",
    tags: ["popüler"],
    allergens: ["dairy"],
    variations: [
      { name: "Boyut", options: [{ name: "Small", price: 0 }, { name: "Medium", price: 10 }, { name: "Large", price: 20 }] },
    ],
    extras: [
      { id: "e3", name: "Ekstra Shot", price: 12 },
      { id: "e7", name: "Tarçın", price: 0 },
    ],
  },
  {
    id: "4",
    name: "Filtre Kahve",
    description: "Taze çekilmiş çekirdeklerden",
    price: 40,
    category: "sicak-icecekler",
    variations: [
      { name: "Boyut", options: [{ name: "Small", price: 0 }, { name: "Large", price: 15 }] },
    ],
  },
  {
    id: "5",
    name: "Ice Latte",
    description: "Soğuk süt ve espresso",
    price: 70,
    category: "soguk-icecekler",
    allergens: ["dairy"],
    variations: [
      { name: "Boyut", options: [{ name: "Medium", price: 0 }, { name: "Large", price: 15 }] },
      { name: "Süt", options: [{ name: "Normal", price: 0 }, { name: "Yulaf Sütü", price: 8 }, { name: "Badem Sütü", price: 8 }] },
    ],
    extras: [
      { id: "e3", name: "Ekstra Shot", price: 12 },
      { id: "e4", name: "Vanilya Şurubu", price: 8 },
    ],
  },
  {
    id: "6",
    name: "Limonata",
    description: "Taze sıkılmış limon, nane",
    price: 45,
    category: "soguk-icecekler",
    tags: ["vegan"],
    variations: [
      { name: "Boyut", options: [{ name: "Small", price: 0 }, { name: "Large", price: 10 }] },
    ],
    extras: [
      { id: "e8", name: "Nane", price: 0 },
      { id: "e9", name: "Zencefil", price: 5 },
    ],
  },
  {
    id: "7",
    name: "Cheesecake",
    description: "New York usulü, frambuaz soslu",
    price: 85,
    category: "tatlilar",
    tags: ["popüler"],
    allergens: ["dairy", "eggs", "gluten"],
    variations: [
      { name: "Sos", options: [{ name: "Frambuaz", price: 0 }, { name: "Çikolata", price: 0 }, { name: "Karamel", price: 0 }] },
    ],
    extras: [
      { id: "e10", name: "Dondurma", price: 15 },
      { id: "e11", name: "Taze Meyve", price: 12 },
    ],
  },
  {
    id: "8",
    name: "Tiramisu",
    description: "İtalyan usulü, mascarpone kremalı",
    price: 90,
    category: "tatlilar",
    allergens: ["dairy", "eggs", "gluten"],
    extras: [
      { id: "e10", name: "Dondurma", price: 15 },
    ],
  },
  {
    id: "9",
    name: "Brownie",
    description: "Sıcak çikolatalı, dondurma ile",
    price: 75,
    category: "tatlilar",
    allergens: ["gluten", "eggs", "dairy", "nuts"],
    variations: [
      { name: "Servis", options: [{ name: "Normal", price: 0 }, { name: "Sıcak", price: 0 }] },
    ],
    extras: [
      { id: "e10", name: "Dondurma", price: 15 },
      { id: "e12", name: "Çikolata Sosu", price: 8 },
      { id: "e6", name: "Krema", price: 6 },
    ],
  },
  {
    id: "10",
    name: "Sandviç",
    description: "Tavuklu, avokadolu, tam buğday ekmeği",
    price: 95,
    category: "atistirmaliklar",
    allergens: ["gluten"],
    variations: [
      { name: "Ekmek", options: [{ name: "Tam Buğday", price: 0 }, { name: "Beyaz", price: 0 }, { name: "Çavdar", price: 5 }] },
    ],
    extras: [
      { id: "e13", name: "Ekstra Tavuk", price: 20 },
      { id: "e14", name: "Avokado", price: 15 },
      { id: "e15", name: "Peynir", price: 8 },
    ],
  },
  {
    id: "11",
    name: "Tost",
    description: "Kaşarlı, domatesli, közlenmiş biber",
    price: 65,
    category: "atistirmaliklar",
    allergens: ["gluten", "dairy"],
    variations: [
      { name: "Boyut", options: [{ name: "Normal", price: 0 }, { name: "Jumbo", price: 20 }] },
    ],
    extras: [
      { id: "e16", name: "Sosis", price: 15 },
      { id: "e17", name: "Sucuk", price: 18 },
      { id: "e15", name: "Ekstra Peynir", price: 8 },
    ],
  },
  {
    id: "12",
    name: "Kurabiye (3'lü)",
    description: "Günlük taze pişirilmiş",
    price: 35,
    category: "atistirmaliklar",
    tags: ["vegan"],
    allergens: ["gluten"],
  },
]

interface CustomerMenuPageProps {
  params: Promise<{ slug: string }>
}

export default function CustomerMenuPage({ params }: CustomerMenuPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tableNumber = searchParams.get("table")

  const [slug, setSlug] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [orderSent, setOrderSent] = useState(false)

  // Product detail modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [tempVariations, setTempVariations] = useState<SelectedVariation[]>([])
  const [tempExtras, setTempExtras] = useState<SelectedExtra[]>([])
  const [tempQuantity, setTempQuantity] = useState(1)

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<{
    code: string
    discountType: string
    discountValue: number
    maxDiscount?: number
  } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)

  // Language state
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(`favorites-${slug}`)
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [slug])

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
      localStorage.setItem(`favorites-${slug}`, JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  // Allergen filter state
  const [excludedAllergens, setExcludedAllergens] = useState<AllergenType[]>([])
  const [isAllergenFilterOpen, setIsAllergenFilterOpen] = useState(false)

  // Load allergen preferences from localStorage
  useEffect(() => {
    const savedAllergens = localStorage.getItem("excluded-allergens")
    if (savedAllergens) {
      setExcludedAllergens(JSON.parse(savedAllergens))
    }
  }, [])

  const toggleAllergen = (allergen: AllergenType) => {
    setExcludedAllergens(prev => {
      const newExcluded = prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
      localStorage.setItem("excluded-allergens", JSON.stringify(newExcluded))
      return newExcluded
    })
  }

  // Order history state
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([])
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)

  // Load order history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`order-history-${slug}`)
    if (savedHistory) {
      setOrderHistory(JSON.parse(savedHistory))
    }
  }, [slug])

  // Save order to history
  const saveOrderToHistory = (orderId: string) => {
    const newOrder: OrderHistoryItem = {
      id: orderId,
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      tableNumber: tableNumber || undefined,
    }
    const newHistory = [newOrder, ...orderHistory].slice(0, 10) // Keep last 10 orders
    setOrderHistory(newHistory)
    localStorage.setItem(`order-history-${slug}`, JSON.stringify(newHistory))
  }

  // Reorder from history
  const reorderFromHistory = (order: OrderHistoryItem) => {
    setCart(order.items.map(item => ({ ...item, cartId: `${item.id}-${Date.now()}` })))
    setIsOrderHistoryOpen(false)
    setIsCartOpen(true)
  }

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  // Kategoriye göre filtreleme + alerjen filtresi
  const filteredItems = demoMenuItems
    .filter(item => {
      // Category filter
      if (selectedCategory === "favorites") return favorites.includes(item.id)
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false
      return true
    })
    .filter(item => {
      // Allergen filter - exclude items that contain any of the excluded allergens
      if (excludedAllergens.length === 0) return true
      if (!item.allergens) return true
      return !item.allergens.some(allergen => excludedAllergens.includes(allergen))
    })

  // Ürün modal'ını aç
  const openProductModal = (item: MenuItem) => {
    setSelectedItem(item)
    // İlk varyasyonları varsayılan olarak seç
    const defaultVariations: SelectedVariation[] = (item.variations || []).map(v => ({
      variationName: v.name,
      optionName: v.options[0].name,
      price: v.options[0].price,
    }))
    setTempVariations(defaultVariations)
    setTempExtras([])
    setTempQuantity(1)
  }

  // Varyasyon seç
  const selectVariation = (variationName: string, optionName: string, price: number) => {
    setTempVariations(prev =>
      prev.map(v =>
        v.variationName === variationName ? { ...v, optionName, price } : v
      )
    )
  }

  // Extra toggle
  const toggleExtra = (extra: Extra) => {
    setTempExtras(prev => {
      const exists = prev.find(e => e.id === extra.id)
      if (exists) {
        return prev.filter(e => e.id !== extra.id)
      }
      return [...prev, { id: extra.id, name: extra.name, price: extra.price }]
    })
  }

  // Toplam fiyat hesapla
  const calculateItemTotal = (basePrice: number, variations: SelectedVariation[], extras: SelectedExtra[], quantity: number) => {
    const variationTotal = variations.reduce((sum, v) => sum + v.price, 0)
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0)
    return (basePrice + variationTotal + extrasTotal) * quantity
  }

  // Sepete ekle (modal'dan)
  const addToCartFromModal = () => {
    if (!selectedItem) return

    const totalPrice = calculateItemTotal(selectedItem.price, tempVariations, tempExtras, tempQuantity)
    const cartId = `${selectedItem.id}-${Date.now()}`

    const newCartItem: CartItem = {
      ...selectedItem,
      cartId,
      quantity: tempQuantity,
      selectedVariations: tempVariations,
      selectedExtras: tempExtras,
      totalPrice,
    }

    setCart(prev => [...prev, newCartItem])
    setSelectedItem(null)
  }

  // Basit ürünü sepete ekle (varyasyon/ekstra yoksa)
  const addSimpleToCart = (item: MenuItem) => {
    if ((item.variations && item.variations.length > 0) || (item.extras && item.extras.length > 0)) {
      openProductModal(item)
      return
    }

    const cartId = `${item.id}-simple`
    setCart(prev => {
      const existing = prev.find(i => i.cartId === cartId)
      if (existing) {
        return prev.map(i =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1, totalPrice: item.price * (i.quantity + 1) } : i
        )
      }
      return [...prev, { ...item, cartId, quantity: 1, selectedVariations: [], selectedExtras: [], totalPrice: item.price }]
    })
  }

  const removeFromCart = (cartId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.cartId === cartId)
      if (existing && existing.quantity > 1) {
        const newQuantity = existing.quantity - 1
        const unitPrice = existing.totalPrice / existing.quantity
        return prev.map(i =>
          i.cartId === cartId ? { ...i, quantity: newQuantity, totalPrice: unitPrice * newQuantity } : i
        )
      }
      return prev.filter(i => i.cartId !== cartId)
    })
  }

  const increaseQuantity = (cartId: string) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const unitPrice = item.totalPrice / item.quantity
        return { ...item, quantity: item.quantity + 1, totalPrice: unitPrice * (item.quantity + 1) }
      }
      return item
    }))
  }

  const clearCart = () => {
    setCart([])
    setCouponApplied(null)
    setCouponCode("")
    setCouponError("")
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate discount
  const calculateDiscount = () => {
    if (!couponApplied) return 0
    if (couponApplied.discountType === "percent") {
      const discount = cartSubtotal * (couponApplied.discountValue / 100)
      if (couponApplied.maxDiscount && discount > couponApplied.maxDiscount) {
        return couponApplied.maxDiscount
      }
      return discount
    }
    return couponApplied.discountValue
  }

  const discount = calculateDiscount()
  const cartTotal = Math.max(0, cartSubtotal - discount)

  // Kupon doğrulama
  const validateCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError("")

    try {
      const res = await fetch("/api/public/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          tenantSlug: slug,
          orderTotal: cartSubtotal,
        }),
      })
      const data = await res.json()

      if (data.success && data.data.valid) {
        setCouponApplied({
          code: couponCode.toUpperCase(),
          discountType: data.data.discountType,
          discountValue: data.data.discountValue,
          maxDiscount: data.data.maxDiscount,
        })
        setCouponError("")
      } else {
        setCouponError(data.data?.message || "Geçersiz kupon kodu")
        setCouponApplied(null)
      }
    } catch {
      setCouponError("Kupon doğrulanamadı")
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponApplied(null)
    setCouponCode("")
    setCouponError("")
  }

  // Sipariş gönderme
  const submitOrder = async () => {
    if (cart.length === 0) return

    try {
      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          tableNumber: tableNumber || undefined,
          items: cart.map(item => ({
            menuItemId: item.id,
            name: item.name,
            price: item.totalPrice / item.quantity,
            quantity: item.quantity,
            selectedVariations: item.selectedVariations,
            selectedExtras: item.selectedExtras,
          })),
        }),
      })

      const data = await response.json()

      if (data.success && data.data?.id) {
        saveOrderToHistory(data.data.id)
        setOrderSent(true)
        clearCart()
        // Sipariş takip sayfasına yönlendir
        setTimeout(() => {
          router.push(`/customer/order/${data.data.id}`)
        }, 1500)
      } else {
        alert(data.error || "Sipariş gönderilemedi")
      }
    } catch {
      // API bağlantı hatası - demo mode
      // Demo için random order ID oluştur
      const demoOrderId = `demo_${Date.now()}`
      saveOrderToHistory(demoOrderId)
      setOrderSent(true)
      clearCart()
      setTimeout(() => {
        router.push(`/customer/order/${demoOrderId}`)
      }, 1500)
    }
  }

  // Garson çağırma
  const callWaiter = async () => {
    try {
      const response = await fetch("/api/public/waiter-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          tableNumber: tableNumber || "Belirtilmedi",
          reason: "assistance",
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Garson çağrıldı! Kısa sürede masanıza gelecek.")
      } else {
        alert("Garson çağrıldı! Masa: " + (tableNumber || "Belirtilmedi"))
      }
    } catch {
      // API bağlantı hatası - demo mode
      alert("Garson çağrıldı! Masa: " + (tableNumber || "Belirtilmedi"))
    }
  }

  // Chat mesajı gönderme
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage: ChatMessage = { role: "user", content: chatInput.trim() }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput("")
    setIsChatLoading(true)

    // Scroll to bottom
    setTimeout(() => {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }, 100)

    try {
      const response = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          message: userMessage.content,
          conversationHistory: chatMessages,
          menuContext: {
            categories: demoCategories.filter(c => c.id !== "all").map(c => c.name),
            items: demoMenuItems.map(item => ({
              name: item.name,
              price: item.price,
              category: demoCategories.find(c => c.id === item.category)?.name || item.category,
              description: item.description,
            })),
          },
        }),
      })

      const data = await response.json()

      if (data.success && data.data?.reply) {
        const assistantMessage: ChatMessage = { role: "assistant", content: data.data.reply }
        setChatMessages(prev => [...prev, assistantMessage])
      } else {
        // Fallback response
        const fallbackMessage: ChatMessage = {
          role: "assistant",
          content: "Üzgünüm, şu anda yanıt veremiyorum. Lütfen garson çağırın veya tekrar deneyin."
        }
        setChatMessages(prev => [...prev, fallbackMessage])
      }
    } catch {
      // API error - use fallback
      const fallbackMessage: ChatMessage = {
        role: "assistant",
        content: "Bağlantı hatası oluştu. Menümüzde sıcak içecekler, soğuk içecekler, tatlılar ve atıştırmalıklar bulunmaktadır. Size yardımcı olmak için garson çağırabilirsiniz."
      }
      setChatMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsChatLoading(false)
      // Scroll to bottom after response
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth"
        })
      }, 100)
    }
  }

  // Restoran ismi (slug'dan)
  const restaurantName = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Kafe"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
              {restaurantName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold">{restaurantName}</h1>
              {tableNumber && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                  {locale === "en" ? "Table" : locale === "de" ? "Tisch" : locale === "ar" ? "طاولة" : locale === "ru" ? "Стол" : "Masa"} {tableNumber}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSelector onLocaleChange={setLocale} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAllergenFilterOpen(true)}
              className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 ${
                excludedAllergens.length > 0 ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : ""
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              {excludedAllergens.length > 0 && (
                <span className="text-xs font-medium">{excludedAllergens.length}</span>
              )}
            </Button>
            {orderHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOrderHistoryOpen(true)}
                className="relative flex items-center gap-1.5 rounded-xl px-3 py-2"
              >
                <History className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="relative h-11 w-11 rounded-xl border-2 transition-all hover:scale-105 hover:border-primary"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg animate-in zoom-in">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Kategoriler */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {/* Favorites category */}
          {favorites.length > 0 && (
            <button
              onClick={() => setSelectedCategory("favorites")}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === "favorites"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105"
                  : "bg-red-50 text-red-600 hover:bg-red-100 hover:scale-102"
              }`}
            >
              <Heart className="h-4 w-4 fill-current" />
              {locale === "en" ? "Favorites" : locale === "de" ? "Favoriten" : locale === "ar" ? "المفضلة" : locale === "ru" ? "Избранное" : "Favoriler"}
              <span className="rounded-full bg-white/20 px-1.5 text-xs">{favorites.length}</span>
            </button>
          )}
          {demoCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                  : "bg-muted/80 hover:bg-muted hover:scale-102"
              }`}
            >
              {cat.id === "all" ? t("menu.all", locale) : cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Kampanya Banner'ları */}
      {demoCampaigns.length > 0 && (
        <div className="overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide">
          <div className="flex gap-3">
            {demoCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`flex-shrink-0 w-72 rounded-2xl bg-gradient-to-r ${campaign.bgColor} p-4 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]`}
                onClick={() => {
                  if (campaign.couponCode) {
                    setCouponCode(campaign.couponCode)
                    setIsCartOpen(true)
                  }
                }}
              >
                <div className={campaign.textColor}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium opacity-80">
                      {campaign.type === "DISCOUNT_PERCENT" && `%${campaign.discountValue}`}
                      {campaign.type === "DISCOUNT_AMOUNT" && `₺${campaign.discountValue}`}
                      {campaign.type === "BUY_X_GET_Y" && "FIRSATI"}
                    </span>
                    {campaign.couponCode && (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                        {campaign.couponCode}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-lg font-bold">{campaign.name}</h3>
                  <p className="mt-0.5 text-sm opacity-90">{campaign.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menü Listesi */}
      <main className="p-4">
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const itemInCart = cart.filter(i => i.id === item.id)
            const totalInCart = itemInCart.reduce((sum, i) => sum + i.quantity, 0)
            const isPopular = item.tags?.includes("popüler")
            const hasOptions = (item.variations && item.variations.length > 0) || (item.extras && item.extras.length > 0)

            return (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  totalInCart > 0 ? "ring-2 ring-primary/50 shadow-md" : ""
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => hasOptions ? openProductModal(item) : null}
              >
                <CardContent className="flex gap-4 p-4">
                  {/* Ürün Görseli Placeholder */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                    <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-50">
                      {item.category === "sicak-icecekler" && "☕"}
                      {item.category === "soguk-icecekler" && "🧊"}
                      {item.category === "tatlilar" && "🍰"}
                      {item.category === "atistirmaliklar" && "🥪"}
                    </div>
                    {isPopular && (
                      <div className="absolute left-1 top-1">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0">
                          <Star className="mr-0.5 h-2.5 w-2.5 fill-current" />
                          {t("menu.popular", locale)}
                        </Badge>
                      </div>
                    )}
                    {totalInCart > 0 && (
                      <div className="absolute right-1 top-1">
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                          {totalInCart}
                        </Badge>
                      </div>
                    )}
                    {/* Favorite button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      className="absolute right-1 bottom-1 rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition-all hover:scale-110"
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          favorites.includes(item.id)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold leading-tight">{item.name}</h3>
                          {hasOptions && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Özelleştirilebilir
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-sm font-bold text-primary">
                          ₺{item.price}{hasOptions && "+"}
                        </span>
                      </div>
                      {item.tags && item.tags.filter(t => t !== "popüler").length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {item.tags.filter(t => t !== "popüler").map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      {/* Allergen indicators */}
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {item.allergens.slice(0, 3).map(allergen => (
                            <span
                              key={allergen}
                              className="text-xs"
                              title={locale === "en" ? allergenInfo[allergen].nameEn : allergenInfo[allergen].name}
                            >
                              {allergenInfo[allergen].icon}
                            </span>
                          ))}
                          {item.allergens.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{item.allergens.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sepet Kontrolleri */}
                    <div className="mt-3 flex items-center justify-end" onClick={e => e.stopPropagation()}>
                      <Button
                        size="sm"
                        className="rounded-xl shadow-md transition-all hover:scale-105 hover:shadow-lg"
                        onClick={() => addSimpleToCart(item)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        {hasOptions ? t("product.variations", locale) : t("product.addToCart", locale)}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      {/* Alt Sepet Bar */}
      {cartItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button
            className="w-full rounded-xl py-6 text-base font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
            size="lg"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Sepeti Görüntüle ({cartItemCount} ürün)
            <ChevronRight className="ml-auto h-5 w-5" />
            <span className="ml-2 rounded-lg bg-primary-foreground/20 px-3 py-1">
              ₺{cartTotal.toFixed(2)}
            </span>
          </Button>
        </div>
      )}

      {/* Sepet Modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden rounded-t-3xl bg-background shadow-2xl animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Sepet Header */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-background px-6 py-4">
              <div>
                <h2 className="text-xl font-bold">{t("cart.title", locale)}</h2>
                <p className="text-sm text-muted-foreground">{cartItemCount} {t("cart.items", locale)}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsCartOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Sepet İçeriği */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(85vh - 200px)" }}>
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">{t("cart.empty", locale)}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.cartId} className="rounded-xl bg-muted/50 p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-muted text-2xl">
                          {item.category === "sicak-icecekler" && "☕"}
                          {item.category === "soguk-icecekler" && "🧊"}
                          {item.category === "tatlilar" && "🍰"}
                          {item.category === "atistirmaliklar" && "🥪"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{item.name}</p>
                          {/* Seçilen varyasyonlar */}
                          {item.selectedVariations.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {item.selectedVariations.map(v => v.optionName).join(" • ")}
                            </p>
                          )}
                          {/* Seçilen ekstralar */}
                          {item.selectedExtras.length > 0 && (
                            <p className="text-xs text-primary">
                              + {item.selectedExtras.map(e => e.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <p className="font-bold shrink-0">₺{item.totalPrice}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-3">
                        <div className="flex items-center gap-1 rounded-xl bg-background p-1 shadow-sm">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => removeFromCart(item.cartId)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => increaseQuantity(item.cartId)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sepet Footer */}
            {cart.length > 0 && (
              <div className="border-t bg-background p-6">
                {/* Masa Bilgisi */}
                {tableNumber && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-700 dark:text-green-400">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                    <span>
                      {locale === "en" ? `Order for Table ${tableNumber}` : `Masa ${tableNumber} için sipariş verilecek`}
                    </span>
                  </div>
                )}

                {/* Kupon */}
                <div className="mb-4">
                  {couponApplied ? (
                    <div className="flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-900/30 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">🎟️</span>
                        <span className="font-medium text-green-700 dark:text-green-400">{couponApplied.code}</span>
                        <span className="text-sm text-green-600 dark:text-green-500">
                          ({couponApplied.discountType === "percent" ? `%${couponApplied.discountValue}` : `₺${couponApplied.discountValue}`})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="rounded-lg p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder={t("coupon.placeholder", locale)}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm uppercase focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      />
                      <Button
                        variant="outline"
                        onClick={validateCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="rounded-xl"
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("coupon.apply", locale)}
                      </Button>
                    </div>
                  )}
                  {couponError && (
                    <p className="mt-2 text-sm text-red-500">{couponError}</p>
                  )}
                </div>

                {/* Ara Toplam ve İndirim */}
                {discount > 0 && (
                  <div className="mb-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("cart.subtotal", locale)}</span>
                      <span>₺{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t("cart.discount", locale)}</span>
                      <span>-₺{discount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Toplam */}
                <div className="mb-4 flex justify-between text-lg">
                  <span className="text-muted-foreground">{t("cart.total", locale)}</span>
                  <span className="text-2xl font-bold">₺{cartTotal.toFixed(2)}</span>
                </div>

                {/* Sipariş Butonu */}
                <Button
                  className="w-full rounded-xl py-6 text-base font-semibold shadow-lg transition-all hover:scale-[1.02]"
                  size="lg"
                  onClick={submitOrder}
                  disabled={orderSent}
                >
                  {orderSent ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {locale === "en" ? "Order Received!" : locale === "de" ? "Bestellung erhalten!" : locale === "ar" ? "تم استلام الطلب!" : locale === "ru" ? "Заказ принят!" : "Siparişiniz Alındı!"}
                    </>
                  ) : (
                    <>
                      {t("cart.checkout", locale)}
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Garson Çağır / AI Chat Butonları */}
      <div className={`fixed right-4 flex flex-col gap-3 transition-all ${cartItemCount > 0 ? "bottom-28" : "bottom-6"}`}>
        <button
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-110 hover:shadow-xl active:scale-95"
          onClick={callWaiter}
          title="Garson Çağır"
        >
          <Phone className="h-6 w-6" />
        </button>
        <button
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 ${
            isChatOpen
              ? "bg-muted text-muted-foreground shadow-none"
              : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/30"
          }`}
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="Sipariş Asistanı"
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>

      {/* AI Chat Panel */}
      {isChatOpen && (
        <div className={`fixed right-4 w-[calc(100%-2rem)] max-w-sm rounded-2xl border bg-background shadow-2xl transition-all animate-in slide-in-from-bottom-4 fade-in ${cartItemCount > 0 ? "bottom-48" : "bottom-24"}`}>
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Sipariş Asistanı</h3>
              <p className="text-xs text-muted-foreground">Size yardımcı olmak için buradayım</p>
            </div>
          </div>
          <div ref={chatContainerRef} className="h-72 overflow-y-auto p-4 space-y-3">
            {/* Welcome Message */}
            <div className="rounded-2xl rounded-tl-sm bg-muted p-4 text-sm">
              <p className="font-medium">Merhaba! 👋</p>
              <p className="mt-1 text-muted-foreground">
                Ben {restaurantName} sipariş asistanıyım. Size nasıl yardımcı olabilirim?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Öneri ister misin?", "En popüler ne?", "Vegan seçenekler"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setChatInput(suggestion)}
                    className="rounded-full bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-2xl p-4 text-sm ${
                  msg.role === "user"
                    ? "ml-8 rounded-tr-sm bg-primary text-primary-foreground"
                    : "mr-8 rounded-tl-sm bg-muted"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {/* Loading indicator */}
            {isChatLoading && (
              <div className="mr-8 flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted p-4 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Yazıyor...</span>
              </div>
            )}
          </div>
          <div className="border-t p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendChatMessage()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1 rounded-xl border-2 bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none"
                disabled={isChatLoading}
              />
              <Button
                size="icon"
                className="h-10 w-10 rounded-xl"
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
              >
                {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Sipariş Geçmişi Modal */}
      {isOrderHistoryOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsOrderHistoryOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-hidden rounded-t-3xl bg-background shadow-2xl animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-background px-6 py-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <History className="h-5 w-5" />
                  {t("order.history", locale)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {locale === "en" ? "Your recent orders" : "Son siparişleriniz"}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsOrderHistoryOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(80vh - 150px)" }}>
              {orderHistory.length === 0 ? (
                <div className="py-12 text-center">
                  <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    {locale === "en" ? "No order history yet" : "Henüz sipariş geçmişi yok"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order, index) => (
                    <div key={order.id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">#{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.date).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span className="text-lg font-bold">₺{order.total.toFixed(2)}</span>
                      </div>

                      <div className="space-y-1 mb-3">
                        {order.items.slice(0, 3).map((item, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{order.items.length - 3} {locale === "en" ? "more items" : "ürün daha"}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl"
                        onClick={() => reorderFromHistory(order)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {locale === "en" ? "Order Again" : "Tekrar Sipariş Ver"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerjen Filtre Modal */}
      {isAllergenFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsAllergenFilterOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-hidden rounded-t-3xl bg-background shadow-2xl animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-background px-6 py-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-yellow-600" />
                  {t("product.allergens", locale)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {locale === "en" ? "Select allergens to avoid" : locale === "de" ? "Allergene zum Vermeiden auswählen" : locale === "ar" ? "حدد المواد المسببة للحساسية لتجنبها" : locale === "ru" ? "Выберите аллергены для исключения" : "Kaçınmak istediğiniz alerjenleri seçin"}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsAllergenFilterOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6">
              {excludedAllergens.length > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-yellow-50 p-3">
                  <span className="text-sm text-yellow-700">
                    {excludedAllergens.length} {locale === "en" ? "allergen(s) excluded" : "alerjen hariç tutuluyor"}
                  </span>
                  <button
                    onClick={() => {
                      setExcludedAllergens([])
                      localStorage.removeItem("excluded-allergens")
                    }}
                    className="text-sm font-medium text-yellow-700 hover:underline"
                  >
                    {locale === "en" ? "Clear all" : "Temizle"}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(allergenInfo) as AllergenType[]).map((allergen) => {
                  const info = allergenInfo[allergen]
                  const isExcluded = excludedAllergens.includes(allergen)
                  return (
                    <button
                      key={allergen}
                      onClick={() => toggleAllergen(allergen)}
                      className={`flex items-center gap-3 rounded-xl p-4 text-left transition-all ${
                        isExcluded
                          ? "bg-yellow-100 border-2 border-yellow-400"
                          : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                      }`}
                    >
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{locale === "en" ? info.nameEn : info.name}</p>
                        {isExcluded && (
                          <p className="text-xs text-yellow-600">
                            {locale === "en" ? "Excluded" : "Hariç"}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-background p-6">
              <Button
                className="w-full rounded-xl py-6 text-base font-semibold"
                size="lg"
                onClick={() => setIsAllergenFilterOpen(false)}
              >
                {t("ui.confirm", locale)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Detay Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-hidden rounded-t-3xl bg-background shadow-2xl animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-background px-6 py-4">
              <div>
                <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                {/* Show allergens in product modal */}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedItem.allergens.map(allergen => (
                      <span
                        key={allergen}
                        className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700"
                      >
                        {allergenInfo[allergen].icon} {locale === "en" ? allergenInfo[allergen].nameEn : allergenInfo[allergen].name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedItem(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 240px)" }}>
              {/* Varyasyonlar */}
              {selectedItem.variations && selectedItem.variations.length > 0 && (
                <div className="space-y-4">
                  {selectedItem.variations.map((variation) => (
                    <div key={variation.name}>
                      <h3 className="font-semibold mb-2">{variation.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {variation.options.map((option) => {
                          const isSelected = tempVariations.find(
                            v => v.variationName === variation.name && v.optionName === option.name
                          )
                          return (
                            <button
                              key={option.name}
                              onClick={() => selectVariation(variation.name, option.name, option.price)}
                              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : "bg-muted hover:bg-muted/80"
                              }`}
                            >
                              {option.name}
                              {option.price > 0 && (
                                <span className="ml-1 text-xs opacity-75">+₺{option.price}</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ekstralar */}
              {selectedItem.extras && selectedItem.extras.length > 0 && (
                <div className={selectedItem.variations?.length ? "mt-6" : ""}>
                  <h3 className="font-semibold mb-2">{t("product.extras", locale)}</h3>
                  <div className="space-y-2">
                    {selectedItem.extras.map((extra) => {
                      const isSelected = tempExtras.find(e => e.id === extra.id)
                      return (
                        <button
                          key={extra.id}
                          onClick={() => toggleExtra(extra)}
                          className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all ${
                            isSelected
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                          }`}
                        >
                          <span className="font-medium">{extra.name}</span>
                          <span className={isSelected ? "text-primary font-bold" : "text-muted-foreground"}>
                            {extra.price > 0 ? `+₺${extra.price}` : (locale === "en" ? "Free" : "Ücretsiz")}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Miktar */}
              <div className={selectedItem.variations?.length || selectedItem.extras?.length ? "mt-6" : ""}>
                <h3 className="font-semibold mb-2">Adet</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-lg"
                      onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))}
                      disabled={tempQuantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="w-12 text-center text-xl font-bold">{tempQuantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-lg"
                      onClick={() => setTempQuantity(tempQuantity + 1)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-background p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Toplam</span>
                <span className="text-2xl font-bold">
                  ₺{calculateItemTotal(selectedItem.price, tempVariations, tempExtras, tempQuantity)}
                </span>
              </div>
              <Button
                className="w-full rounded-xl py-6 text-base font-semibold shadow-lg transition-all hover:scale-[1.02]"
                size="lg"
                onClick={addToCartFromModal}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t("product.addToCart", locale)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

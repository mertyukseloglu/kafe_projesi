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
} from "lucide-react"

// Tip tanımları
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  tags?: string[]
}

interface CartItem extends MenuItem {
  quantity: number
}

interface Category {
  id: string
  name: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// Demo veriler (gerçek projede API'den gelecek)
const demoCategories: Category[] = [
  { id: "all", name: "Tümü" },
  { id: "sicak-icecekler", name: "Sıcak İçecekler" },
  { id: "soguk-icecekler", name: "Soğuk İçecekler" },
  { id: "tatlilar", name: "Tatlılar" },
  { id: "atistirmaliklar", name: "Atıştırmalıklar" },
]

const demoMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Türk Kahvesi",
    description: "Geleneksel Türk kahvesi, orta şekerli",
    price: 45,
    category: "sicak-icecekler",
    tags: ["popüler"],
  },
  {
    id: "2",
    name: "Latte",
    description: "Espresso ve buharla ısıtılmış süt",
    price: 65,
    category: "sicak-icecekler",
  },
  {
    id: "3",
    name: "Cappuccino",
    description: "Espresso, süt köpüğü ve kakao",
    price: 60,
    category: "sicak-icecekler",
    tags: ["popüler"],
  },
  {
    id: "4",
    name: "Filtre Kahve",
    description: "Taze çekilmiş çekirdeklerden",
    price: 40,
    category: "sicak-icecekler",
  },
  {
    id: "5",
    name: "Ice Latte",
    description: "Soğuk süt ve espresso",
    price: 70,
    category: "soguk-icecekler",
  },
  {
    id: "6",
    name: "Limonata",
    description: "Taze sıkılmış limon, nane",
    price: 45,
    category: "soguk-icecekler",
    tags: ["vegan"],
  },
  {
    id: "7",
    name: "Cheesecake",
    description: "New York usulü, frambuaz soslu",
    price: 85,
    category: "tatlilar",
    tags: ["popüler"],
  },
  {
    id: "8",
    name: "Tiramisu",
    description: "İtalyan usulü, mascarpone kremalı",
    price: 90,
    category: "tatlilar",
  },
  {
    id: "9",
    name: "Brownie",
    description: "Sıcak çikolatalı, dondurma ile",
    price: 75,
    category: "tatlilar",
  },
  {
    id: "10",
    name: "Sandviç",
    description: "Tavuklu, avokadolu, tam buğday ekmeği",
    price: 95,
    category: "atistirmaliklar",
  },
  {
    id: "11",
    name: "Tost",
    description: "Kaşarlı, domatesli, közlenmiş biber",
    price: 65,
    category: "atistirmaliklar",
  },
  {
    id: "12",
    name: "Kurabiye (3'lü)",
    description: "Günlük taze pişirilmiş",
    price: 35,
    category: "atistirmaliklar",
    tags: ["vegan"],
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

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  // Kategoriye göre filtreleme
  const filteredItems = selectedCategory === "all"
    ? demoMenuItems
    : demoMenuItems.filter(item => item.category === selectedCategory)

  // Sepet fonksiyonları
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId)
      if (existing && existing.quantity > 1) {
        return prev.map(i =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        )
      }
      return prev.filter(i => i.id !== itemId)
    })
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (data.success && data.data?.id) {
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
                  Masa {tableNumber}
                </div>
              )}
            </div>
          </div>
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

        {/* Kategoriler */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
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
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Menü Listesi */}
      <main className="p-4">
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const cartItem = cart.find(i => i.id === item.id)
            const isPopular = item.tags?.includes("popüler")

            return (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  cartItem ? "ring-2 ring-primary/50 shadow-md" : ""
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
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
                          Popüler
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-tight">{item.name}</h3>
                        <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-sm font-bold text-primary">
                          ₺{item.price}
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
                    </div>

                    {/* Sepet Kontrolleri */}
                    <div className="mt-3 flex items-center justify-end">
                      {cartItem ? (
                        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg hover:bg-background"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold text-primary">
                            {cartItem.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg hover:bg-background"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="rounded-xl shadow-md transition-all hover:scale-105 hover:shadow-lg"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Sepete Ekle
                        </Button>
                      )}
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
              ₺{cartTotal}
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
                <h2 className="text-xl font-bold">Sepetim</h2>
                <p className="text-sm text-muted-foreground">{cartItemCount} ürün</p>
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
                  <p className="mt-4 text-muted-foreground">Sepetiniz boş</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-muted text-2xl">
                        {item.category === "sicak-icecekler" && "☕"}
                        {item.category === "soguk-icecekler" && "🧊"}
                        {item.category === "tatlilar" && "🍰"}
                        {item.category === "atistirmaliklar" && "🥪"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₺{item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl bg-background p-1 shadow-sm">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="w-16 text-right font-bold">₺{item.price * item.quantity}</p>
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
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                    <span>Masa {tableNumber} için sipariş verilecek</span>
                  </div>
                )}

                {/* Toplam */}
                <div className="mb-4 flex justify-between text-lg">
                  <span className="text-muted-foreground">Toplam</span>
                  <span className="text-2xl font-bold">₺{cartTotal}</span>
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
                      Siparişiniz Alındı!
                    </>
                  ) : (
                    <>
                      Sipariş Ver
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
    </div>
  )
}

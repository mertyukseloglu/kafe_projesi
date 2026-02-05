"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Plus, Minus, X, MessageCircle, Phone, Send, Loader2 } from "lucide-react"

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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {restaurantName.charAt(0)}
            </div>
            <div>
              <h1 className="font-semibold">{restaurantName}</h1>
              {tableNumber && (
                <p className="text-sm text-muted-foreground">Masa {tableNumber}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>

        {/* Kategoriler */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {demoCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
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
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="flex gap-4 p-4">
                {/* Ürün Görseli Placeholder */}
                <div className="h-20 w-20 shrink-0 rounded-lg bg-gradient-to-br from-muted to-muted/50" />

                {/* Ürün Bilgileri */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {item.tags.map(tag => (
                            <span
                              key={tag}
                              className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold">₺{item.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>

                  {/* Sepet Kontrolleri */}
                  <div className="mt-2 flex items-center justify-end">
                    {cart.find(i => i.id === item.id) ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {cart.find(i => i.id === item.id)?.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Ekle
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Alt Sepet Bar */}
      {cartItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setIsCartOpen(true)}
          >
            Sepeti Görüntüle ({cartItemCount} ürün) - ₺{cartTotal}
          </Button>
        </div>
      )}

      {/* Sepet Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsCartOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-background"
            onClick={e => e.stopPropagation()}
          >
            {/* Sepet Header */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-background p-4">
              <h2 className="text-lg font-semibold">Sepetim</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Sepet İçeriği */}
            <div className="p-4">
              {cart.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Sepetiniz boş</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₺{item.price} x {item.quantity} = ₺{item.price * item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Masa Bilgisi */}
                  {tableNumber && (
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <span className="text-muted-foreground">Masa: </span>
                      <span className="font-medium">{tableNumber}</span>
                    </div>
                  )}

                  {/* Toplam */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Toplam</span>
                      <span>₺{cartTotal}</span>
                    </div>
                  </div>

                  {/* Sipariş Butonu */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={submitOrder}
                    disabled={orderSent}
                  >
                    {orderSent ? "Siparişiniz Alındı!" : "Sipariş Ver"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Garson Çağır / AI Chat Butonları */}
      <div className="fixed bottom-24 right-4 flex flex-col gap-2">
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-105"
          onClick={callWaiter}
          title="Garson Çağır"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="Sipariş Asistanı"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>

      {/* AI Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-40 right-4 w-80 rounded-lg border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b p-3">
            <h3 className="font-medium">Sipariş Asistanı</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsChatOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div ref={chatContainerRef} className="h-64 overflow-y-auto p-4 space-y-3">
            {/* Welcome Message */}
            <div className="rounded-lg bg-muted p-3 text-sm">
              Merhaba! Ben {restaurantName} sipariş asistanıyım. Size nasıl yardımcı olabilirim?
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Menü önerileri isteyebilirsiniz</li>
                <li>• Alerjen bilgisi sorabilirsiniz</li>
                <li>• Sipariş verebilirsiniz</li>
              </ul>
            </div>

            {/* Chat Messages */}
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 text-sm ${
                  msg.role === "user"
                    ? "ml-8 bg-primary text-primary-foreground"
                    : "mr-8 bg-muted"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {/* Loading indicator */}
            {isChatLoading && (
              <div className="mr-8 rounded-lg bg-muted p-3 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
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
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isChatLoading}
              />
              <Button size="sm" type="submit" disabled={isChatLoading || !chatInput.trim()}>
                {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { ApiResponse } from "@/types"

// Chat mesaj şeması
const chatMessageSchema = z.object({
  tenantSlug: z.string().min(1, "Restoran slug gerekli"),
  message: z.string().min(1, "Mesaj gerekli"),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
  menuContext: z.object({
    categories: z.array(z.string()),
    items: z.array(z.object({
      name: z.string(),
      price: z.number(),
      category: z.string(),
      description: z.string().optional(),
    })),
  }).optional(),
})

// Basit AI yanıt oluşturucu (Claude API'si olmadan çalışır)
function generateAIResponse(
  message: string,
  menuContext?: z.infer<typeof chatMessageSchema>["menuContext"]
): string {
  const lowerMessage = message.toLowerCase()

  // Selamlama
  if (lowerMessage.includes("merhaba") || lowerMessage.includes("selam") || lowerMessage.includes("hey")) {
    return "Merhaba! Ben sipariş asistanınızım. Size nasıl yardımcı olabilirim? Menümüzdeki ürünler hakkında bilgi alabilir, öneri isteyebilir veya sipariş verebilirsiniz."
  }

  // Menü hakkında
  if (lowerMessage.includes("menü") || lowerMessage.includes("menu") || lowerMessage.includes("ne var")) {
    if (menuContext?.categories) {
      return `Menümüzde ${menuContext.categories.join(", ")} kategorilerinde ürünlerimiz bulunuyor. Hangi kategoriyi incelemek istersiniz?`
    }
    return "Menümüzde sıcak içecekler, soğuk içecekler, tatlılar ve atıştırmalıklar bulunuyor. Size hangi konuda yardımcı olabilirim?"
  }

  // Kahve önerisi
  if (lowerMessage.includes("kahve") || lowerMessage.includes("coffee")) {
    const coffees = menuContext?.items.filter(i =>
      i.category.toLowerCase().includes("sıcak") || i.name.toLowerCase().includes("kahve")
    ) || []

    if (coffees.length > 0) {
      const recommendations = coffees.slice(0, 3).map(c => `${c.name} (₺${c.price})`).join(", ")
      return `Kahve sevenler için önerilerim: ${recommendations}. Türk Kahvesi geleneksel bir tercih, Latte ise kremamsı bir seçenek. Hangisini tercih edersiniz?`
    }
    return "Kahve çeşitlerimiz arasında Türk Kahvesi, Latte, Cappuccino ve Filtre Kahve bulunuyor. Size özel bir tavsiye ister misiniz?"
  }

  // Tatlı önerisi
  if (lowerMessage.includes("tatlı") || lowerMessage.includes("tatli") || lowerMessage.includes("dessert")) {
    const desserts = menuContext?.items.filter(i =>
      i.category.toLowerCase().includes("tatlı")
    ) || []

    if (desserts.length > 0) {
      const recommendations = desserts.slice(0, 3).map(d => `${d.name} (₺${d.price})`).join(", ")
      return `Tatlı önerilerimiz: ${recommendations}. Cheesecake en popüler seçimimiz! Denemek ister misiniz?`
    }
    return "Tatlı çeşitlerimiz arasında Cheesecake, Tiramisu ve Brownie var. Hepsi günlük taze hazırlanıyor!"
  }

  // Fiyat sorusu
  if (lowerMessage.includes("fiyat") || lowerMessage.includes("kaç") || lowerMessage.includes("ne kadar")) {
    // Belirli ürün adı var mı kontrol et
    const menuItems = menuContext?.items || []
    for (const item of menuItems) {
      if (lowerMessage.includes(item.name.toLowerCase())) {
        return `${item.name} fiyatı ₺${item.price}. Sepetinize eklememi ister misiniz?`
      }
    }
    return "Hangi ürünün fiyatını öğrenmek istersiniz? Ürün adını söylerseniz size fiyat bilgisi verebilirim."
  }

  // Sipariş
  if (lowerMessage.includes("sipariş") || lowerMessage.includes("siparis") || lowerMessage.includes("ekle")) {
    return "Sipariş vermek için menüden istediğiniz ürünleri sepete ekleyebilirsiniz. Sepetiniz hazır olduğunda 'Sipariş Ver' butonuna tıklamanız yeterli. Yardımcı olmamı ister misiniz?"
  }

  // Öneri
  if (lowerMessage.includes("öneri") || lowerMessage.includes("tavsiye") || lowerMessage.includes("ne içmeliyim") || lowerMessage.includes("ne yemeliyim")) {
    const popular = menuContext?.items.slice(0, 3) || []
    if (popular.length > 0) {
      const recommendations = popular.map(p => p.name).join(", ")
      return `Bugün için önerilerim: ${recommendations}. Bunlar müşterilerimizin en çok tercih ettiği ürünler. Denemek ister misiniz?`
    }
    return "Size bir Latte ve yanında Cheesecake önerebilirim - mükemmel bir ikili! Ya da klasik bir Türk Kahvesi ile Brownie de harika bir tercih."
  }

  // Alerjen
  if (lowerMessage.includes("alerji") || lowerMessage.includes("alerjen") || lowerMessage.includes("gluten") || lowerMessage.includes("laktozsuz")) {
    return "Alerjen bilgisi konusunda size yardımcı olmak isterim. Hangi alerjiniz var? Gluten, süt ürünleri, kuruyemiş gibi spesifik bir alerjen belirtirseniz size uygun ürünleri önerebilirim."
  }

  // Vegan
  if (lowerMessage.includes("vegan") || lowerMessage.includes("vejetaryen")) {
    const vegan = menuContext?.items.filter(i =>
      i.name.toLowerCase().includes("limonata") || i.name.toLowerCase().includes("smoothie")
    ) || []
    return "Vegan seçeneklerimiz arasında Limonata, Smoothie ve bazı kurabiyelerimiz bulunuyor. Bunları menüde 'vegan' etiketi ile görebilirsiniz."
  }

  // Teşekkür
  if (lowerMessage.includes("teşekkür") || lowerMessage.includes("sağol") || lowerMessage.includes("eyvallah")) {
    return "Rica ederim! Başka bir konuda yardımcı olabilir miyim? İyi günler dilerim! 😊"
  }

  // Garson
  if (lowerMessage.includes("garson") || lowerMessage.includes("insan") || lowerMessage.includes("yetkili")) {
    return "Bir garson çağırmak için sağ alttaki turuncu telefon butonuna tıklayabilirsiniz. Size hemen yardımcı olacaklardır."
  }

  // Varsayılan yanıt
  return "Size nasıl yardımcı olabilirim? Menü hakkında bilgi alabilir, ürün önerileri isteyebilir veya sipariş konusunda sorularınızı yanıtlayabilirim."
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ message: string; suggestedItems?: string[] }>>> {
  try {
    const body = await request.json()

    // Validasyon
    const validationResult = chatMessageSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz mesaj",
          message: validationResult.error.issues[0]?.message,
        },
        { status: 400 }
      )
    }

    const { message, menuContext, conversationHistory } = validationResult.data

    // Claude API key kontrolü
    const apiKey = process.env.ANTHROPIC_API_KEY

    let aiResponse: string

    if (apiKey && apiKey.length > 10) {
      // Gerçek Claude API çağrısı
      try {
        const systemPrompt = `Sen bir restoran sipariş asistanısın. Türkçe konuşuyorsun ve müşterilere yardımcı oluyorsun.

Görevin:
- Menü hakkında bilgi vermek
- Ürün önermek
- Sipariş sürecinde yardımcı olmak
- Alerjen bilgisi sağlamak

Kurallar:
- Kısa ve öz yanıtlar ver (maksimum 2-3 cümle)
- Samimi ama profesyonel ol
- Fiyatları TL (₺) olarak göster
- Emoji kullanabilirsin ama abartma

${menuContext ? `Menü bilgisi:
Kategoriler: ${menuContext.categories.join(", ")}
Ürünler: ${menuContext.items.map(i => `${i.name} (₺${i.price}) - ${i.category}`).join(", ")}` : ""}`

        const messages = [
          ...(conversationHistory || []).map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
          { role: "user" as const, content: message },
        ]

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 256,
            system: systemPrompt,
            messages,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          aiResponse = data.content[0]?.text || generateAIResponse(message, menuContext)
        } else {
          // API hatası - fallback
          aiResponse = generateAIResponse(message, menuContext)
        }
      } catch {
        // API çağrısı başarısız - fallback
        aiResponse = generateAIResponse(message, menuContext)
      }
    } else {
      // API key yok - yerel yanıt oluşturucu kullan
      aiResponse = generateAIResponse(message, menuContext)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
      },
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { success: false, error: "Mesaj işlenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

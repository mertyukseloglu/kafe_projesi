import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

// Pre-defined menu templates for quick setup
const MENU_TEMPLATES = {
  kafe: {
    name: "Kafe & Kahve Dükkanı",
    description: "Kahve, tatlı ve hafif atıştırmalıklar için ideal şablon",
    icon: "☕",
    categories: [
      {
        name: "Sıcak İçecekler",
        icon: "coffee",
        items: [
          { name: "Türk Kahvesi", description: "Geleneksel Türk kahvesi", price: 45 },
          { name: "Espresso", description: "Yoğun İtalyan kahvesi", price: 40 },
          { name: "Americano", description: "Espresso ve sıcak su", price: 50 },
          { name: "Latte", description: "Espresso ve süt köpüğü", price: 65 },
          { name: "Cappuccino", description: "Espresso, süt ve köpük", price: 65 },
          { name: "Mocha", description: "Espresso, çikolata ve süt", price: 75 },
          { name: "Sıcak Çikolata", description: "Kremsi sıcak çikolata", price: 60 },
          { name: "Türk Çayı", description: "Demlik çay", price: 20 },
        ],
      },
      {
        name: "Soğuk İçecekler",
        icon: "glass-water",
        items: [
          { name: "Ice Latte", description: "Soğuk süt ve espresso", price: 70 },
          { name: "Ice Americano", description: "Soğuk su ve espresso", price: 55 },
          { name: "Frappe", description: "Buzlu köpüklü kahve", price: 65 },
          { name: "Smoothie", description: "Meyveli smoothie", price: 70 },
          { name: "Limonata", description: "Taze sıkılmış limonata", price: 45 },
        ],
      },
      {
        name: "Tatlılar",
        icon: "cake",
        items: [
          { name: "Cheesecake", description: "New York usulü cheesecake", price: 85 },
          { name: "Brownie", description: "Çikolatalı brownie", price: 65 },
          { name: "Tiramisu", description: "İtalyan tiramisu", price: 90 },
          { name: "Cookie", description: "Taze pişmiş kurabiye", price: 35 },
          { name: "Waffle", description: "Belçika waffle", price: 95 },
        ],
      },
      {
        name: "Atıştırmalıklar",
        icon: "croissant",
        items: [
          { name: "Sandviç", description: "Taze sandviç", price: 75 },
          { name: "Tost", description: "Kaşarlı tost", price: 60 },
          { name: "Kruvasan", description: "Tereyağlı kruvasan", price: 50 },
          { name: "Poğaça", description: "Peynirli poğaça", price: 35 },
        ],
      },
    ],
  },
  restoran: {
    name: "Restoran",
    description: "Tam kapsamlı restoran menüsü için şablon",
    icon: "🍽️",
    categories: [
      {
        name: "Başlangıçlar",
        icon: "soup",
        items: [
          { name: "Çorba", description: "Günün çorbası", price: 55 },
          { name: "Mercimek Köftesi", description: "Geleneksel mercimek köftesi", price: 65 },
          { name: "Humus", description: "Nohut ezmesi", price: 60 },
          { name: "Patlıcan Salatası", description: "Közlenmiş patlıcan", price: 70 },
          { name: "Cacık", description: "Yoğurt ve salatalık", price: 45 },
        ],
      },
      {
        name: "Salatalar",
        icon: "salad",
        items: [
          { name: "Mevsim Salata", description: "Taze mevsim yeşillikleri", price: 65 },
          { name: "Çoban Salata", description: "Domates, salatalık, biber", price: 55 },
          { name: "Sezar Salata", description: "Sezar sos ile", price: 85 },
          { name: "Ton Balıklı Salata", description: "Ton balığı ile", price: 95 },
        ],
      },
      {
        name: "Ana Yemekler",
        icon: "utensils",
        items: [
          { name: "Izgara Köfte", description: "El yapımı köfte", price: 145 },
          { name: "Tavuk Şiş", description: "Marine edilmiş tavuk", price: 125 },
          { name: "Adana Kebap", description: "Acılı kebap", price: 165 },
          { name: "Urfa Kebap", description: "Acısız kebap", price: 165 },
          { name: "Karışık Izgara", description: "Et ve tavuk karışık", price: 195 },
          { name: "Güveç", description: "Sebzeli et güveç", price: 155 },
        ],
      },
      {
        name: "Pilav & Makarna",
        icon: "wheat",
        items: [
          { name: "Tereyağlı Pilav", description: "Tereyağlı pirinç pilavı", price: 45 },
          { name: "Bulgur Pilavı", description: "Domatesli bulgur pilavı", price: 40 },
          { name: "Makarna", description: "Soslu makarna", price: 75 },
        ],
      },
      {
        name: "İçecekler",
        icon: "glass-water",
        items: [
          { name: "Ayran", description: "Taze ayran", price: 20 },
          { name: "Kola", description: "330ml", price: 30 },
          { name: "Fanta", description: "330ml", price: 30 },
          { name: "Su", description: "500ml", price: 15 },
          { name: "Maden Suyu", description: "200ml", price: 20 },
        ],
      },
      {
        name: "Tatlılar",
        icon: "cake",
        items: [
          { name: "Künefe", description: "Sıcak künefe", price: 95 },
          { name: "Sütlaç", description: "Fırın sütlaç", price: 65 },
          { name: "Kazandibi", description: "Geleneksel tatlı", price: 65 },
          { name: "Baklava", description: "Fıstıklı baklava", price: 85 },
        ],
      },
    ],
  },
  pizzaci: {
    name: "Pizzacı & Fast Food",
    description: "Pizza, burger ve fast food için şablon",
    icon: "🍕",
    categories: [
      {
        name: "Pizzalar",
        icon: "pizza",
        items: [
          { name: "Margarita", description: "Domates, mozzarella, fesleğen", price: 145 },
          { name: "Karışık Pizza", description: "Sucuk, sosis, mantar, biber", price: 175 },
          { name: "Sucuklu Pizza", description: "Bol sucuklu", price: 165 },
          { name: "Vejeteryan Pizza", description: "Sebzeli pizza", price: 155 },
          { name: "Ton Balıklı Pizza", description: "Ton balığı ve mısır", price: 170 },
          { name: "Tavuklu Pizza", description: "Izgara tavuk", price: 170 },
        ],
      },
      {
        name: "Burgerler",
        icon: "beef",
        items: [
          { name: "Klasik Burger", description: "150gr dana köfte", price: 125 },
          { name: "Cheese Burger", description: "Cheddar peynirli", price: 140 },
          { name: "Double Burger", description: "2x köfte", price: 175 },
          { name: "Tavuk Burger", description: "Çıtır tavuk", price: 115 },
          { name: "Veggie Burger", description: "Sebze köfteli", price: 110 },
        ],
      },
      {
        name: "Döner & Dürüm",
        icon: "wrap",
        items: [
          { name: "Et Döner Porsiyon", description: "Pilav ve salata ile", price: 145 },
          { name: "Tavuk Döner Porsiyon", description: "Pilav ve salata ile", price: 125 },
          { name: "Dürüm", description: "Lavaş dürüm", price: 95 },
          { name: "İskender", description: "Yoğurt ve tereyağı ile", price: 175 },
        ],
      },
      {
        name: "Yan Ürünler",
        icon: "french-fries",
        items: [
          { name: "Patates Kızartması", description: "Çıtır patates", price: 45 },
          { name: "Soğan Halkası", description: "Çıtır soğan", price: 55 },
          { name: "Nugget (6'lı)", description: "Tavuk nugget", price: 65 },
          { name: "Mozzarella Stick", description: "4 adet", price: 75 },
        ],
      },
      {
        name: "İçecekler",
        icon: "cup-soda",
        items: [
          { name: "Kola", description: "330ml", price: 25 },
          { name: "Fanta", description: "330ml", price: 25 },
          { name: "Sprite", description: "330ml", price: 25 },
          { name: "Ayran", description: "300ml", price: 20 },
          { name: "Su", description: "500ml", price: 10 },
        ],
      },
    ],
  },
  bar: {
    name: "Bar & Meyhane",
    description: "İçecek odaklı mekan için şablon",
    icon: "🍺",
    categories: [
      {
        name: "Biralar",
        icon: "beer",
        items: [
          { name: "Efes Pilsen", description: "500ml", price: 80 },
          { name: "Efes Draft", description: "400ml fıçı", price: 70 },
          { name: "Bomonti", description: "500ml", price: 85 },
          { name: "Tuborg Gold", description: "500ml", price: 80 },
          { name: "Corona", description: "355ml", price: 120 },
        ],
      },
      {
        name: "Şaraplar",
        icon: "wine",
        items: [
          { name: "Ev Şarabı (Kadeh)", description: "Kırmızı/Beyaz", price: 75 },
          { name: "Ev Şarabı (Şişe)", description: "Kırmızı/Beyaz", price: 350 },
          { name: "Özel Şarap", description: "Şişe", price: 550 },
        ],
      },
      {
        name: "Rakı & Votka",
        icon: "glass",
        items: [
          { name: "Rakı (Tekli)", description: "4cl", price: 95 },
          { name: "Rakı (Duble)", description: "8cl", price: 160 },
          { name: "Votka (Tekli)", description: "4cl", price: 85 },
          { name: "Votka (Duble)", description: "8cl", price: 145 },
        ],
      },
      {
        name: "Mezeler",
        icon: "salad",
        items: [
          { name: "Beyaz Peynir", description: "Taze beyaz peynir", price: 65 },
          { name: "Kavun", description: "Dilimlenmiş kavun", price: 75 },
          { name: "Karpuz", description: "Dilimlenmiş karpuz", price: 70 },
          { name: "Humus", description: "Nohut ezmesi", price: 55 },
          { name: "Haydari", description: "Süzme yoğurt", price: 60 },
          { name: "Atom", description: "Acılı ezme", price: 55 },
          { name: "Patlıcan Salatası", description: "Közlenmiş patlıcan", price: 65 },
          { name: "Enginar", description: "Zeytinyağlı enginar", price: 85 },
        ],
      },
      {
        name: "Sıcak Mezeler",
        icon: "flame",
        items: [
          { name: "Kalamar Tava", description: "Çıtır kalamar", price: 125 },
          { name: "Karides Güveç", description: "Tereyağlı karides", price: 145 },
          { name: "Arnavut Ciğeri", description: "Soğan ile", price: 95 },
          { name: "Sucuk Izgara", description: "Dilim sucuk", price: 85 },
          { name: "Hellim Izgara", description: "Izgara hellim peyniri", price: 90 },
        ],
      },
      {
        name: "Ana Yemekler",
        icon: "utensils",
        items: [
          { name: "Balık", description: "Günün balığı", price: 195 },
          { name: "Köfte", description: "Izgara köfte", price: 145 },
          { name: "Levrek", description: "Izgara levrek", price: 225 },
          { name: "Karışık Balık", description: "Balık tabağı", price: 295 },
        ],
      },
    ],
  },
  pastane: {
    name: "Pastane & Fırın",
    description: "Tatlı ve hamur işleri için şablon",
    icon: "🧁",
    categories: [
      {
        name: "Pastalar",
        icon: "cake",
        items: [
          { name: "Çikolatalı Pasta", description: "Dilim", price: 85 },
          { name: "Meyveli Pasta", description: "Dilim", price: 90 },
          { name: "San Sebastian", description: "Dilim", price: 95 },
          { name: "Tiramisu", description: "Kase", price: 85 },
          { name: "Profiterol", description: "Porsiyon", price: 75 },
          { name: "Magnolia", description: "Kase", price: 70 },
        ],
      },
      {
        name: "Börekler",
        icon: "croissant",
        items: [
          { name: "Su Böreği", description: "Peynirli", price: 65 },
          { name: "Kol Böreği", description: "Peynirli veya patatesli", price: 60 },
          { name: "Sigara Böreği", description: "5 adet", price: 55 },
          { name: "Ispanaklı Börek", description: "Dilim", price: 60 },
        ],
      },
      {
        name: "Kurabiyeler",
        icon: "cookie",
        items: [
          { name: "Çikolatalı Cookie", description: "Adet", price: 30 },
          { name: "Un Kurabiyesi", description: "Adet", price: 20 },
          { name: "Brownie", description: "Adet", price: 45 },
          { name: "Macaron", description: "Adet", price: 35 },
          { name: "Muffin", description: "Adet", price: 40 },
        ],
      },
      {
        name: "Hamur İşleri",
        icon: "wheat",
        items: [
          { name: "Açma", description: "Sade veya çikolatalı", price: 25 },
          { name: "Poğaça", description: "Peynirli veya zeytinli", price: 30 },
          { name: "Simit", description: "Taze simit", price: 15 },
          { name: "Kruvasan", description: "Tereyağlı", price: 40 },
        ],
      },
      {
        name: "İçecekler",
        icon: "coffee",
        items: [
          { name: "Çay", description: "Bardak", price: 15 },
          { name: "Türk Kahvesi", description: "Fincan", price: 40 },
          { name: "Filtre Kahve", description: "Fincan", price: 45 },
          { name: "Sıcak Çikolata", description: "Fincan", price: 55 },
          { name: "Sahlep", description: "Fincan", price: 50 },
        ],
      },
    ],
  },
}

// GET - List available templates
export async function GET() {
  const templates = Object.entries(MENU_TEMPLATES).map(([key, template]) => ({
    id: key,
    name: template.name,
    description: template.description,
    icon: template.icon,
    categoryCount: template.categories.length,
    itemCount: template.categories.reduce((sum, cat) => sum + cat.items.length, 0),
  }))

  return successResponse({ templates })
}

// POST - Apply a template to the tenant's menu
export async function POST(request: NextRequest) {
  const { session, error } = await getAuthenticatedSession()
  if (error || !session) {
    return errorResponse(error || "Yetkisiz erişim", 401)
  }

  if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
    return errorResponse("Bu işlem için yetkiniz yok", 403)
  }

  const tenantId = session.user.tenantId!

  try {
    const { templateId, mode = "add" } = await request.json()

    const template = MENU_TEMPLATES[templateId as keyof typeof MENU_TEMPLATES]
    if (!template) {
      return errorResponse("Template not found", 404)
    }

    // If replace mode, delete existing categories and items
    if (mode === "replace") {
      await prisma.menuItem.deleteMany({ where: { tenantId } })
      await prisma.category.deleteMany({ where: { tenantId } })
    }

    // Get existing categories for "add" mode
    const existingCategories = await prisma.category.findMany({
      where: { tenantId },
      select: { name: true },
    })
    const existingCategoryNames = new Set(existingCategories.map((c) => c.name.toLowerCase()))

    let categoriesCreated = 0
    let itemsCreated = 0

    // Create categories and items
    for (let i = 0; i < template.categories.length; i++) {
      const cat = template.categories[i]

      // Skip if category already exists in "add" mode
      if (mode === "add" && existingCategoryNames.has(cat.name.toLowerCase())) {
        continue
      }

      // Create category
      const category = await prisma.category.create({
        data: {
          tenantId,
          name: cat.name,
          icon: cat.icon,
          sortOrder: i,
        },
      })
      categoriesCreated++

      // Create items for this category
      for (let j = 0; j < cat.items.length; j++) {
        const item = cat.items[j]
        await prisma.menuItem.create({
          data: {
            tenantId,
            categoryId: category.id,
            name: item.name,
            description: item.description,
            price: item.price,
            sortOrder: j,
          },
        })
        itemsCreated++
      }
    }

    return successResponse({
      success: true,
      message: `${template.name} şablonu başarıyla uygulandı`,
      stats: {
        categoriesCreated,
        itemsCreated,
      },
    })
  } catch (error) {
    console.error("Template apply error:", error)
    return errorResponse("Failed to apply template", 500)
  }
}

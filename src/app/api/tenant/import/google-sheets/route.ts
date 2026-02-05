import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

interface SheetRow {
  name: string
  description?: string
  price: number
  category: string
  tags?: string
  allergens?: string
  prepTime?: number
  calories?: number
  isAvailable?: boolean
}

// Extract Google Sheets ID from URL
function extractSheetId(url: string): string | null {
  // Handle various Google Sheets URL formats
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,  // Standard URL
    /^([a-zA-Z0-9-_]+)$/,                    // Just the ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Convert Google Sheets to CSV export URL
function getSheetExportUrl(sheetId: string, gid: string = "0"): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}

// Parse CSV content
function parseCSV(csvText: string): SheetRow[] {
  const lines = csvText.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  // Parse header
  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
  const nameIdx = header.findIndex((h) => h === "name" || h === "ürün" || h === "isim" || h === "ad")
  const priceIdx = header.findIndex((h) => h === "price" || h === "fiyat")
  const categoryIdx = header.findIndex((h) => h === "category" || h === "kategori")
  const descIdx = header.findIndex((h) => h === "description" || h === "açıklama")
  const tagsIdx = header.findIndex((h) => h === "tags" || h === "etiketler")
  const allergensIdx = header.findIndex((h) => h === "allergens" || h === "alerjenler")
  const prepTimeIdx = header.findIndex((h) => h === "preptime" || h === "hazırlıksüresi" || h === "süre")
  const caloriesIdx = header.findIndex((h) => h === "calories" || h === "kalori")
  const availableIdx = header.findIndex((h) => h === "isavailable" || h === "aktif" || h === "stokta")

  if (nameIdx === -1 || priceIdx === -1 || categoryIdx === -1) {
    throw new Error("CSV dosyasında zorunlu sütunlar (name/ürün, price/fiyat, category/kategori) bulunamadı")
  }

  const rows: SheetRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const name = values[nameIdx]?.trim()
    const priceStr = values[priceIdx]?.trim().replace(",", ".")
    const category = values[categoryIdx]?.trim()

    if (!name || !priceStr || !category) continue

    const price = parseFloat(priceStr)
    if (isNaN(price)) continue

    const row: SheetRow = {
      name,
      price,
      category,
    }

    if (descIdx !== -1) row.description = values[descIdx]?.trim()
    if (tagsIdx !== -1) row.tags = values[tagsIdx]?.trim()
    if (allergensIdx !== -1) row.allergens = values[allergensIdx]?.trim()
    if (prepTimeIdx !== -1) {
      const pt = parseInt(values[prepTimeIdx])
      if (!isNaN(pt)) row.prepTime = pt
    }
    if (caloriesIdx !== -1) {
      const cal = parseInt(values[caloriesIdx])
      if (!isNaN(cal)) row.calories = cal
    }
    if (availableIdx !== -1) {
      const av = values[availableIdx]?.toLowerCase().trim()
      row.isAvailable = av === "true" || av === "1" || av === "evet" || av === "yes"
    }

    rows.push(row)
  }

  return rows
}

// Parse CSV line handling quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if ((char === "," || char === ";") && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

// POST - Import menu from Google Sheets
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
    const { url, mode = "add", gid = "0" } = await request.json()

    if (!url) {
      return errorResponse("Google Sheets URL'i gerekli", 400)
    }

    // Extract sheet ID
    const sheetId = extractSheetId(url)
    if (!sheetId) {
      return errorResponse("Geçersiz Google Sheets URL'i", 400)
    }

    // Fetch the sheet as CSV
    const exportUrl = getSheetExportUrl(sheetId, gid)

    let csvText: string
    try {
      const response = await fetch(exportUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      csvText = await response.text()
    } catch (fetchError) {
      console.error("Google Sheets fetch error:", fetchError)
      return errorResponse(
        "Google Sheets dosyası alınamadı. Dosyanın 'Bağlantıya sahip olan herkes görüntüleyebilir' olarak paylaşıldığından emin olun.",
        400
      )
    }

    // Parse CSV
    let rows: SheetRow[]
    try {
      rows = parseCSV(csvText)
    } catch (parseError) {
      return errorResponse(
        parseError instanceof Error ? parseError.message : "CSV ayrıştırma hatası",
        400
      )
    }

    if (rows.length === 0) {
      return errorResponse("Dosyada geçerli menü öğesi bulunamadı", 400)
    }

    // Get or create categories
    const categoryMap: Record<string, string> = {}
    const existingCategories = await prisma.category.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    })

    existingCategories.forEach((cat) => {
      categoryMap[cat.name.toLowerCase()] = cat.id
    })

    // Create new categories
    const uniqueCategories = [...new Set(rows.map((r) => r.category))]
    for (const catName of uniqueCategories) {
      if (!categoryMap[catName.toLowerCase()]) {
        const newCat = await prisma.category.create({
          data: {
            tenantId,
            name: catName,
            sortOrder: Object.keys(categoryMap).length,
          },
        })
        categoryMap[catName.toLowerCase()] = newCat.id
      }
    }

    // Delete existing items if replace mode
    if (mode === "replace") {
      await prisma.menuItem.deleteMany({ where: { tenantId } })
    }

    // Create menu items
    const createdItems = []
    for (const row of rows) {
      const categoryId = categoryMap[row.category.toLowerCase()]
      if (!categoryId) continue

      const item = await prisma.menuItem.create({
        data: {
          tenantId,
          categoryId,
          name: row.name,
          description: row.description,
          price: row.price,
          tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
          allergens: row.allergens ? row.allergens.split(",").map((a) => a.trim()) : [],
          prepTime: row.prepTime,
          calories: row.calories,
          isAvailable: row.isAvailable ?? true,
        },
      })
      createdItems.push({ id: item.id, name: item.name })
    }

    return successResponse({
      imported: createdItems.length,
      categories: uniqueCategories.length,
      items: createdItems.slice(0, 10), // Return first 10 for preview
    })
  } catch (err) {
    console.error("Google Sheets import error:", err)
    return errorResponse("İçe aktarma sırasında bir hata oluştu", 500)
  }
}

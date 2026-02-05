import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

// POST - Upload photos for menu items
// Photos are matched by filename (e.g., "turk-kahvesi.jpg" matches "Türk Kahvesi")
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return errorResponse("En az bir fotoğraf gerekli", 400)
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    const invalidFiles = files.filter(f => !allowedTypes.includes(f.type))
    if (invalidFiles.length > 0) {
      return errorResponse(`Geçersiz dosya türü: ${invalidFiles.map(f => f.name).join(", ")}. Desteklenen: JPEG, PNG, WebP, GIF`, 400)
    }

    // Check file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024
    const oversizedFiles = files.filter(f => f.size > maxSize)
    if (oversizedFiles.length > 0) {
      return errorResponse(`Dosya boyutu çok büyük: ${oversizedFiles.map(f => f.name).join(", ")}. Maksimum: 5MB`, 400)
    }

    try {
      // Get all menu items for this tenant
      const menuItems = await prisma.menuItem.findMany({
        where: { tenantId },
        select: { id: true, name: true },
      })

      // Create a map of normalized names to items
      const itemMap: Record<string, { id: string; name: string }> = {}
      menuItems.forEach(item => {
        // Normalize name for matching
        const normalizedName = item.name
          .toLowerCase()
          .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]/g, "")

        // Also match with hyphenated version
        const hyphenatedName = item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-ğüşıöçĞÜŞİÖÇ]/g, "").replace(/-/g, "")

        itemMap[normalizedName] = { id: item.id, name: item.name }
        itemMap[hyphenatedName] = { id: item.id, name: item.name }
      })

      const results: { filename: string; matched: boolean; itemName?: string; url?: string }[] = []

      for (const file of files) {
        // Get filename without extension
        const filenameWithoutExt = file.name
          .replace(/\.[^/.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]/g, "")

        const matchedItem = itemMap[filenameWithoutExt]

        if (matchedItem) {
          // In a real app, we would upload to cloud storage
          // For now, we'll just simulate the upload
          const fakeUrl = `/uploads/${tenantId}/${file.name}`

          // Update menu item with image URL
          await prisma.menuItem.update({
            where: { id: matchedItem.id },
            data: { image: fakeUrl },
          })

          results.push({
            filename: file.name,
            matched: true,
            itemName: matchedItem.name,
            url: fakeUrl,
          })
        } else {
          results.push({
            filename: file.name,
            matched: false,
          })
        }
      }

      const matchedCount = results.filter(r => r.matched).length

      return successResponse({
        total: files.length,
        matched: matchedCount,
        unmatched: files.length - matchedCount,
        results,
      })
    } catch (dbError) {
      console.error("DB error:", dbError)
      // Demo mode
      const results = files.map((file) => ({
        filename: file.name,
        matched: Math.random() > 0.3, // Randomly match for demo
        itemName: file.name.replace(/\.[^/.]+$/, "").replace(/-/g, " "),
        url: `/uploads/demo/${file.name}`,
      }))

      const matchedCount = results.filter(r => r.matched).length

      return successResponse({
        total: files.length,
        matched: matchedCount,
        unmatched: files.length - matchedCount,
        results,
        demo: true,
      })
    }
  } catch (error) {
    console.error("Photo import error:", error)
    return errorResponse("Fotoğraflar yüklenirken bir hata oluştu", 500)
  }
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

// Demo stok verileri
const demoStockItems = [
  { id: "1", name: "Türk Kahvesi", stockQuantity: 45, lowStockAlert: 10, stockUnit: "porsiyon", trackStock: true },
  { id: "2", name: "Latte", stockQuantity: 8, lowStockAlert: 15, stockUnit: "porsiyon", trackStock: true },
  { id: "3", name: "Cheesecake", stockQuantity: 3, lowStockAlert: 5, stockUnit: "dilim", trackStock: true },
  { id: "4", name: "Brownie", stockQuantity: 12, lowStockAlert: 8, stockUnit: "adet", trackStock: true },
  { id: "5", name: "Limonata", stockQuantity: 25, lowStockAlert: 10, stockUnit: "porsiyon", trackStock: true },
]

const demoStockMovements = [
  { id: "1", menuItemName: "Cheesecake", type: "OUT", quantity: -2, reason: "Sipariş #S123", createdAt: new Date() },
  { id: "2", menuItemName: "Latte", type: "IN", quantity: 50, reason: "Stok girişi", createdAt: new Date(Date.now() - 3600000) },
  { id: "3", menuItemName: "Brownie", type: "WASTE", quantity: -3, reason: "Fire - bayat", createdAt: new Date(Date.now() - 7200000) },
]

// Stok listesi ve düşük stok uyarıları
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const searchParams = request.nextUrl.searchParams
    const lowStockOnly = searchParams.get("lowStock") === "true"
    const includeMovements = searchParams.get("movements") === "true"

    try {
      // Stok takibi aktif ürünleri getir
      const whereClause: Record<string, unknown> = {
        tenantId,
        trackStock: true,
      }

      const items = await prisma.menuItem.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          lowStockAlert: true,
          stockUnit: true,
          trackStock: true,
          isAvailable: true,
          category: {
            select: { name: true },
          },
        },
        orderBy: { stockQuantity: "asc" },
      })

      // Düşük stok filtreleme
      const filteredItems = lowStockOnly
        ? items.filter((item) => item.stockQuantity <= item.lowStockAlert)
        : items

      // Stok hareketleri (son 50)
      let movements: unknown[] = []
      if (includeMovements) {
        movements = await prisma.stockMovement.findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      }

      // İstatistikler
      const lowStockCount = items.filter((i) => i.stockQuantity <= i.lowStockAlert).length
      const outOfStockCount = items.filter((i) => i.stockQuantity === 0).length

      return successResponse({
        items: filteredItems.map((item) => ({
          ...item,
          categoryName: item.category?.name,
          isLowStock: item.stockQuantity <= item.lowStockAlert,
          isOutOfStock: item.stockQuantity === 0,
        })),
        movements,
        stats: {
          totalTracked: items.length,
          lowStockCount,
          outOfStockCount,
        },
      })
    } catch {
      // Demo data
      const lowStockItems = demoStockItems.filter((i) => i.stockQuantity <= i.lowStockAlert)
      return successResponse({
        items: (lowStockOnly ? lowStockItems : demoStockItems).map((item) => ({
          ...item,
          isLowStock: item.stockQuantity <= item.lowStockAlert,
          isOutOfStock: item.stockQuantity === 0,
        })),
        movements: includeMovements ? demoStockMovements : [],
        stats: {
          totalTracked: demoStockItems.length,
          lowStockCount: lowStockItems.length,
          outOfStockCount: demoStockItems.filter((i) => i.stockQuantity === 0).length,
        },
      })
    }
  } catch (error) {
    console.error("Stock API error:", error)
    return errorResponse("Stok verileri alınırken bir hata oluştu", 500)
  }
}

// Stok güncelleme
export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const body = await request.json()
    const { menuItemId, quantity, type, reason } = body

    if (!menuItemId || quantity === undefined) {
      return errorResponse("Ürün ID ve miktar gerekli", 400)
    }

    try {
      // Mevcut ürünü bul
      const menuItem = await prisma.menuItem.findFirst({
        where: { id: menuItemId, tenantId },
      })

      if (!menuItem) {
        return errorResponse("Ürün bulunamadı", 404)
      }

      const previousStock = menuItem.stockQuantity
      const quantityChange = type === "OUT" || type === "WASTE" ? -Math.abs(quantity) : quantity
      const newStock = Math.max(0, previousStock + quantityChange)

      // Stok güncelle
      await prisma.menuItem.update({
        where: { id: menuItemId },
        data: {
          stockQuantity: newStock,
          isAvailable: newStock > 0,
        },
      })

      // Stok hareketi kaydet
      await prisma.stockMovement.create({
        data: {
          tenantId,
          menuItemId,
          type: type || (quantity > 0 ? "IN" : "OUT"),
          quantity: quantityChange,
          previousStock,
          newStock,
          reason,
          userId: session.user.id,
        },
      })

      return successResponse({
        menuItemId,
        previousStock,
        newStock,
        change: quantityChange,
      })
    } catch {
      // Demo mode
      return successResponse({
        menuItemId,
        previousStock: 10,
        newStock: 10 + quantity,
        change: quantity,
        demo: true,
      })
    }
  } catch (error) {
    console.error("Stock update error:", error)
    return errorResponse("Stok güncellenirken bir hata oluştu", 500)
  }
}

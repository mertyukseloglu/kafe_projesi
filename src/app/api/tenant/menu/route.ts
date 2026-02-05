import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
  TENANT_ALL_ROLES,
} from "@/lib/api-utils"

// GET - List menu items
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_ALL_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const isAvailable = searchParams.get("isAvailable")

    const where: Record<string, unknown> = { tenantId }
    if (categoryId) where.categoryId = categoryId
    if (isAvailable !== null) where.isAvailable = isAvailable === "true"

    const [menuItems, categories] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      }),
      prisma.category.findMany({
        where: { tenantId },
        orderBy: { sortOrder: "asc" },
      }),
    ])

    return successResponse({
      items: menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        image: item.image,
        category: item.category,
        tags: item.tags,
        allergens: item.allergens,
        variations: item.variations,
        extras: item.extras,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
        sortOrder: item.sortOrder,
      })),
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
      })),
    })
  } catch (error) {
    console.error("Menu GET error:", error)
    return errorResponse("Menü alınırken bir hata oluştu", 500)
  }
}

// POST - Create menu item
const createMenuItemSchema = z.object({
  name: z.string().min(1, "Ürün adı gerekli"),
  description: z.string().optional(),
  price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
  categoryId: z.string().min(1, "Kategori seçin"),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  variations: z.array(z.any()).optional(),
  extras: z.array(z.any()).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

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
    const body = await request.json()

    const validationResult = createMenuItemSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const data = validationResult.data

    // Verify category belongs to tenant
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, tenantId },
    })

    if (!category) {
      return errorResponse("Kategori bulunamadı", 404)
    }

    // Get max sort order
    const maxSort = await prisma.menuItem.aggregate({
      where: { tenantId, categoryId: data.categoryId },
      _max: { sortOrder: true },
    })

    const menuItem = await prisma.menuItem.create({
      data: {
        tenantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        tags: data.tags || [],
        allergens: data.allergens || [],
        variations: data.variations || [],
        extras: data.extras || [],
        isAvailable: data.isAvailable ?? true,
        isFeatured: data.isFeatured ?? false,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    })

    return successResponse({
      id: menuItem.id,
      name: menuItem.name,
      price: Number(menuItem.price),
      category: menuItem.category,
    }, 201)
  } catch (error) {
    console.error("Menu POST error:", error)
    return errorResponse("Ürün oluşturulurken bir hata oluştu", 500)
  }
}

// PATCH - Update menu item
const updateMenuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  image: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  variations: z.array(z.any()).optional(),
  extras: z.array(z.any()).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
})

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

    const validationResult = updateMenuItemSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const { id, ...updateData } = validationResult.data

    // Verify item belongs to tenant
    const existingItem = await prisma.menuItem.findFirst({
      where: { id, tenantId },
    })

    if (!existingItem) {
      return errorResponse("Ürün bulunamadı", 404)
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
      },
    })

    return successResponse({
      id: updatedItem.id,
      name: updatedItem.name,
      price: Number(updatedItem.price),
      isAvailable: updatedItem.isAvailable,
    })
  } catch (error) {
    console.error("Menu PATCH error:", error)
    return errorResponse("Ürün güncellenirken bir hata oluştu", 500)
  }
}

// DELETE - Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return errorResponse("Ürün ID gerekli", 400)
    }

    // Verify item belongs to tenant
    const existingItem = await prisma.menuItem.findFirst({
      where: { id, tenantId },
    })

    if (!existingItem) {
      return errorResponse("Ürün bulunamadı", 404)
    }

    await prisma.menuItem.delete({ where: { id } })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error("Menu DELETE error:", error)
    return errorResponse("Ürün silinirken bir hata oluştu", 500)
  }
}

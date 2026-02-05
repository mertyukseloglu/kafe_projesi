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

// GET - List categories
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

    const categories = await prisma.category.findMany({
      where: { tenantId },
      include: {
        _count: { select: { menuItems: true } },
      },
      orderBy: { sortOrder: "asc" },
    })

    return successResponse({
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        image: cat.image,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
        itemCount: cat._count.menuItems,
        availableFrom: cat.availableFrom,
        availableTo: cat.availableTo,
      })),
    })
  } catch (error) {
    console.error("Categories GET error:", error)
    return errorResponse("Kategoriler alınırken bir hata oluştu", 500)
  }
}

// POST - Create category
const createCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gerekli"),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
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

    const validationResult = createCategorySchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const data = validationResult.data

    // Get max sort order
    const maxSort = await prisma.category.aggregate({
      where: { tenantId },
      _max: { sortOrder: true },
    })

    const category = await prisma.category.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        icon: data.icon,
        image: data.image,
        availableFrom: data.availableFrom,
        availableTo: data.availableTo,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    })

    return successResponse({
      id: category.id,
      name: category.name,
    }, 201)
  } catch (error) {
    console.error("Categories POST error:", error)
    return errorResponse("Kategori oluşturulurken bir hata oluştu", 500)
  }
}

// PATCH - Update category
const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  availableFrom: z.string().nullable().optional(),
  availableTo: z.string().nullable().optional(),
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

    const validationResult = updateCategorySchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const { id, ...updateData } = validationResult.data

    // Verify category belongs to tenant
    const existingCategory = await prisma.category.findFirst({
      where: { id, tenantId },
    })

    if (!existingCategory) {
      return errorResponse("Kategori bulunamadı", 404)
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    })

    return successResponse({
      id: updatedCategory.id,
      name: updatedCategory.name,
      isActive: updatedCategory.isActive,
    })
  } catch (error) {
    console.error("Categories PATCH error:", error)
    return errorResponse("Kategori güncellenirken bir hata oluştu", 500)
  }
}

// DELETE - Delete category
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
      return errorResponse("Kategori ID gerekli", 400)
    }

    // Verify category belongs to tenant
    const existingCategory = await prisma.category.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { menuItems: true } } },
    })

    if (!existingCategory) {
      return errorResponse("Kategori bulunamadı", 404)
    }

    if (existingCategory._count.menuItems > 0) {
      return errorResponse("Bu kategoride ürünler var. Önce ürünleri silin veya taşıyın.", 400)
    }

    await prisma.category.delete({ where: { id } })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error("Categories DELETE error:", error)
    return errorResponse("Kategori silinirken bir hata oluştu", 500)
  }
}

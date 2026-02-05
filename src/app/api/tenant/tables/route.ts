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

// GET - List tables
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
    const tenantSlug = session.user.tenantSlug

    const tables = await prisma.table.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
              },
            },
          },
        },
      },
      orderBy: [{ area: "asc" }, { number: "asc" }],
    })

    return successResponse({
      tables: tables.map((table) => ({
        id: table.id,
        number: table.number,
        area: table.area,
        capacity: table.capacity,
        qrCode: table.qrCode || `/customer/menu/${tenantSlug}?table=${table.number}`,
        isActive: table.isActive,
        activeOrders: table._count.orders,
      })),
    })
  } catch (error) {
    console.error("Tables GET error:", error)
    return errorResponse("Masalar alınırken bir hata oluştu", 500)
  }
}

// POST - Create table
const createTableSchema = z.object({
  number: z.string().min(1, "Masa numarası gerekli"),
  area: z.string().optional(),
  capacity: z.number().min(1).optional(),
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
    const tenantSlug = session.user.tenantSlug
    const body = await request.json()

    const validationResult = createTableSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const data = validationResult.data

    // Check if table number already exists
    const existingTable = await prisma.table.findFirst({
      where: { tenantId, number: data.number },
    })

    if (existingTable) {
      return errorResponse("Bu masa numarası zaten kullanılıyor", 400)
    }

    const table = await prisma.table.create({
      data: {
        tenantId,
        number: data.number,
        area: data.area,
        capacity: data.capacity || 4,
        qrCode: `/customer/menu/${tenantSlug}?table=${data.number}`,
      },
    })

    return successResponse({
      id: table.id,
      number: table.number,
      qrCode: table.qrCode,
    }, 201)
  } catch (error) {
    console.error("Tables POST error:", error)
    return errorResponse("Masa oluşturulurken bir hata oluştu", 500)
  }
}

// PATCH - Update table
const updateTableSchema = z.object({
  id: z.string(),
  number: z.string().min(1).optional(),
  area: z.string().nullable().optional(),
  capacity: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
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
    const tenantSlug = session.user.tenantSlug
    const body = await request.json()

    const validationResult = updateTableSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const { id, number, ...updateData } = validationResult.data

    // Verify table belongs to tenant
    const existingTable = await prisma.table.findFirst({
      where: { id, tenantId },
    })

    if (!existingTable) {
      return errorResponse("Masa bulunamadı", 404)
    }

    // If changing number, check uniqueness
    if (number && number !== existingTable.number) {
      const duplicate = await prisma.table.findFirst({
        where: { tenantId, number, id: { not: id } },
      })
      if (duplicate) {
        return errorResponse("Bu masa numarası zaten kullanılıyor", 400)
      }
    }

    const finalUpdateData: Record<string, unknown> = { ...updateData }
    if (number) {
      finalUpdateData.number = number
      finalUpdateData.qrCode = `/customer/menu/${tenantSlug}?table=${number}`
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: finalUpdateData,
    })

    return successResponse({
      id: updatedTable.id,
      number: updatedTable.number,
      isActive: updatedTable.isActive,
    })
  } catch (error) {
    console.error("Tables PATCH error:", error)
    return errorResponse("Masa güncellenirken bir hata oluştu", 500)
  }
}

// DELETE - Delete table
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
      return errorResponse("Masa ID gerekli", 400)
    }

    // Verify table belongs to tenant
    const existingTable = await prisma.table.findFirst({
      where: { id, tenantId },
    })

    if (!existingTable) {
      return errorResponse("Masa bulunamadı", 404)
    }

    await prisma.table.delete({ where: { id } })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error("Tables DELETE error:", error)
    return errorResponse("Masa silinirken bir hata oluştu", 500)
  }
}

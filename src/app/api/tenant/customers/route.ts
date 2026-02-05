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

// GET - List customers
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

    const search = searchParams.get("search")
    const tag = searchParams.get("tag")
    const sortBy = searchParams.get("sortBy") || "lastVisitAt"
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build where clause
    const where: Record<string, unknown> = { tenantId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (tag && tag !== "all") {
      where.tags = { has: tag }
    }

    // Build orderBy
    const orderBy: Record<string, string> = {}
    switch (sortBy) {
      case "totalSpent":
        orderBy.totalSpent = "desc"
        break
      case "loyaltyPoints":
        orderBy.loyaltyPoints = "desc"
        break
      case "visitCount":
        orderBy.visitCount = "desc"
        break
      default:
        orderBy.lastVisitAt = "desc"
    }

    const [customers, total, stats] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.customer.count({ where }),
      prisma.customer.aggregate({
        where: { tenantId },
        _count: true,
        _sum: { loyaltyPoints: true },
        _avg: { loyaltyPoints: true },
      }),
    ])

    // Count new customers this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newThisMonth = await prisma.customer.count({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
      },
    })

    return successResponse({
      customers: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        loyaltyPoints: customer.loyaltyPoints,
        totalSpent: Number(customer.totalSpent),
        visitCount: customer.visitCount,
        tags: customer.tags as string[],
        preferences: customer.preferences,
        lastVisitAt: customer.lastVisitAt,
        createdAt: customer.createdAt,
        recentOrders: customer.orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          date: order.createdAt,
        })),
      })),
      total,
      limit,
      offset,
      stats: {
        totalCustomers: stats._count,
        newThisMonth,
        avgLoyaltyPoints: Math.round(stats._avg.loyaltyPoints || 0),
        totalLoyaltyPoints: stats._sum.loyaltyPoints || 0,
      },
    })
  } catch (error) {
    console.error("Customers GET error:", error)
    return errorResponse("Müşteriler alınırken bir hata oluştu", 500)
  }
}

// POST - Create customer
const createCustomerSchema = z.object({
  name: z.string().min(1, "İsim gerekli"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  loyaltyPoints: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_ALL_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const body = await request.json()

    const validationResult = createCustomerSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const data = validationResult.data

    // Check for existing customer with same phone or email
    if (data.phone) {
      const existingByPhone = await prisma.customer.findFirst({
        where: { tenantId, phone: data.phone },
      })
      if (existingByPhone) {
        return errorResponse("Bu telefon numarası zaten kayıtlı", 400)
      }
    }

    if (data.email) {
      const existingByEmail = await prisma.customer.findFirst({
        where: { tenantId, email: data.email },
      })
      if (existingByEmail) {
        return errorResponse("Bu e-posta adresi zaten kayıtlı", 400)
      }
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        loyaltyPoints: data.loyaltyPoints || 0,
        tags: data.tags || ["yeni"],
      },
    })

    return successResponse({
      id: customer.id,
      name: customer.name,
    }, 201)
  } catch (error) {
    console.error("Customers POST error:", error)
    return errorResponse("Müşteri oluşturulurken bir hata oluştu", 500)
  }
}

// PATCH - Update customer
const updateCustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  loyaltyPoints: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  preferences: z.record(z.string(), z.any()).optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_ALL_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const tenantId = session.user.tenantId!
    const body = await request.json()

    const validationResult = updateCustomerSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0]?.message || "Geçersiz veri", 400)
    }

    const { id, ...updateData } = validationResult.data

    // Verify customer belongs to tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: { id, tenantId },
    })

    if (!existingCustomer) {
      return errorResponse("Müşteri bulunamadı", 404)
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData,
    })

    return successResponse({
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      loyaltyPoints: updatedCustomer.loyaltyPoints,
    })
  } catch (error) {
    console.error("Customers PATCH error:", error)
    return errorResponse("Müşteri güncellenirken bir hata oluştu", 500)
  }
}

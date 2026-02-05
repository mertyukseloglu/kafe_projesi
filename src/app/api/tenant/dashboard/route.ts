import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_ALL_ROLES,
} from "@/lib/api-utils"

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

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Parallel queries for performance
    const [
      todayOrders,
      pendingOrders,
      totalOrders,
      totalRevenue,
      totalCustomers,
      popularItems,
      recentOrders,
      // Loyalty stats
      tierDistribution,
      totalLoyaltyPoints,
      // Session stats (today)
      todaySessions,
      // Yesterday comparison
      yesterdayOrders,
    ] = await Promise.all([
      // Today's orders count and revenue
      prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: { gte: today, lt: tomorrow },
        },
        _count: true,
        _sum: { total: true },
      }),

      // Pending orders count
      prisma.order.count({
        where: {
          tenantId,
          status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
        },
      }),

      // Total orders this month
      prisma.order.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
      }),

      // Total revenue this month
      prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
          paymentStatus: "PAID",
        },
        _sum: { total: true },
      }),

      // Total customers
      prisma.customer.count({
        where: { tenantId },
      }),

      // Popular items (top 5)
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        where: {
          order: {
            tenantId,
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), 1),
            },
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      // Recent orders
      prisma.order.findMany({
        where: { tenantId },
        include: {
          table: { select: { number: true } },
          items: {
            include: {
              menuItem: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Loyalty tier distribution
      prisma.customer.groupBy({
        by: ["loyaltyTier"],
        where: { tenantId },
        _count: true,
      }),

      // Total loyalty points issued
      prisma.customer.aggregate({
        where: { tenantId },
        _sum: { loyaltyPoints: true },
      }),

      // Today's sessions
      prisma.customerSession.aggregate({
        where: {
          tenantId,
          startedAt: { gte: today, lt: tomorrow },
        },
        _count: true,
        _avg: { pageViews: true, menuItemViews: true },
      }),

      // Yesterday's revenue for comparison
      prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
            lt: today,
          },
        },
        _sum: { total: true },
      }),
    ])

    // Get menu item details for popular items
    const popularItemIds = popularItems.map((item) => item.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: popularItemIds } },
      select: { id: true, name: true, price: true },
    })

    const popularItemsWithDetails = popularItems.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
      return {
        id: item.menuItemId,
        name: menuItem?.name || "Bilinmeyen",
        price: menuItem?.price || 0,
        quantity: item._sum.quantity || 0,
      }
    })

    // Calculate revenue change percentage
    const todayRev = Number(todayOrders._sum.total || 0)
    const yesterdayRev = Number(yesterdayOrders._sum.total || 0)
    const revenueChange = yesterdayRev > 0
      ? Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100 * 10) / 10
      : 0

    return successResponse({
      today: {
        orders: todayOrders._count,
        revenue: todayRev,
      },
      pending: pendingOrders,
      month: {
        orders: totalOrders,
        revenue: Number(totalRevenue._sum.total || 0),
      },
      customers: totalCustomers,
      revenueChange,
      loyalty: {
        totalPoints: totalLoyaltyPoints._sum.loyaltyPoints || 0,
        tiers: tierDistribution.reduce(
          (acc, t) => ({ ...acc, [t.loyaltyTier]: t._count }),
          { BRONZE: 0, SILVER: 0, GOLD: 0, PLATINUM: 0 }
        ),
      },
      sessions: {
        today: todaySessions._count || 0,
        avgPageViews: Math.round(Number(todaySessions._avg.pageViews || 0) * 10) / 10,
        avgItemViews: Math.round(Number(todaySessions._avg.menuItemViews || 0) * 10) / 10,
      },
      popularItems: popularItemsWithDetails,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        table: order.table?.number || null,
        status: order.status,
        total: Number(order.total),
        items: order.items.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
        })),
        createdAt: order.createdAt,
      })),
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return errorResponse("Veriler alınırken bir hata oluştu", 500)
  }
}

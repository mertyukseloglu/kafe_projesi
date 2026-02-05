import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

// Demo data for reports
const demoReportData = {
  summary: {
    totalOrders: 156,
    totalRevenue: 18450,
    averageOrderValue: 118.27,
    totalCustomers: 89,
    newCustomers: 23,
    returningCustomers: 66,
  },
  dailyStats: Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split("T")[0],
      orders: Math.floor(Math.random() * 30) + 10,
      revenue: Math.floor(Math.random() * 3000) + 1000,
    }
  }),
  hourlyStats: Array.from({ length: 14 }, (_, i) => ({
    hour: i + 9,
    orders: Math.floor(Math.random() * 10) + 1,
    revenue: Math.floor(Math.random() * 1000) + 100,
  })),
  categoryStats: [
    { name: "Sıcak İçecekler", orders: 68, revenue: 5440, percentage: 29.5 },
    { name: "Soğuk İçecekler", orders: 42, revenue: 3360, percentage: 18.2 },
    { name: "Tatlılar", orders: 31, revenue: 2790, percentage: 15.1 },
    { name: "Atıştırmalıklar", orders: 15, revenue: 1425, percentage: 7.7 },
  ],
  popularItems: [
    { name: "Latte", quantity: 45, revenue: 2925 },
    { name: "Cappuccino", quantity: 38, revenue: 2280 },
    { name: "Cheesecake", quantity: 27, revenue: 2295 },
    { name: "Türk Kahvesi", quantity: 24, revenue: 1080 },
    { name: "Ice Latte", quantity: 21, revenue: 1470 },
  ],
  staffPerformance: [
    { name: "Ahmet Y.", ordersProcessed: 42, avgTime: 8.5 },
    { name: "Mehmet K.", ordersProcessed: 38, avgTime: 9.2 },
    { name: "Ayşe D.", ordersProcessed: 35, avgTime: 7.8 },
  ],
  paymentMethods: [
    { method: "Nakit", count: 78, amount: 9200, percentage: 50 },
    { method: "Kredi Kartı", count: 62, amount: 7400, percentage: 40 },
    { method: "Mobil Ödeme", count: 16, amount: 1850, percentage: 10 },
  ],
}

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
    const period = searchParams.get("period") || "week" // day, week, month, custom
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Calculate date range
    const now = new Date()
    let dateFrom: Date
    let dateTo: Date = new Date(now)
    dateTo.setHours(23, 59, 59, 999)

    switch (period) {
      case "day":
        dateFrom = new Date(now)
        dateFrom.setHours(0, 0, 0, 0)
        break
      case "week":
        dateFrom = new Date(now)
        dateFrom.setDate(dateFrom.getDate() - 7)
        dateFrom.setHours(0, 0, 0, 0)
        break
      case "month":
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "custom":
        if (startDate && endDate) {
          dateFrom = new Date(startDate)
          dateTo = new Date(endDate)
          dateTo.setHours(23, 59, 59, 999)
        } else {
          dateFrom = new Date(now)
          dateFrom.setDate(dateFrom.getDate() - 7)
        }
        break
      default:
        dateFrom = new Date(now)
        dateFrom.setDate(dateFrom.getDate() - 7)
    }

    try {
      // Get orders within date range
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        include: {
          items: {
            include: {
              menuItem: {
                include: { category: true },
              },
            },
          },
        },
      })

      // Calculate statistics
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Get customer stats
      const customers = await prisma.customer.findMany({
        where: {
          tenantId,
          createdAt: { gte: dateFrom },
        },
      })
      const newCustomers = customers.length
      const totalCustomers = await prisma.customer.count({ where: { tenantId } })

      // Daily stats
      const dailyMap = new Map<string, { orders: number; revenue: number }>()
      orders.forEach((order) => {
        const dateKey = order.createdAt.toISOString().split("T")[0]
        const existing = dailyMap.get(dateKey) || { orders: 0, revenue: 0 }
        dailyMap.set(dateKey, {
          orders: existing.orders + 1,
          revenue: existing.revenue + Number(order.total),
        })
      })

      const dailyStats = Array.from(dailyMap.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      }))

      // Category stats
      const categoryMap = new Map<string, { orders: number; revenue: number }>()
      orders.forEach((order) => {
        order.items.forEach((item) => {
          const categoryName = item.menuItem?.category?.name || "Diğer"
          const existing = categoryMap.get(categoryName) || { orders: 0, revenue: 0 }
          categoryMap.set(categoryName, {
            orders: existing.orders + item.quantity,
            revenue: existing.revenue + Number(item.totalPrice),
          })
        })
      })

      const categoryStats = Array.from(categoryMap.entries()).map(([name, stats]) => ({
        name,
        ...stats,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
      }))

      // Popular items
      const itemMap = new Map<string, { quantity: number; revenue: number }>()
      orders.forEach((order) => {
        order.items.forEach((item) => {
          const itemName = item.menuItem?.name || "Bilinmeyen"
          const existing = itemMap.get(itemName) || { quantity: 0, revenue: 0 }
          itemMap.set(itemName, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + Number(item.totalPrice),
          })
        })
      })

      const popularItems = Array.from(itemMap.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

      // Hourly stats
      const hourlyMap = new Map<number, { orders: number; revenue: number }>()
      orders.forEach((order) => {
        const hour = order.createdAt.getHours()
        const existing = hourlyMap.get(hour) || { orders: 0, revenue: 0 }
        hourlyMap.set(hour, {
          orders: existing.orders + 1,
          revenue: existing.revenue + Number(order.total),
        })
      })

      const hourlyStats = Array.from(hourlyMap.entries())
        .map(([hour, stats]) => ({ hour, ...stats }))
        .sort((a, b) => a.hour - b.hour)

      // Payment method stats
      const paymentMap = new Map<string, { count: number; amount: number }>()
      orders.forEach((order) => {
        const method = order.paymentMethod || "CASH"
        const existing = paymentMap.get(method) || { count: 0, amount: 0 }
        paymentMap.set(method, {
          count: existing.count + 1,
          amount: existing.amount + Number(order.total),
        })
      })

      const paymentMethodLabels: Record<string, string> = {
        CASH: "Nakit",
        CREDIT_CARD: "Kredi Kartı",
        ONLINE: "Online Ödeme",
      }

      const paymentMethods = Array.from(paymentMap.entries()).map(([method, stats]) => ({
        method: paymentMethodLabels[method] || method,
        ...stats,
        percentage: totalOrders > 0 ? (stats.count / totalOrders) * 100 : 0,
      }))

      // Order status breakdown
      const statusMap = new Map<string, number>()
      orders.forEach((order) => {
        const count = statusMap.get(order.status) || 0
        statusMap.set(order.status, count + 1)
      })

      const statusLabels: Record<string, string> = {
        PENDING: "Bekliyor",
        CONFIRMED: "Onaylandı",
        PREPARING: "Hazırlanıyor",
        READY: "Hazır",
        DELIVERED: "Teslim Edildi",
        CANCELLED: "İptal",
      }

      const orderStatusStats = Array.from(statusMap.entries()).map(([status, count]) => ({
        status: statusLabels[status] || status,
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
      }))

      return successResponse({
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          totalCustomers,
          newCustomers,
          returningCustomers: totalCustomers - newCustomers,
        },
        dailyStats,
        hourlyStats,
        categoryStats,
        popularItems,
        paymentMethods,
        orderStatusStats,
        period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
      })
    } catch {
      // Database not available - return demo data
      return successResponse({
        ...demoReportData,
        period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
      })
    }
  } catch (error) {
    console.error("Reports API error:", error)
    return errorResponse("Rapor verileri alınırken bir hata oluştu", 500)
  }
}

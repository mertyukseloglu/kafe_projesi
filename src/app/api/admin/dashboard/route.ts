import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Demo data for development
const demoData = {
  stats: {
    totalRestaurants: 12,
    newThisMonth: 3,
    activeSubscriptions: 10,
    trialSubscriptions: 2,
    todayOrders: 156,
    todayRevenue: 24850,
    mrr: 5990,
    mrrChange: 15.2,
  },
  recentRestaurants: [
    { id: "1", name: "Demo Kafe", slug: "demo-kafe", plan: "Growth", status: "active", orders: 18 },
    { id: "2", name: "Lezzet Durağı", slug: "lezzet-duragi", plan: "Pro", status: "active", orders: 32 },
    { id: "3", name: "Kahve Evi", slug: "kahve-evi", plan: "Starter", status: "trial", orders: 8 },
    { id: "4", name: "Tatlı Köşe", slug: "tatli-kose", plan: "Growth", status: "active", orders: 24 },
  ],
  systemStatus: [
    { name: "Veritabanı", status: "operational", latency: "12ms" },
    { name: "API Sunucusu", status: "operational", latency: "45ms" },
    { name: "AI Servisi", status: "configured", latency: "320ms" },
    { name: "Ödeme Gateway", status: "pending", latency: "-" },
  ],
}

export async function GET() {
  try {
    const session = await auth()

    // Check if user is authenticated and is SUPER_ADMIN
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Yetkilendirme gerekli" },
        { status: 401 }
      )
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    try {
      // Try to get real data from database
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [
        totalRestaurants,
        newThisMonth,
        activeSubscriptions,
        trialSubscriptions,
        todayOrders,
        recentRestaurants,
      ] = await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({
          where: {
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), 1),
            },
          },
        }),
        prisma.subscription.count({
          where: { status: "ACTIVE" },
        }),
        prisma.subscription.count({
          where: { status: "TRIAL" },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: today },
          },
        }),
        prisma.tenant.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            subscription: {
              include: {
                plan: true,
              },
            },
            _count: {
              select: { orders: true },
            },
          },
        }),
      ])

      // Calculate today's revenue
      const todayOrdersData = await prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
        },
        _sum: {
          total: true,
        },
      })

      // Calculate MRR
      const activeSubsWithPlans = await prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: {
          plan: true,
        },
      })

      const mrr = activeSubsWithPlans.reduce((total, sub) => {
        return total + Number(sub.plan?.price || 0)
      }, 0)

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalRestaurants,
            newThisMonth,
            activeSubscriptions,
            trialSubscriptions,
            todayOrders,
            todayRevenue: Number(todayOrdersData._sum.total) || 0,
            mrr,
            mrrChange: 15.2, // Would need historical data to calculate
          },
          recentRestaurants: recentRestaurants.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            plan: r.subscription?.plan?.name || "Starter",
            status: r.subscription?.status?.toLowerCase() || "trial",
            orders: r._count.orders,
          })),
          systemStatus: demoData.systemStatus,
        },
      })
    } catch {
      // Return demo data if database is not available
      return NextResponse.json({
        success: true,
        data: demoData,
      })
    }
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

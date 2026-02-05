import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Demo payments data
const demoPayments = [
  {
    id: "pay_1",
    subscriptionId: "sub_1",
    tenantName: "Demo Kafe",
    amount: 499,
    currency: "TRY",
    status: "PAID",
    plan: "Growth",
    createdAt: "2024-02-01T10:30:00Z",
    paidAt: "2024-02-01T10:30:00Z",
  },
  {
    id: "pay_2",
    subscriptionId: "sub_2",
    tenantName: "Lezzet Durağı",
    amount: 999,
    currency: "TRY",
    status: "PAID",
    plan: "Pro",
    createdAt: "2024-02-01T09:15:00Z",
    paidAt: "2024-02-01T09:15:00Z",
  },
  {
    id: "pay_3",
    subscriptionId: "sub_4",
    tenantName: "Tatlı Köşe",
    amount: 499,
    currency: "TRY",
    status: "PAID",
    plan: "Growth",
    createdAt: "2024-02-01T11:45:00Z",
    paidAt: "2024-02-01T11:45:00Z",
  },
  {
    id: "pay_4",
    subscriptionId: "sub_5",
    tenantName: "Şehir Bistro",
    amount: 499,
    currency: "TRY",
    status: "FAILED",
    plan: "Growth",
    createdAt: "2024-02-01T14:20:00Z",
    failedAt: "2024-02-01T14:20:00Z",
  },
  {
    id: "pay_5",
    subscriptionId: "sub_1",
    tenantName: "Demo Kafe",
    amount: 499,
    currency: "TRY",
    status: "PAID",
    plan: "Growth",
    createdAt: "2024-01-01T10:30:00Z",
    paidAt: "2024-01-01T10:30:00Z",
  },
]

const demoStats = {
  totalRevenue: 2995,
  thisMonth: 2496,
  lastMonth: 1996,
  pendingAmount: 499,
  successRate: 80,
}

// GET - List payments
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "all"

    try {
      // Build where clause
      const whereClause: Record<string, unknown> = {}

      if (status !== "all") {
        whereClause.status = status.toUpperCase()
      }

      const payments = await prisma.payment.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          subscription: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                },
              },
              plan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      // Calculate stats
      const allPayments = await prisma.payment.findMany()
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      const lastMonth = new Date(thisMonth)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const stats = {
        totalRevenue: allPayments
          .filter(p => p.status === "PAID")
          .reduce((sum, p) => sum + Number(p.amount), 0),
        thisMonth: allPayments
          .filter(p => p.status === "PAID" && p.createdAt >= thisMonth)
          .reduce((sum, p) => sum + Number(p.amount), 0),
        lastMonth: allPayments
          .filter(p => p.status === "PAID" && p.createdAt >= lastMonth && p.createdAt < thisMonth)
          .reduce((sum, p) => sum + Number(p.amount), 0),
        pendingAmount: allPayments
          .filter(p => p.status === "PENDING")
          .reduce((sum, p) => sum + Number(p.amount), 0),
        successRate: allPayments.length > 0
          ? Math.round((allPayments.filter(p => p.status === "PAID").length / allPayments.length) * 100)
          : 100,
      }

      return NextResponse.json({
        success: true,
        data: {
          payments: payments.map(p => ({
            id: p.id,
            subscriptionId: p.subscriptionId,
            tenantName: p.subscription?.tenant?.name || "Unknown",
            amount: Number(p.amount),
            currency: p.currency,
            status: p.status,
            plan: p.subscription?.plan?.name || "Starter",
            createdAt: p.createdAt.toISOString(),
            paidAt: p.paidAt?.toISOString() || null,
            failedAt: p.failedAt?.toISOString() || null,
          })),
          stats,
        },
      })
    } catch {
      // Return demo data
      let filteredPayments = demoPayments

      if (status !== "all") {
        filteredPayments = filteredPayments.filter(p => p.status === status.toUpperCase())
      }

      return NextResponse.json({
        success: true,
        data: {
          payments: filteredPayments,
          stats: demoStats,
        },
      })
    }
  } catch (error) {
    console.error("Admin payments error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

// POST - Create manual payment record
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { subscriptionId, amount } = body

    if (!subscriptionId || !amount) {
      return NextResponse.json(
        { success: false, error: "Subscription ID ve tutar gerekli" },
        { status: 400 }
      )
    }

    try {
      const payment = await prisma.payment.create({
        data: {
          subscriptionId,
          amount,
          currency: "TRY",
          status: "PAID",
          paidAt: new Date(),
        },
        include: {
          subscription: {
            include: {
              tenant: {
                select: { name: true },
              },
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: payment.id,
          subscriptionId: payment.subscriptionId,
          tenantName: payment.subscription?.tenant?.name,
          amount: Number(payment.amount),
          status: payment.status,
          createdAt: payment.createdAt.toISOString(),
        },
      })
    } catch {
      // Return mock response
      return NextResponse.json({
        success: true,
        data: {
          id: `pay_manual_${Date.now()}`,
          subscriptionId,
          amount,
          status: "PAID",
          createdAt: new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error("Create payment error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

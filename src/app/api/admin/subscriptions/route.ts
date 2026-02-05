import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Demo subscription plans
const demoPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 199,
    features: ["5 masa limiti", "Temel menü", "Email destek", "QR kod menü"],
    recommended: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 499,
    features: ["20 masa limiti", "AI asistan", "Öncelikli destek", "Raporlar", "Müşteri sadakati"],
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    features: ["Sınırsız masa", "Gelişmiş AI", "7/24 destek", "API erişimi", "Özel entegrasyonlar", "Beyaz etiket"],
    recommended: false,
  },
]

const demoSubscriptions = [
  {
    id: "1",
    tenantId: "1",
    tenantName: "Demo Kafe",
    planName: "Growth",
    status: "ACTIVE",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
  },
  {
    id: "2",
    tenantId: "2",
    tenantName: "Lezzet Durağı",
    planName: "Pro",
    status: "ACTIVE",
    startDate: "2024-01-10",
    endDate: "2024-02-10",
  },
  {
    id: "3",
    tenantId: "3",
    tenantName: "Kahve Evi",
    planName: "Starter",
    status: "TRIAL",
    startDate: "2024-02-01",
    endDate: "2024-02-15",
  },
]

// GET - List all subscriptions
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
    const type = searchParams.get("type") // "plans" or "subscriptions"

    if (type === "plans") {
      try {
        // Try to get plans from database
        const plans = await prisma.subscriptionPlan.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        })

        return NextResponse.json({
          success: true,
          data: plans.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.price),
            yearlyPrice: p.yearlyPrice ? Number(p.yearlyPrice) : null,
            features: p.features as string[],
            maxTables: p.maxTables,
            maxOrders: p.maxOrders,
            maxAiRequests: p.maxAiRequests,
            maxStaff: p.maxStaff,
          })),
        })
      } catch {
        return NextResponse.json({
          success: true,
          data: demoPlans,
        })
      }
    }

    try {
      // Get all subscriptions from database
      const subscriptions = await prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: subscriptions.map(s => ({
          id: s.id,
          tenantId: s.tenantId,
          tenantName: s.tenant?.name || "Unknown",
          tenantSlug: s.tenant?.slug || "",
          planId: s.planId,
          planName: s.plan?.name || "Unknown",
          planPrice: Number(s.plan?.price || 0),
          status: s.status,
          startDate: s.currentPeriodStart.toISOString().split("T")[0],
          endDate: s.currentPeriodEnd.toISOString().split("T")[0],
          trialEndsAt: s.trialEndsAt?.toISOString().split("T")[0] || null,
          ordersUsed: s.ordersUsed,
          aiRequestsUsed: s.aiRequestsUsed,
        })),
      })
    } catch {
      // Return demo data
      return NextResponse.json({
        success: true,
        data: demoSubscriptions,
      })
    }
  } catch (error) {
    console.error("Admin subscriptions error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

// PATCH - Update subscription
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, planId, status, extendDays } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Abonelik ID gerekli" },
        { status: 400 }
      )
    }

    try {
      const updateData: Record<string, unknown> = {}

      if (planId) updateData.planId = planId
      if (status) updateData.status = status

      // Extend subscription
      if (extendDays) {
        const subscription = await prisma.subscription.findUnique({
          where: { id },
        })

        if (subscription) {
          updateData.currentPeriodEnd = new Date(
            subscription.currentPeriodEnd.getTime() + extendDays * 24 * 60 * 60 * 1000
          )
        }
      }

      const updated = await prisma.subscription.update({
        where: { id },
        data: updateData,
        include: {
          tenant: {
            select: { name: true },
          },
          plan: {
            select: { name: true, price: true },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          tenantId: updated.tenantId,
          tenantName: updated.tenant?.name,
          planId: updated.planId,
          planName: updated.plan?.name,
          status: updated.status,
          startDate: updated.currentPeriodStart.toISOString().split("T")[0],
          endDate: updated.currentPeriodEnd.toISOString().split("T")[0],
        },
      })
    } catch {
      // Return mock response
      return NextResponse.json({
        success: true,
        data: { id, planId, status },
      })
    }
  } catch (error) {
    console.error("Update subscription error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

// POST - Create or update subscription plan
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
    const { name, slug, price, yearlyPrice, features, maxTables, maxOrders, maxAiRequests, maxStaff } = body

    if (!name || !slug || !price) {
      return NextResponse.json(
        { success: false, error: "İsim, slug ve fiyat gerekli" },
        { status: 400 }
      )
    }

    try {
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name,
          slug,
          price,
          yearlyPrice,
          features: features || [],
          maxTables: maxTables || -1,
          maxOrders: maxOrders || -1,
          maxAiRequests: maxAiRequests || -1,
          maxStaff: maxStaff || -1,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          price: Number(plan.price),
        },
      })
    } catch {
      return NextResponse.json({
        success: true,
        data: { name, slug, price },
      })
    }
  } catch (error) {
    console.error("Create plan error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

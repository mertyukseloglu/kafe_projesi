import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"

// Rapor dışa aktarma (CSV)
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 })
    }

    const tenantId = session.user.tenantId!
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "orders" // orders, items, customers
    const format = searchParams.get("format") || "csv" // csv, json
    const period = searchParams.get("period") || "month"

    // Calculate date range
    const now = new Date()
    let dateFrom: Date

    switch (period) {
      case "day":
        dateFrom = new Date(now)
        dateFrom.setHours(0, 0, 0, 0)
        break
      case "week":
        dateFrom = new Date(now)
        dateFrom.setDate(dateFrom.getDate() - 7)
        break
      case "month":
      default:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    let csvContent = ""
    let fileName = ""
    let data: unknown[] = []

    try {
      switch (type) {
        case "orders": {
          const orders = await prisma.order.findMany({
            where: {
              tenantId,
              createdAt: { gte: dateFrom },
            },
            include: {
              table: true,
              customer: true,
              items: {
                include: { menuItem: true },
              },
            },
            orderBy: { createdAt: "desc" },
          })

          if (format === "csv") {
            csvContent = "Sipariş No,Tarih,Masa,Müşteri,Durum,Ödeme,Toplam,Ürünler\n"
            orders.forEach((order) => {
              const items = order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join("; ")
              csvContent += `${order.orderNumber},${order.createdAt.toLocaleString("tr-TR")},${order.table?.number || "-"},${order.customer?.name || "-"},${order.status},${order.paymentStatus},${order.total},"${items}"\n`
            })
            fileName = `siparisler_${dateFrom.toISOString().split("T")[0]}.csv`
          } else {
            data = orders.map((o) => ({
              orderNumber: o.orderNumber,
              date: o.createdAt,
              table: o.table?.number,
              customer: o.customer?.name,
              status: o.status,
              paymentStatus: o.paymentStatus,
              total: Number(o.total),
              items: o.items.map((i) => ({
                name: i.menuItem.name,
                quantity: i.quantity,
                price: Number(i.totalPrice),
              })),
            }))
          }
          break
        }

        case "items": {
          const orderItems = await prisma.orderItem.findMany({
            where: {
              order: {
                tenantId,
                createdAt: { gte: dateFrom },
              },
            },
            include: {
              menuItem: { include: { category: true } },
              order: true,
            },
          })

          // Aggregate by item
          const itemStats = new Map<string, { name: string; category: string; quantity: number; revenue: number }>()
          orderItems.forEach((item) => {
            const key = item.menuItemId
            const existing = itemStats.get(key) || {
              name: item.menuItem.name,
              category: item.menuItem.category?.name || "Diğer",
              quantity: 0,
              revenue: 0,
            }
            itemStats.set(key, {
              ...existing,
              quantity: existing.quantity + item.quantity,
              revenue: existing.revenue + Number(item.totalPrice),
            })
          })

          const sortedItems = Array.from(itemStats.values()).sort((a, b) => b.quantity - a.quantity)

          if (format === "csv") {
            csvContent = "Ürün,Kategori,Satış Adedi,Toplam Gelir\n"
            sortedItems.forEach((item) => {
              csvContent += `"${item.name}","${item.category}",${item.quantity},${item.revenue.toFixed(2)}\n`
            })
            fileName = `urunler_${dateFrom.toISOString().split("T")[0]}.csv`
          } else {
            data = sortedItems
          }
          break
        }

        case "customers": {
          const customers = await prisma.customer.findMany({
            where: { tenantId },
            orderBy: { totalSpent: "desc" },
          })

          if (format === "csv") {
            csvContent = "Ad,Telefon,Email,Ziyaret Sayısı,Toplam Harcama,Sadakat Puanı,Tier,Son Ziyaret\n"
            customers.forEach((c) => {
              csvContent += `"${c.name || "-"}","${c.phone || "-"}","${c.email || "-"}",${c.visitCount},${c.totalSpent},${c.loyaltyPoints},${c.loyaltyTier},${c.lastVisitAt?.toLocaleDateString("tr-TR") || "-"}\n`
            })
            fileName = `musteriler_${new Date().toISOString().split("T")[0]}.csv`
          } else {
            data = customers.map((c) => ({
              name: c.name,
              phone: c.phone,
              email: c.email,
              visitCount: c.visitCount,
              totalSpent: Number(c.totalSpent),
              loyaltyPoints: c.loyaltyPoints,
              loyaltyTier: c.loyaltyTier,
              lastVisit: c.lastVisitAt,
            }))
          }
          break
        }

        default:
          return NextResponse.json({ error: "Geçersiz rapor tipi" }, { status: 400 })
      }
    } catch {
      // Database error - return empty
      return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 })
    }

    // Return based on format
    if (format === "csv") {
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      })
    } else {
      return NextResponse.json({
        success: true,
        data,
        meta: {
          type,
          period,
          dateFrom: dateFrom.toISOString(),
          dateTo: now.toISOString(),
          count: data.length,
        },
      })
    }
  } catch (error) {
    console.error("Report export error:", error)
    return NextResponse.json({ error: "Dışa aktarma başarısız" }, { status: 500 })
  }
}

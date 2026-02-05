import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notifyWaiterCalled } from "@/lib/pusher"
import type { ApiResponse } from "@/types"
import { z } from "zod"

// Çağrı nedenleri
const reasonLabels: Record<string, string> = {
  order: "Sipariş Vermek İstiyor",
  payment: "Hesap İsteniyor",
  assistance: "Yardım İsteniyor",
  other: "Diğer",
}

// Validasyon şeması
const waiterCallSchema = z.object({
  tenantSlug: z.string().min(1, "Restoran slug gerekli"),
  tableNumber: z.string().min(1, "Masa numarası gerekli"),
  reason: z.enum(["order", "payment", "assistance", "other"]).optional(),
  message: z.string().optional(),
})

interface WaiterCallData {
  id: string
  tableNumber: string
  reason: string
  reasonLabel: string
  status: string
  createdAt: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<WaiterCallData | null>>> {
  try {
    const body = await request.json()

    // Validasyon
    const validationResult = waiterCallSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz veri",
          message: validationResult.error.issues[0]?.message,
        },
        { status: 400 }
      )
    }

    const { tenantSlug, tableNumber, reason, message } = validationResult.data

    try {
      // Tenant'ı bul
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug, isActive: true },
      })

      if (!tenant) {
        return NextResponse.json(
          { success: false, error: "Restoran bulunamadı" },
          { status: 404 }
        )
      }

      // Masa kontrolü
      const table = await prisma.table.findFirst({
        where: {
          tenantId: tenant.id,
          number: tableNumber,
          isActive: true,
        },
      })

      if (!table) {
        return NextResponse.json(
          { success: false, error: "Masa bulunamadı" },
          { status: 404 }
        )
      }

      // Real-time bildirim gönder
      notifyWaiterCalled(tenant.id, {
        tableNumber,
        message: message || reasonLabels[reason || "assistance"],
      }).catch((err) => console.error("Pusher notification error:", err))

      return NextResponse.json({
        success: true,
        data: {
          id: `call_${Date.now()}`,
          tableNumber,
          reason: reason || "assistance",
          reasonLabel: reasonLabels[reason || "assistance"],
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        message: "Garson çağrınız iletildi",
      })
    } catch {
      // Database not available - demo mode
      return NextResponse.json({
        success: true,
        data: {
          id: `call_${Date.now()}`,
          tableNumber,
          reason: reason || "assistance",
          reasonLabel: reasonLabels[reason || "assistance"],
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        message: "Garson çağrınız iletildi (demo)",
      })
    }
  } catch (error) {
    console.error("Waiter call error:", error)
    return NextResponse.json(
      { success: false, error: "Garson çağrılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// GET - Get active waiter calls (for staff panel)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantSlug = searchParams.get("tenantSlug")
    const status = searchParams.get("status") || "PENDING"

    // Demo data for waiter calls
    const demoCalls = [
      {
        id: "call_1",
        tableNumber: "5",
        reason: "assistance",
        reasonLabel: "Yardım İsteniyor",
        status: "PENDING",
        createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      },
      {
        id: "call_2",
        tableNumber: "3",
        reason: "payment",
        reasonLabel: "Hesap İsteniyor",
        status: "PENDING",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: "call_3",
        tableNumber: "8",
        reason: "order",
        reasonLabel: "Sipariş Vermek İstiyor",
        status: "RESOLVED",
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
        resolvedAt: new Date(Date.now() - 7 * 60000).toISOString(),
      },
    ]

    // Filter by status
    const filteredCalls = status === "all"
      ? demoCalls
      : demoCalls.filter(call => call.status === status)

    return NextResponse.json({
      success: true,
      data: filteredCalls,
    })
  } catch (error) {
    console.error("Get waiter calls error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

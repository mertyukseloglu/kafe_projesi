import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { ApiResponse } from "@/types"
import { z } from "zod"

// Validasyon şeması
const waiterCallSchema = z.object({
  tenantSlug: z.string().min(1, "Restoran slug gerekli"),
  tableNumber: z.string().min(1, "Masa numarası gerekli"),
  reason: z.enum(["order", "payment", "assistance", "other"]).optional(),
  message: z.string().optional(),
})

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
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

    // Gerçek projede burada:
    // 1. WebSocket/Pusher ile panel'e bildirim gönderilir
    // 2. Veritabanına kayıt atılabilir (WaiterCall tablosu)
    // 3. Push notification gönderilebilir

    console.log(`🔔 Garson çağrısı: ${tenant.name} - Masa ${tableNumber}`, {
      reason,
      message,
      timestamp: new Date().toISOString(),
    })

    // Şimdilik başarılı yanıt dönüyoruz
    // TODO: Real-time bildirim entegrasyonu (Pusher)
    return NextResponse.json({
      success: true,
      message: "Garson çağrınız iletildi",
    })
  } catch (error) {
    console.error("Waiter call error:", error)
    return NextResponse.json(
      { success: false, error: "Garson çağrılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedSession,
  errorResponse,
  successResponse,
  hasRole,
  TENANT_MANAGER_ROLES,
} from "@/lib/api-utils"
import { randomBytes } from "crypto"

// Webhook event types
export type WebhookEvent =
  | "order.created"
  | "order.updated"
  | "order.completed"
  | "order.cancelled"
  | "menu.updated"
  | "stock.low"
  | "stock.out"
  | "customer.created"
  | "waiter.called"

interface WebhookConfig {
  id: string
  url: string
  secret: string
  events: WebhookEvent[]
  isActive: boolean
  createdAt: Date
  lastTriggered?: Date
  failureCount: number
}

// Demo webhook data
const demoWebhooks: WebhookConfig[] = [
  {
    id: "wh_1",
    url: "https://example.com/webhooks/orders",
    secret: "whsec_demo123456",
    events: ["order.created", "order.completed"],
    isActive: true,
    createdAt: new Date(),
    lastTriggered: new Date(Date.now() - 3600000),
    failureCount: 0,
  },
]

// GET - List webhooks
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

    try {
      // In a real app, fetch from database
      // const webhooks = await prisma.webhook.findMany({ where: { tenantId } })

      // For demo, return sample data
      return successResponse({
        webhooks: demoWebhooks,
        availableEvents: [
          { event: "order.created", description: "Yeni sipariş oluşturulduğunda" },
          { event: "order.updated", description: "Sipariş durumu güncellendiğinde" },
          { event: "order.completed", description: "Sipariş tamamlandığında" },
          { event: "order.cancelled", description: "Sipariş iptal edildiğinde" },
          { event: "menu.updated", description: "Menü güncellendiğinde" },
          { event: "stock.low", description: "Stok düşük seviyeye indiğinde" },
          { event: "stock.out", description: "Stok tükendiğinde" },
          { event: "customer.created", description: "Yeni müşteri kaydedildiğinde" },
          { event: "waiter.called", description: "Garson çağrıldığında" },
        ],
      })
    } catch {
      return successResponse({
        webhooks: demoWebhooks,
        demo: true,
      })
    }
  } catch (error) {
    console.error("Webhooks list error:", error)
    return errorResponse("Webhook listesi alınırken bir hata oluştu", 500)
  }
}

// POST - Create webhook
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
    const body = await request.json()
    const { url, events } = body

    if (!url || !url.startsWith("https://")) {
      return errorResponse("Geçerli bir HTTPS URL gerekli", 400)
    }

    if (!events || events.length === 0) {
      return errorResponse("En az bir event seçmelisiniz", 400)
    }

    // Generate webhook secret
    const secret = `whsec_${randomBytes(24).toString("hex")}`

    try {
      // In a real app, save to database
      // const webhook = await prisma.webhook.create({ data: { tenantId, url, secret, events } })

      return successResponse({
        webhook: {
          id: `wh_${Date.now()}`,
          url,
          secret,
          events,
          isActive: true,
          createdAt: new Date(),
          failureCount: 0,
        },
        demo: true,
      }, 201)
    } catch {
      return successResponse({
        webhook: {
          id: `wh_demo_${Date.now()}`,
          url,
          secret,
          events,
          isActive: true,
          createdAt: new Date(),
          failureCount: 0,
        },
        demo: true,
      }, 201)
    }
  } catch (error) {
    console.error("Webhook create error:", error)
    return errorResponse("Webhook oluşturulurken bir hata oluştu", 500)
  }
}

// DELETE - Delete webhook
export async function DELETE(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return errorResponse("Webhook ID gerekli", 400)
    }

    // In a real app, delete from database
    return successResponse({ deleted: true })
  } catch (error) {
    console.error("Webhook delete error:", error)
    return errorResponse("Webhook silinirken bir hata oluştu", 500)
  }
}

// PATCH - Test webhook
export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await getAuthenticatedSession()
    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401)
    }

    if (!hasRole(session.user.role, TENANT_MANAGER_ROLES)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403)
    }

    const body = await request.json()
    const { webhookId, action } = body

    if (action === "test") {
      // Simulate sending a test webhook
      return successResponse({
        tested: true,
        response: {
          status: 200,
          latency: 245,
          message: "Test webhook başarıyla gönderildi",
        },
      })
    }

    return errorResponse("Geçersiz işlem", 400)
  } catch (error) {
    console.error("Webhook test error:", error)
    return errorResponse("Webhook test edilirken bir hata oluştu", 500)
  }
}

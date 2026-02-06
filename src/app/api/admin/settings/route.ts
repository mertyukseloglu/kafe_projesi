import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Demo platform settings
const demoSettings = {
  general: {
    platformName: "RestoAI",
    supportEmail: "destek@restoai.com",
    defaultLanguage: "tr",
    defaultCurrency: "TRY",
    maintenanceMode: false,
  },
  ai: {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    maxTokens: 1024,
    temperature: 0.7,
    systemPrompt: "Sen bir restoran asistanısın. Müşterilere menü hakkında bilgi ver ve sipariş almalarına yardımcı ol.",
    enabled: true,
  },
  email: {
    provider: "smtp",
    host: "smtp.example.com",
    port: 587,
    secure: true,
    from: "noreply@restoai.com",
    configured: false,
  },
  payments: {
    method: "at_table",
    description: "Müşteriler siparişlerini uygulama üzerinden verir, ödeme masada yapılır",
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: false,
    smsEnabled: false,
  },
  security: {
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    requireEmailVerification: false,
    twoFactorEnabled: false,
  },
  limits: {
    maxTablesStarter: 5,
    maxTablesGrowth: 20,
    maxTablesPro: -1, // unlimited
    maxMenuItemsStarter: 50,
    maxMenuItemsGrowth: 200,
    maxMenuItemsPro: -1, // unlimited
    maxStaffStarter: 2,
    maxStaffGrowth: 10,
    maxStaffPro: -1, // unlimited
  },
}

// GET - Get platform settings
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
    const section = searchParams.get("section")

    // Return specific section or all settings
    if (section && section in demoSettings) {
      return NextResponse.json({
        success: true,
        data: demoSettings[section as keyof typeof demoSettings],
      })
    }

    return NextResponse.json({
      success: true,
      data: demoSettings,
    })
  } catch (error) {
    console.error("Admin settings error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

// PATCH - Update platform settings
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
    const { section, settings } = body

    if (!section || !settings) {
      return NextResponse.json(
        { success: false, error: "Section ve settings gerekli" },
        { status: 400 }
      )
    }

    // Validate section
    if (!(section in demoSettings)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz settings section" },
        { status: 400 }
      )
    }

    // In a real app, we would save to database
    // For demo, just return the updated settings
    const updatedSection = {
      ...demoSettings[section as keyof typeof demoSettings],
      ...settings,
    }

    return NextResponse.json({
      success: true,
      data: updatedSection,
      message: "Ayarlar güncellendi",
    })
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

// POST - Test service connections
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
    const { service } = body

    // Simulate service tests
    const testResults: Record<string, { success: boolean; message: string; latency?: number }> = {
      database: {
        success: true,
        message: "Veritabanı bağlantısı başarılı",
        latency: 12,
      },
      ai: {
        success: process.env.ANTHROPIC_API_KEY ? true : false,
        message: process.env.ANTHROPIC_API_KEY
          ? "Claude API bağlantısı başarılı"
          : "ANTHROPIC_API_KEY tanımlı değil",
        latency: 320,
      },
      email: {
        success: false,
        message: "Email yapılandırması eksik",
      },
      payments: {
        success: false,
        message: "Ödeme gateway yapılandırması eksik",
      },
    }

    if (service && service in testResults) {
      return NextResponse.json({
        success: true,
        data: testResults[service],
      })
    }

    return NextResponse.json({
      success: true,
      data: testResults,
    })
  } catch (error) {
    console.error("Test service error:", error)
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

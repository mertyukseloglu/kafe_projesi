// iyzico Payment Integration
// Sandbox/Demo mode destekli

export interface PaymentRequest {
  orderId: string
  orderNumber: string
  amount: number
  currency?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }>
  callbackUrl: string
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  status?: "PENDING" | "SUCCESS" | "FAILED"
  checkoutUrl?: string
  error?: string
}

export interface PaymentCallback {
  paymentId: string
  orderId: string
  status: "SUCCESS" | "FAILED"
  token?: string
  errorCode?: string
  errorMessage?: string
}

// iyzico config
const IYZICO_CONFIG = {
  apiKey: process.env.IYZICO_API_KEY || "sandbox-api-key",
  secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-secret-key",
  baseUrl: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
}

// Check if we're in demo mode
function isDemoMode(): boolean {
  return !process.env.IYZICO_API_KEY || process.env.IYZICO_API_KEY === "sandbox-api-key"
}

// Demo payment - simüle edilmiş ödeme
async function processDemoPayment(request: PaymentRequest): Promise<PaymentResult> {
  console.log("💳 Demo ödeme işleniyor:", {
    orderId: request.orderId,
    amount: request.amount,
    customer: request.customerName,
  })

  // Simüle edilmiş işlem gecikmesi
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Demo checkout URL
  const demoPaymentId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    success: true,
    paymentId: demoPaymentId,
    status: "PENDING",
    checkoutUrl: `${request.callbackUrl}?paymentId=${demoPaymentId}&demo=true`,
  }
}

// Initialize payment
export async function initializePayment(request: PaymentRequest): Promise<PaymentResult> {
  // Demo mode check
  if (isDemoMode()) {
    return processDemoPayment(request)
  }

  try {
    // iyzico Checkout Form initialization
    const conversationId = `conv_${request.orderId}`
    const basketId = request.orderId

    const requestBody = {
      locale: "tr",
      conversationId,
      price: request.amount.toFixed(2),
      paidPrice: request.amount.toFixed(2),
      currency: request.currency || "TRY",
      basketId,
      paymentGroup: "PRODUCT",
      callbackUrl: request.callbackUrl,
      enabledInstallments: [1, 2, 3, 6],
      buyer: {
        id: `buyer_${Date.now()}`,
        name: request.customerName.split(" ")[0] || "Müşteri",
        surname: request.customerName.split(" ").slice(1).join(" ") || ".",
        gsmNumber: request.customerPhone,
        email: request.customerEmail,
        identityNumber: "11111111111", // TC Kimlik (zorunlu alan)
        registrationAddress: "Türkiye",
        ip: "85.34.78.112",
        city: "Istanbul",
        country: "Turkey",
      },
      shippingAddress: {
        contactName: request.customerName,
        city: "Istanbul",
        country: "Turkey",
        address: "Türkiye",
      },
      billingAddress: {
        contactName: request.customerName,
        city: "Istanbul",
        country: "Turkey",
        address: "Türkiye",
      },
      basketItems: request.items.map((item, index) => ({
        id: item.id || `item_${index}`,
        name: item.name,
        category1: item.category || "Yiyecek/İçecek",
        itemType: "PHYSICAL",
        price: (item.price * item.quantity).toFixed(2),
      })),
    }

    // API call to iyzico
    const response = await fetch(`${IYZICO_CONFIG.baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: generateAuthorizationHeader(requestBody),
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (data.status === "success") {
      return {
        success: true,
        paymentId: data.token,
        status: "PENDING",
        checkoutUrl: data.paymentPageUrl,
      }
    } else {
      return {
        success: false,
        error: data.errorMessage || "Ödeme başlatılamadı",
      }
    }
  } catch (error) {
    console.error("iyzico payment error:", error)
    return {
      success: false,
      error: "Ödeme sistemi geçici olarak kullanılamıyor",
    }
  }
}

// Verify payment callback
export async function verifyPayment(token: string): Promise<PaymentCallback> {
  // Demo mode check
  if (isDemoMode() || token.startsWith("demo_")) {
    return {
      paymentId: token,
      orderId: token.split("_")[1] || "unknown",
      status: "SUCCESS",
    }
  }

  try {
    const requestBody = {
      locale: "tr",
      conversationId: `verify_${Date.now()}`,
      token,
    }

    const response = await fetch(`${IYZICO_CONFIG.baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: generateAuthorizationHeader(requestBody),
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (data.status === "success" && data.paymentStatus === "SUCCESS") {
      return {
        paymentId: data.paymentId,
        orderId: data.basketId,
        status: "SUCCESS",
        token,
      }
    } else {
      return {
        paymentId: data.paymentId || token,
        orderId: data.basketId || "unknown",
        status: "FAILED",
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
      }
    }
  } catch (error) {
    console.error("iyzico verify error:", error)
    return {
      paymentId: token,
      orderId: "unknown",
      status: "FAILED",
      errorMessage: "Ödeme doğrulanamadı",
    }
  }
}

// Generate iyzico authorization header (simplified)
function generateAuthorizationHeader(requestBody: unknown): string {
  // In production, this should use proper HMAC-SHA256 signing
  // For demo purposes, we're using a simplified version
  const apiKey = IYZICO_CONFIG.apiKey
  const randomString = Math.random().toString(36).slice(2, 10)

  // Base64 encode for demo
  const payload = Buffer.from(JSON.stringify({ apiKey, randomString, body: requestBody })).toString("base64")

  return `IYZWS ${apiKey}:${payload.slice(0, 32)}`
}

// Refund payment
export async function refundPayment(
  paymentId: string,
  amount: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  if (isDemoMode() || paymentId.startsWith("demo_")) {
    console.log("💳 Demo iade işleniyor:", { paymentId, amount })
    return {
      success: true,
      refundId: `refund_${Date.now()}`,
    }
  }

  try {
    const requestBody = {
      locale: "tr",
      conversationId: `refund_${Date.now()}`,
      paymentTransactionId: paymentId,
      price: amount.toFixed(2),
      currency: "TRY",
    }

    const response = await fetch(`${IYZICO_CONFIG.baseUrl}/payment/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: generateAuthorizationHeader(requestBody),
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (data.status === "success") {
      return {
        success: true,
        refundId: data.paymentId,
      }
    } else {
      return {
        success: false,
        error: data.errorMessage || "İade işlemi başarısız",
      }
    }
  } catch (error) {
    console.error("iyzico refund error:", error)
    return {
      success: false,
      error: "İade sistemi geçici olarak kullanılamıyor",
    }
  }
}

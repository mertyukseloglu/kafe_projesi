// Email Service
// Production'da Resend, SendGrid veya Nodemailer ile değiştirilecek

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface OrderNotificationData {
  orderNumber: string
  restaurantName: string
  tableNumber?: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  customerName?: string
  customerEmail?: string
}

export interface WelcomeEmailData {
  name: string
  email: string
  restaurantName?: string
  loginUrl: string
}

// Email gönderme fonksiyonu (demo mode)
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
  // Production'da gerçek email provider kullanılacak
  console.log("📧 Email gönderiliyor (demo):", {
    to: options.to,
    subject: options.subject,
  })

  // Demo mode - her zaman başarılı
  return {
    success: true,
    messageId: `demo_${Date.now()}`,
  }
}

// Yeni sipariş bildirimi
export async function sendOrderNotification(
  to: string,
  data: OrderNotificationData
): Promise<{ success: boolean }> {
  const itemsList = data.items
    .map((item) => `• ${item.name} x${item.quantity} - ₺${item.price * item.quantity}`)
    .join("\n")

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 20px; border: 1px solid #eee; }
          .order-details { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .total { font-size: 24px; font-weight: bold; color: #f97316; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Yeni Sipariş!</h1>
          </div>
          <div class="content">
            <h2>Sipariş #${data.orderNumber}</h2>
            <p><strong>Restoran:</strong> ${data.restaurantName}</p>
            ${data.tableNumber ? `<p><strong>Masa:</strong> ${data.tableNumber}</p>` : ""}
            ${data.customerName ? `<p><strong>Müşteri:</strong> ${data.customerName}</p>` : ""}

            <div class="order-details">
              <h3>Sipariş Detayları</h3>
              <pre>${itemsList}</pre>
            </div>

            <p class="total">Toplam: ₺${data.total}</p>
          </div>
          <div class="footer">
            <p>Bu email ${data.restaurantName} sipariş sistemi tarafından gönderilmiştir.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Yeni Sipariş #${data.orderNumber} - ${data.restaurantName}`,
    html,
    text: `Yeni Sipariş #${data.orderNumber}\n\n${itemsList}\n\nToplam: ₺${data.total}`,
  })
}

// Hoş geldin emaili
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 20px; border: 1px solid #eee; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Hoş Geldiniz!</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${data.name},</h2>
            <p>RestoAI platformuna hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
            ${data.restaurantName ? `<p>Restoranınız <strong>${data.restaurantName}</strong> için dijital menü ve sipariş sistemi hazır.</p>` : ""}

            <p>Hemen panele giriş yaparak:</p>
            <ul>
              <li>Menünüzü düzenleyebilir</li>
              <li>Masalarınız için QR kodlar oluşturabilir</li>
              <li>Siparişleri takip edebilirsiniz</li>
            </ul>

            <a href="${data.loginUrl}" class="button">Panele Git →</a>
          </div>
          <div class="footer">
            <p>Sorularınız için: destek@restoai.com</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: data.email,
    subject: "RestoAI'ye Hoş Geldiniz! 🎉",
    html,
    text: `Merhaba ${data.name},\n\nRestoAI platformuna hoş geldiniz!\n\nGiriş yapmak için: ${data.loginUrl}`,
  })
}

// Sipariş durumu güncelleme emaili
export async function sendOrderStatusEmail(
  to: string,
  data: {
    orderNumber: string
    restaurantName: string
    status: string
    statusLabel: string
  }
): Promise<{ success: boolean }> {
  const statusEmojis: Record<string, string> = {
    CONFIRMED: "✅",
    PREPARING: "👨‍🍳",
    READY: "🔔",
    DELIVERED: "🎉",
    CANCELLED: "❌",
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .status { font-size: 48px; margin: 20px 0; }
          .message { font-size: 18px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="status">${statusEmojis[data.status] || "📦"}</div>
          <h2>Sipariş #${data.orderNumber}</h2>
          <p class="message">Siparişiniz: <strong>${data.statusLabel}</strong></p>
          <p>${data.restaurantName}</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Sipariş Güncellendi: ${data.statusLabel} - #${data.orderNumber}`,
    html,
  })
}

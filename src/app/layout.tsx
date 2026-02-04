import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Restaurant Platform - Dijital Menü ve Sipariş Yönetimi",
  description: "QR menü, AI destekli sipariş asistanı ve güçlü yönetim paneli ile restoranınızı dijitalleştirin.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  )
}

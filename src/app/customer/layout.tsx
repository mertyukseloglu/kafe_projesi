import { ReactNode } from "react"

// Customer Layout - Müşteri arayüzü (QR ile açılan menü)
// Mobil-first tasarım, sidebar yok

interface CustomerLayoutProps {
  children: ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobil-first, tam ekran içerik */}
      <main className="mx-auto max-w-lg">{children}</main>
    </div>
  )
}

import { ReactNode } from "react"

// Super Admin Layout - Platform yönetici paneli
// TODO: Auth kontrolü eklenecek (sadece SUPER_ADMIN erişebilir)

interface SuperAdminLayoutProps {
  children: ReactNode
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - sol taraf */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-semibold">Platform Yönetimi</span>
        </div>
        <nav className="space-y-1 p-4">
          <NavItem href="/dashboard" icon="LayoutDashboard">Dashboard</NavItem>
          <NavItem href="/restaurants" icon="Store">Restoranlar</NavItem>
          <NavItem href="/subscriptions" icon="CreditCard">Abonelikler</NavItem>
          <NavItem href="/payments" icon="Receipt">Ödemeler</NavItem>
          <NavItem href="/settings" icon="Settings">Ayarlar</NavItem>
        </nav>
      </aside>

      {/* Ana içerik */}
      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6">
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Super Admin</span>
          </div>
        </header>

        {/* Sayfa içeriği */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

// Geçici NavItem component'i - daha sonra ayrı dosyaya taşınacak
function NavItem({
  href,
  icon,
  children,
}: {
  href: string
  icon: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <span className="text-lg">{icon === "LayoutDashboard" ? "📊" : icon === "Store" ? "🏪" : icon === "CreditCard" ? "💳" : icon === "Receipt" ? "🧾" : "⚙️"}</span>
      {children}
    </a>
  )
}

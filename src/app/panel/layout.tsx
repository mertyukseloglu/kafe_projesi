import { ReactNode } from "react"

// Tenant Layout - Restoran yönetim paneli
// TODO: Auth kontrolü eklenecek (TENANT_ADMIN, MANAGER, STAFF)
// TODO: Tenant bilgisi session'dan alınacak

interface TenantLayoutProps {
  children: ReactNode
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - sol taraf */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          {/* TODO: Restoran logosu ve adı gelecek */}
          <span className="text-lg font-semibold">Restoran Paneli</span>
        </div>
        <nav className="space-y-1 p-4">
          <NavItem href="/dashboard" icon="home">Dashboard</NavItem>
          <NavItem href="/orders" icon="clipboard">Siparişler</NavItem>
          <NavItem href="/menu" icon="utensils">Menü</NavItem>
          <NavItem href="/tables" icon="grid">Masalar</NavItem>
          <NavItem href="/customers" icon="users">Müşteriler</NavItem>
          <NavItem href="/reports" icon="chart">Raporlar</NavItem>
          <NavItem href="/settings" icon="settings">Ayarlar</NavItem>
        </nav>
      </aside>

      {/* Ana içerik */}
      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6">
          <div className="ml-auto flex items-center gap-4">
            {/* TODO: Bildirimler, profil menüsü */}
            <span className="text-sm text-muted-foreground">Restoran Sahibi</span>
          </div>
        </header>

        {/* Sayfa içeriği */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

// Geçici NavItem component'i
function NavItem({
  href,
  icon,
  children,
}: {
  href: string
  icon: string
  children: ReactNode
}) {
  const icons: Record<string, string> = {
    home: "🏠",
    clipboard: "📋",
    utensils: "🍽️",
    grid: "📱",
    users: "👥",
    chart: "📈",
    settings: "⚙️",
  }

  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <span className="text-lg">{icons[icon] || "📁"}</span>
      {children}
    </a>
  )
}

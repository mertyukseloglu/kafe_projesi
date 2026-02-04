"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Grid3X3,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Tenant Layout - Restoran yönetim paneli
// TODO: Auth kontrolü eklenecek (TENANT_ADMIN, MANAGER, STAFF)

interface TenantLayoutProps {
  children: ReactNode
}

const navItems = [
  { href: "/panel/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/panel/orders", icon: ClipboardList, label: "Siparişler", badge: true },
  { href: "/panel/menu", icon: UtensilsCrossed, label: "Menü" },
  { href: "/panel/tables", icon: Grid3X3, label: "Masalar" },
  { href: "/panel/customers", icon: Users, label: "Müşteriler" },
  { href: "/panel/reports", icon: BarChart3, label: "Raporlar" },
  { href: "/panel/settings", icon: Settings, label: "Ayarlar" },
]

export default function TenantLayout({ children }: TenantLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeOrders] = useState(3) // Demo: aktif sipariş sayısı

  // Demo restoran bilgisi (gerçekte session'dan gelecek)
  const restaurant = {
    name: "Demo Kafe",
    slug: "demo-kafe",
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 transform border-r bg-card transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/panel/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {restaurant.name.charAt(0)}
            </div>
            <span className="font-semibold">{restaurant.name}</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && activeOrders > 0 && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                    isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                  }`}>
                    {activeOrders}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-3">
          <Link
            href={`/customer/menu/${restaurant.slug}?table=1`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Menüyü Görüntüle</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb / Title area */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold lg:hidden">{restaurant.name}</h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {activeOrders > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {activeOrders}
                </span>
              )}
            </Button>

            {/* User menu */}
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                RS
              </div>
              <span className="hidden text-sm md:block">Restoran Sahibi</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

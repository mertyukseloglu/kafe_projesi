import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Home,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Grid3X3,
  Users,
  BarChart3,
  Settings,
  Building2,
  CreditCard,
  Receipt,
  Cog,
  QrCode,
  ExternalLink,
} from "lucide-react"

const sections = [
  {
    title: "Genel Sayfalar",
    description: "Ana sayfa ve kimlik doğrulama",
    links: [
      { href: "/", label: "Ana Sayfa (Landing)", icon: Home, description: "Platform tanıtım sayfası" },
      { href: "/login", label: "Giriş Yap", icon: LogIn, description: "Kullanıcı girişi" },
      { href: "/register", label: "Kayıt Ol", icon: UserPlus, description: "Yeni hesap oluştur" },
    ],
  },
  {
    title: "Restoran Paneli (/panel)",
    description: "Restoran yönetimi için tüm sayfalar",
    links: [
      { href: "/panel/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Günlük özet, canlı siparişler" },
      { href: "/panel/orders", label: "Siparişler", icon: ShoppingCart, description: "Sipariş yönetimi ve takibi" },
      { href: "/panel/menu", label: "Menü", icon: UtensilsCrossed, description: "Ürün ve kategori yönetimi" },
      { href: "/panel/tables", label: "Masalar", icon: Grid3X3, description: "Masa ve QR kod yönetimi" },
      { href: "/panel/customers", label: "Müşteriler", icon: Users, description: "Müşteri listesi ve sadakat puanları" },
      { href: "/panel/reports", label: "Raporlar", icon: BarChart3, description: "Satış ve performans raporları" },
      { href: "/panel/settings", label: "Ayarlar", icon: Settings, description: "Restoran ayarları, personel, AI" },
    ],
  },
  {
    title: "Super Admin Paneli (/admin)",
    description: "Platform yönetimi (sadece SUPER_ADMIN)",
    links: [
      { href: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard, description: "Platform genel bakış" },
      { href: "/admin/restaurants", label: "Restoranlar", icon: Building2, description: "Tüm restoranları yönet" },
      { href: "/admin/subscriptions", label: "Abonelikler", icon: CreditCard, description: "Abonelik planları" },
      { href: "/admin/payments", label: "Ödemeler", icon: Receipt, description: "Ödeme geçmişi" },
      { href: "/admin/settings", label: "Platform Ayarları", icon: Cog, description: "Genel platform ayarları" },
    ],
  },
  {
    title: "Müşteri Arayüzü (/customer)",
    description: "QR menü ve sipariş verme",
    links: [
      { href: "/customer/menu/demo-kafe?table=1", label: "Demo Kafe Menüsü", icon: QrCode, description: "Masa 1 - AI chatbot ile sipariş" },
      { href: "/customer/menu/demo-kafe?table=3", label: "Demo Kafe - Masa 3", icon: QrCode, description: "Farklı masa örneği" },
      { href: "/customer/menu/demo-kafe?table=5", label: "Demo Kafe - Masa 5", icon: QrCode, description: "Farklı masa örneği" },
    ],
  },
]

const apiEndpoints = [
  { method: "GET/POST", path: "/api/auth/[...nextauth]", description: "NextAuth.js authentication" },
  { method: "POST", path: "/api/auth/register", description: "Yeni kullanıcı kaydı" },
  { method: "GET", path: "/api/public/menu/[slug]", description: "Public menü verisi" },
  { method: "POST", path: "/api/public/orders", description: "Sipariş oluşturma" },
  { method: "POST", path: "/api/public/chat", description: "AI chatbot" },
  { method: "POST", path: "/api/public/waiter-call", description: "Garson çağırma" },
  { method: "GET", path: "/api/tenant/dashboard", description: "Dashboard verileri" },
  { method: "GET/PATCH", path: "/api/tenant/orders", description: "Sipariş listesi ve güncelleme" },
  { method: "CRUD", path: "/api/tenant/menu", description: "Menü öğeleri CRUD" },
  { method: "CRUD", path: "/api/tenant/categories", description: "Kategoriler CRUD" },
  { method: "CRUD", path: "/api/tenant/tables", description: "Masalar CRUD" },
  { method: "CRUD", path: "/api/tenant/customers", description: "Müşteriler CRUD" },
  { method: "GET/PATCH/POST/DELETE", path: "/api/tenant/settings", description: "Ayarlar ve personel" },
]

const testCredentials = [
  { role: "SUPER_ADMIN", email: "admin@restoai.com", password: "admin123", description: "Platform yöneticisi - tüm erişim" },
  { role: "TENANT_ADMIN", email: "demo@kafe.com", password: "demo123", description: "Restoran sahibi - kendi restoranı" },
  { role: "MANAGER", email: "manager@demo.com", password: "manager123", description: "Restoran müdürü" },
  { role: "STAFF", email: "staff@demo.com", password: "staff123", description: "Garson/Personel" },
]

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              R
            </div>
            <span className="text-xl font-bold">RestoAI - Test Sitemap</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Ana Sayfa</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Uygulama Sitemap</h1>
          <p className="mt-2 text-muted-foreground">
            Test için tüm sayfalar ve API endpoint&apos;leri
          </p>
        </div>

        {/* Test Credentials */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Test Kullanıcıları</CardTitle>
            <CardDescription className="text-blue-700">
              Farklı rolleri test etmek için bu hesapları kullanın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {testCredentials.map((cred) => (
                <div key={cred.email} className="rounded-lg border border-blue-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      cred.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" :
                      cred.role === "TENANT_ADMIN" ? "bg-green-100 text-green-700" :
                      cred.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {cred.role}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-sm">{cred.email}</p>
                  <p className="font-mono text-sm text-muted-foreground">Şifre: {cred.password}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{cred.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Page Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <link.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{link.label}</p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{link.href}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Backend API uç noktaları (authentication gerektirir)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Method</th>
                      <th className="py-2 text-left font-medium">Endpoint</th>
                      <th className="py-2 text-left font-medium">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiEndpoints.map((api) => (
                      <tr key={api.path} className="border-b last:border-0">
                        <td className="py-2">
                          <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                            {api.method}
                          </span>
                        </td>
                        <td className="py-2 font-mono text-xs">{api.path}</td>
                        <td className="py-2 text-muted-foreground">{api.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Hızlı Başlangıç</CardTitle>
              <CardDescription className="text-green-700">
                Test için önerilen akış
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-inside list-decimal space-y-2 text-green-800">
                <li>
                  <strong>Müşteri deneyimini test edin:</strong>{" "}
                  <Link href="/customer/menu/demo-kafe?table=1" className="text-green-600 underline">
                    Demo Kafe Menüsü
                  </Link>
                  {" "}- AI chatbot ile sipariş verin
                </li>
                <li>
                  <strong>Restoran panelini test edin:</strong>{" "}
                  <Link href="/login" className="text-green-600 underline">
                    Giriş yapın
                  </Link>
                  {" "}- demo@kafe.com / demo123
                </li>
                <li>
                  <strong>Siparişleri yönetin:</strong>{" "}
                  <Link href="/panel/orders" className="text-green-600 underline">
                    Sipariş Paneli
                  </Link>
                </li>
                <li>
                  <strong>Menüyü düzenleyin:</strong>{" "}
                  <Link href="/panel/menu" className="text-green-600 underline">
                    Menü Yönetimi
                  </Link>
                </li>
                <li>
                  <strong>Raporları inceleyin:</strong>{" "}
                  <Link href="/panel/reports" className="text-green-600 underline">
                    Raporlar
                  </Link>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Teknoloji Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 16",
                "TypeScript",
                "Tailwind CSS",
                "shadcn/ui",
                "Prisma ORM",
                "PostgreSQL",
                "NextAuth.js v5",
                "Claude AI (Anthropic)",
                "Zod Validation",
              ].map((tech) => (
                <span key={tech} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        RestoAI - AI Restaurant Platform
      </footer>
    </div>
  )
}

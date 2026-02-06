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
  Zap,
  Bell,
  Package,
  FileText,
  Megaphone,
  Import,
  Heart,
  ClipboardList,
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
      { href: "/panel/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Günlük özet ve istatistikler" },
      { href: "/panel/live-orders", label: "Canlı Siparişler", icon: Zap, description: "Gerçek zamanlı sipariş takibi" },
      { href: "/panel/orders", label: "Siparişler", icon: ShoppingCart, description: "Sipariş yönetimi ve geçmiş" },
      { href: "/panel/menu", label: "Menü", icon: UtensilsCrossed, description: "Ürün ve kategori yönetimi" },
      { href: "/panel/tables", label: "Masalar", icon: Grid3X3, description: "Masa ve QR kod yönetimi" },
      { href: "/panel/customers", label: "Müşteriler", icon: Users, description: "Müşteri listesi ve sadakat puanları" },
      { href: "/panel/waiter-calls", label: "Garson Çağrıları", icon: Bell, description: "Masa çağrılarını yönet" },
      { href: "/panel/campaigns", label: "Kampanyalar", icon: Megaphone, description: "İndirim ve promosyonlar" },
      { href: "/panel/stock", label: "Stok Yönetimi", icon: Package, description: "Ürün stok takibi" },
      { href: "/panel/reports", label: "Raporlar", icon: BarChart3, description: "Satış ve performans raporları" },
      { href: "/panel/analytics", label: "Analitik", icon: BarChart3, description: "Detaylı analiz dashboard" },
      { href: "/panel/import", label: "Veri İçe Aktar", icon: Import, description: "Menü ve veri import" },
      { href: "/panel/api-docs", label: "API Dökümantasyonu", icon: FileText, description: "API kullanım rehberi" },
      { href: "/panel/settings", label: "Ayarlar", icon: Settings, description: "Restoran ayarları ve personel" },
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
    description: "QR menü, sipariş ve sadakat programı",
    links: [
      { href: "/customer/menu/demo-kafe?table=1", label: "Demo Kafe - Masa 1", icon: QrCode, description: "AI chatbot ile sipariş" },
      { href: "/customer/menu/demo-kafe?table=3", label: "Demo Kafe - Masa 3", icon: QrCode, description: "Farklı masa örneği" },
      { href: "/customer/menu/demo-kafe?table=5", label: "Demo Kafe - Masa 5", icon: QrCode, description: "Bahçe masası örneği" },
      { href: "/customer/order/demo-order-123", label: "Sipariş Takip (Demo)", icon: ClipboardList, description: "Sipariş durumu sayfası" },
      { href: "/customer/loyalty/demo-kafe", label: "Sadakat Programı", icon: Heart, description: "Puan ve ödüller" },
    ],
  },
]

const apiEndpoints = [
  // Auth
  { method: "GET/POST", path: "/api/auth/[...nextauth]", description: "NextAuth.js authentication", category: "Auth" },
  { method: "POST", path: "/api/auth/register", description: "Yeni kullanıcı kaydı", category: "Auth" },

  // Public
  { method: "GET", path: "/api/public/menu/[slug]", description: "Public menü verisi", category: "Public" },
  { method: "POST", path: "/api/public/orders", description: "Sipariş oluşturma", category: "Public" },
  { method: "POST", path: "/api/public/chat", description: "AI chatbot", category: "Public" },
  { method: "POST", path: "/api/public/waiter-call", description: "Garson çağırma", category: "Public" },
  { method: "GET/POST", path: "/api/public/loyalty", description: "Sadakat programı", category: "Public" },
  { method: "POST", path: "/api/public/coupon/validate", description: "Kupon doğrulama", category: "Public" },

  // Tenant
  { method: "GET", path: "/api/tenant/dashboard", description: "Dashboard verileri", category: "Tenant" },
  { method: "GET/PATCH", path: "/api/tenant/orders", description: "Sipariş listesi ve güncelleme", category: "Tenant" },
  { method: "CRUD", path: "/api/tenant/menu", description: "Menü öğeleri", category: "Tenant" },
  { method: "CRUD", path: "/api/tenant/categories", description: "Kategoriler", category: "Tenant" },
  { method: "CRUD", path: "/api/tenant/tables", description: "Masalar", category: "Tenant" },
  { method: "CRUD", path: "/api/tenant/customers", description: "Müşteriler", category: "Tenant" },
  { method: "CRUD", path: "/api/tenant/campaigns", description: "Kampanyalar", category: "Tenant" },
  { method: "CRUD", path: "/api/tenant/coupons", description: "Kuponlar", category: "Tenant" },
  { method: "CRUD", path: "/api/tenant/stock", description: "Stok yönetimi", category: "Tenant" },
  { method: "GET", path: "/api/tenant/reports", description: "Raporlar", category: "Tenant" },
  { method: "GET", path: "/api/tenant/reports/export", description: "Rapor dışa aktarma", category: "Tenant" },
  { method: "GET/PATCH", path: "/api/tenant/loyalty", description: "Sadakat programı", category: "Tenant" },
  { method: "GET/PATCH", path: "/api/tenant/waiter-calls", description: "Garson çağrıları", category: "Tenant" },
  { method: "POST", path: "/api/tenant/webhooks", description: "Webhook yönetimi", category: "Tenant" },
  { method: "GET/PATCH/POST/DELETE", path: "/api/tenant/settings", description: "Ayarlar ve personel", category: "Tenant" },
  { method: "POST", path: "/api/tenant/import/menu", description: "Menü içe aktarma", category: "Tenant" },
  { method: "POST", path: "/api/tenant/import/photos", description: "Fotoğraf içe aktarma", category: "Tenant" },
  { method: "POST", path: "/api/tenant/import/google-sheets", description: "Google Sheets import", category: "Tenant" },
  { method: "GET", path: "/api/tenant/import/templates", description: "İmport şablonları", category: "Tenant" },

  // Admin
  { method: "GET", path: "/api/admin/dashboard", description: "Admin dashboard", category: "Admin" },
  { method: "GET/POST/PATCH", path: "/api/admin/restaurants", description: "Restoran yönetimi", category: "Admin" },
  { method: "GET/POST/PATCH", path: "/api/admin/subscriptions", description: "Abonelik yönetimi", category: "Admin" },
  { method: "GET", path: "/api/admin/payments", description: "Ödeme kayıtları", category: "Admin" },
  { method: "GET/PATCH", path: "/api/admin/settings", description: "Platform ayarları", category: "Admin" },
]

const testCredentials = [
  { role: "SUPER_ADMIN", email: "admin@restoai.com", password: "admin123", description: "Platform yöneticisi - tüm erişim" },
  { role: "TENANT_ADMIN", email: "demo@demo-kafe.com", password: "demo123", description: "Restoran sahibi - kendi restoranı" },
  { role: "STAFF", email: "staff@demo-kafe.com", password: "staff123", description: "Garson/Personel - sınırlı erişim" },
]

export default function SitemapPage() {
  const groupedApi = apiEndpoints.reduce((acc, api) => {
    if (!acc[api.category]) acc[api.category] = []
    acc[api.category].push(api)
    return acc
  }, {} as Record<string, typeof apiEndpoints>)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              R
            </div>
            <span className="text-xl font-bold">RestoAI - Sitemap</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Ana Sayfa</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/login">Giriş Yap</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Uygulama Sitemap</h1>
          <p className="mt-2 text-muted-foreground">
            Tüm sayfalar ve API endpoint&apos;leri - toplam {sections.reduce((a, s) => a + s.links.length, 0)} sayfa, {apiEndpoints.length} API
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
            <div className="grid gap-4 md:grid-cols-3">
              {testCredentials.map((cred) => (
                <div key={cred.email} className="rounded-lg border border-blue-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      cred.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" :
                      cred.role === "TENANT_ADMIN" ? "bg-green-100 text-green-700" :
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
                <CardDescription>{section.description} ({section.links.length} sayfa)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <link.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-sm">{link.label}</p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{link.href}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{link.description}</p>
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
              <CardTitle>API Endpoints ({apiEndpoints.length})</CardTitle>
              <CardDescription>Backend API uç noktaları (authentication gerektirir)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedApi).map(([category, apis]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm mb-2 text-muted-foreground">{category} ({apis.length})</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <tbody>
                          {apis.map((api) => (
                            <tr key={api.path} className="border-b last:border-0">
                              <td className="py-2 pr-4">
                                <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                                  {api.method}
                                </span>
                              </td>
                              <td className="py-2 pr-4 font-mono text-xs">{api.path}</td>
                              <td className="py-2 text-muted-foreground text-xs">{api.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Hızlı Test Akışı</CardTitle>
              <CardDescription className="text-green-700">
                Uygulamayı test etmek için önerilen adımlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-inside list-decimal space-y-3 text-green-800">
                <li>
                  <strong>Müşteri deneyimini test edin:</strong>{" "}
                  <Link href="/customer/menu/demo-kafe?table=1" className="text-green-600 underline">
                    Demo Kafe Menüsü
                  </Link>
                  {" "}- QR menüden sipariş verin, AI asistanı deneyin
                </li>
                <li>
                  <strong>Restoran paneline giriş yapın:</strong>{" "}
                  <Link href="/login" className="text-green-600 underline">
                    Giriş
                  </Link>
                  {" "}- demo@demo-kafe.com / demo123
                </li>
                <li>
                  <strong>Canlı siparişleri takip edin:</strong>{" "}
                  <Link href="/panel/live-orders" className="text-green-600 underline">
                    Canlı Siparişler
                  </Link>
                  {" "}- Siparişleri onaylayın/hazırlayın
                </li>
                <li>
                  <strong>Garson çağrılarını kontrol edin:</strong>{" "}
                  <Link href="/panel/waiter-calls" className="text-green-600 underline">
                    Garson Çağrıları
                  </Link>
                </li>
                <li>
                  <strong>Menüyü düzenleyin:</strong>{" "}
                  <Link href="/panel/menu" className="text-green-600 underline">
                    Menü Yönetimi
                  </Link>
                  {" "}- Ürün ekleyin/düzenleyin
                </li>
                <li>
                  <strong>Raporları inceleyin:</strong>{" "}
                  <Link href="/panel/reports" className="text-green-600 underline">
                    Raporlar
                  </Link>
                  {" "}&{" "}
                  <Link href="/panel/analytics" className="text-green-600 underline">
                    Analitik
                  </Link>
                </li>
                <li>
                  <strong>Admin paneli (opsiyonel):</strong>{" "}
                  <Link href="/admin/dashboard" className="text-green-600 underline">
                    Admin Dashboard
                  </Link>
                  {" "}- admin@restoai.com / admin123
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
                "Radix UI",
                "Prisma ORM",
                "PostgreSQL",
                "NextAuth.js v5",
                "Claude AI (Anthropic)",
                "Zod Validation",
                "QR Code React",
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
        RestoAI - AI Restaurant Platform | {new Date().getFullYear()}
      </footer>
    </div>
  )
}

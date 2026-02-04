import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold">Restaurant Platform</span>
          <nav className="flex items-center gap-4">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Özellikler</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Fiyatlandırma</a>
            <Button variant="outline" size="sm">Giriş Yap</Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Restoranınızı <span className="text-primary">Dijitalleştirin</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          QR menü, AI destekli sipariş asistanı ve güçlü yönetim paneli ile işletmenizi bir üst seviyeye taşıyın.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg">Ücretsiz Deneyin</Button>
          <Button size="lg" variant="outline">Demo İncele</Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">Özellikler</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>QR Menü</CardTitle>
                <CardDescription>Müşterileriniz telefonlarıyla QR kodu tarayarak menünüze ulaşsın</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI Sipariş Asistanı</CardTitle>
                <CardDescription>Yapay zeka destekli chatbot ile müşterilerinize öneri sunun</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gerçek Zamanlı Takip</CardTitle>
                <CardDescription>Siparişleri anında görün, mutfağa bildirin, durumu takip edin</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">Fiyatlandırma</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Küçük kafeler için</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₺499</span>
                  <span className="text-muted-foreground">/ay</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 500 sipariş/ay</li>
                  <li>✓ 10 masa</li>
                  <li>✓ 200 AI istek</li>
                </ul>
                <Button className="mt-6 w-full" variant="outline">Başla</Button>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <div className="mb-2 text-xs font-semibold text-primary">EN POPÜLER</div>
                <CardTitle>Growth</CardTitle>
                <CardDescription>Büyüyen restoranlar için</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₺999</span>
                  <span className="text-muted-foreground">/ay</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 2000 sipariş/ay</li>
                  <li>✓ 25 masa</li>
                  <li>✓ 1000 AI istek</li>
                </ul>
                <Button className="mt-6 w-full">Başla</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Zincir restoranlar için</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₺1999</span>
                  <span className="text-muted-foreground">/ay</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Sınırsız sipariş</li>
                  <li>✓ Sınırsız masa</li>
                  <li>✓ Sınırsız AI</li>
                </ul>
                <Button className="mt-6 w-full" variant="outline">İletişime Geç</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Restaurant Platform. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  )
}

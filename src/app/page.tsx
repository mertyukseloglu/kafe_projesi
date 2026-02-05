import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  QrCode,
  Bot,
  Clock,
  Users,
  Gift,
  BarChart3,
  Smartphone,
  ChefHat,
  Menu,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Star,
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              R
            </div>
            <span className="text-xl font-bold">RestoAI</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Ozellikler
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Nasil Calisir
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Fiyatlandirma
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Giris Yap</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Ucretsiz Basla</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
              <Zap className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Yapay Zeka Destekli Restoran Yonetimi</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Restoraninizi
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Dijitallestirin</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              QR menu, AI siparis asistani ve guclu yonetim paneli ile isletmenizi bir ust seviyeye tasiyin.
              Musterilerinize unutulmaz bir deneyim sunun.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/register">
                  14 Gun Ucretsiz Deneyin
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/customer/menu/demo-kafe?table=1">
                  Canli Demo
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                Kredi karti gerekmez
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                5 dakikada kurun
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                7/24 destek
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">
            500&apos;den fazla isletme tarafindan tercih ediliyor
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <div className="text-2xl font-bold">KahveDunyasi</div>
            <div className="text-2xl font-bold">BistroCafe</div>
            <div className="text-2xl font-bold">LezzetSofrasi</div>
            <div className="text-2xl font-bold">ModernMutfak</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Tum Ihtiyaclariniz Tek Platformda</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Isletmenizi buyutmek icin gereken tum araclar entegre ve kullanima hazir
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>QR Menu</CardTitle>
                <CardDescription>
                  Her masa icin ozel QR kod. Musteriler telefonlariyla tarayarak menuye aninda ulasir.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Bot className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>AI Siparis Asistani</CardTitle>
                <CardDescription>
                  Claude AI ile entegre chatbot. Musterilere oneri yapar, sorulari yanitlar, siparis alir.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Gercek Zamanli Takip</CardTitle>
                <CardDescription>
                  Siparisleri aninda gorun. Mutfaga bildirin, durum guncellemeleri yapin, bekleme suresini azaltin.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Musteri Analizi</CardTitle>
                <CardDescription>
                  Musteri tercihlerini ogrenin. Siparis gecmisi, favori urunler ve ziyaret sikligini takip edin.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Gift className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle>Sadakat Programi</CardTitle>
                <CardDescription>
                  Puan sistemi ile musteri bagliligini artirin. Ozel kampanyalar ve indirimler olusturun.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                  <BarChart3 className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle>Detayli Raporlar</CardTitle>
                <CardDescription>
                  Satis, urun performansi ve trend analizleri. Veriye dayali kararlar alin.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Nasil Calisir?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              3 basit adimda dijital restorana gecis yapin
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Hesap Olusturun</h3>
              <p className="text-muted-foreground">
                5 dakikada hesabinizi olusturun. Menu, masa ve personel bilgilerini girin.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">QR Kodlari Yerlestirin</h3>
              <p className="text-muted-foreground">
                Her masa icin ozel QR kodlari indirin ve masalara yerlestirin.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Siparisleri Alin</h3>
              <p className="text-muted-foreground">
                Musteriler QR tarayarak siparis verir, siz panelden yonetin. Bu kadar basit!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">
                Musteri Deneyimini Goruntuleyin
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Musterilerinizin nasil bir deneyim yasayacagini canli olarak inceleyin.
                Demo kafemizin menusunu ziyaret edin ve AI asistanimizla sohbet edin.
              </p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Smartphone className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Mobil uyumlu arayuz</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>AI ile akilli oneriler</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <Menu className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Kolay sepet yonetimi</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                    <ChefHat className="h-4 w-4 text-orange-600" />
                  </div>
                  <span>Garson cagirma ozelligi</span>
                </li>
              </ul>

              <Button size="lg" className="mt-8 gap-2" asChild>
                <Link href="/customer/menu/demo-kafe?table=1">
                  Canli Demoyu Deneyin
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border-8 border-muted bg-gradient-to-br from-orange-100 to-red-100 p-8">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <QrCode className="h-24 w-24 text-orange-500 mb-4" />
                  <p className="text-lg font-semibold text-gray-700">QR Kodu Tarayin</p>
                  <p className="text-sm text-gray-500 mt-2">veya linke tiklayin</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-lg border bg-background p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <Bot className="h-10 w-10 text-blue-500" />
                  <div>
                    <p className="font-semibold">AI Asistan</p>
                    <p className="text-sm text-muted-foreground">Size yardimci olmaya hazirim!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Musterilerimiz Ne Diyor?</h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  &quot;QR menu sistemi ile garsonlara olan bagimliligi azalttik. Musteriler kendi basina siparis verebiliyor, biz de daha hizli servis yapabiliyoruz.&quot;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    AK
                  </div>
                  <div>
                    <p className="font-semibold">Ahmet Korkmaz</p>
                    <p className="text-sm text-muted-foreground">Cafe Bosphorus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  &quot;AI asistan gercekten ise yariyor. Musterilere oneri yapiyor, biz de daha fazla satis yapiyoruz. Upsell oranimiz %30 artti.&quot;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    SY
                  </div>
                  <div>
                    <p className="font-semibold">Selin Yilmaz</p>
                    <p className="text-sm text-muted-foreground">Modern Bistro</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  &quot;Raporlama ozelligi harika. Hangi urunun ne zaman sattigi, musteri dagilimi... Tum veriyi tek ekranda goruyorum.&quot;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    MD
                  </div>
                  <div>
                    <p className="font-semibold">Mehmet Demir</p>
                    <p className="text-sm text-muted-foreground">Lezzet Duragi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Basit ve Seffaf Fiyatlandirma</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Isletmenizin buyuklugune uygun plan secin. Tum planlar 14 gun ucretsiz deneme icerir.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Kucuk kafeler icin ideal</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">&#8378;499</span>
                  <span className="text-muted-foreground">/ay</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    500 siparis/ay
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    10 masa
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    200 AI istek
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    2 personel hesabi
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Temel raporlar
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    E-posta destegi
                  </li>
                </ul>
                <Button className="mt-8 w-full" variant="outline" asChild>
                  <Link href="/register">Ucretsiz Basla</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-primary shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                En Populer
              </div>
              <CardHeader>
                <CardTitle>Growth</CardTitle>
                <CardDescription>Buyuyen restoranlar icin</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">&#8378;999</span>
                  <span className="text-muted-foreground">/ay</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    2000 siparis/ay
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    25 masa
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    1000 AI istek
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    5 personel hesabi
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Gelismis raporlar
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Sadakat programi
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Oncelikli destek
                  </li>
                </ul>
                <Button className="mt-8 w-full" asChild>
                  <Link href="/register">Ucretsiz Basla</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Zincir restoranlar icin</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">&#8378;1999</span>
                  <span className="text-muted-foreground">/ay</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Sinirsiz siparis
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Sinirsiz masa
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Sinirsiz AI istek
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Sinirsiz personel
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Tum ozellikler
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    API erisimi
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Ozel entegrasyon
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    7/24 telefon destegi
                  </li>
                </ul>
                <Button className="mt-8 w-full" variant="outline" asChild>
                  <Link href="/register">Iletisime Gec</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="text-left">
                <p className="font-semibold">SSL Korumali</p>
                <p className="text-sm text-muted-foreground">256-bit sifreleme</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-500" />
              <div className="text-left">
                <p className="font-semibold">KVKK Uyumlu</p>
                <p className="text-sm text-muted-foreground">Veri guvenligi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div className="text-left">
                <p className="font-semibold">%99.9 Uptime</p>
                <p className="text-sm text-muted-foreground">Kesintisiz hizmet</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-bold md:text-4xl">Dijital Donusume Hazir misiniz?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
              14 gun ucretsiz deneyin. Kredi karti gerekmez, iptal etmek kolay.
              Simdi baslayin, farki gorun.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="gap-2" asChild>
                <Link href="/register">
                  Hemen Basla
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/customer/menu/demo-kafe?table=1">
                  Demoyu Incele
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  R
                </div>
                <span className="text-xl font-bold">RestoAI</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Yapay zeka destekli restoran yonetim platformu.
                Isletmenizi dijitallestirin, verimliligi artirin.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Urun</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Ozellikler</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Fiyatlandirma</a></li>
                <li><Link href="/customer/menu/demo-kafe?table=1" className="hover:text-foreground">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Sirket</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Hakkimizda</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Kariyer</a></li>
                <li><a href="#" className="hover:text-foreground">Iletisim</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Destek</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Yardim Merkezi</a></li>
                <li><a href="#" className="hover:text-foreground">API Dokumantasyon</a></li>
                <li><a href="#" className="hover:text-foreground">Gizlilik Politikasi</a></li>
                <li><a href="#" className="hover:text-foreground">Kullanim Sartlari</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 RestoAI. Tum haklari saklidir.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

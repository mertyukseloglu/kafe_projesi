import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TenantDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bugünün özeti</p>
      </div>

      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktif Siparişler</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Bekleyen: 0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bugünün Cirosu</CardDescription>
            <CardTitle className="text-3xl">₺0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Sipariş: 0 adet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dolu Masalar</CardDescription>
            <CardTitle className="text-3xl">0/0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Doluluk: %0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aylık Sipariş</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Kalan limit: ∞</p>
          </CardContent>
        </Card>
      </div>

      {/* Canlı Siparişler */}
      <Card>
        <CardHeader>
          <CardTitle>Canlı Siparişler</CardTitle>
          <CardDescription>Şu an aktif olan siparişler</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Henüz aktif sipariş yok. Müşteriler QR kod tarayarak sipariş verebilir.
          </p>
        </CardContent>
      </Card>

      {/* Popüler Ürünler */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popüler Ürünler</CardTitle>
            <CardDescription>Bu hafta en çok satan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Henüz veri yok.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full rounded-lg border p-3 text-left text-sm hover:bg-accent">
              + Yeni Ürün Ekle
            </button>
            <button className="w-full rounded-lg border p-3 text-left text-sm hover:bg-accent">
              + Yeni Masa Ekle
            </button>
            <button className="w-full rounded-lg border p-3 text-left text-sm hover:bg-accent">
              📥 QR Kodları İndir
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

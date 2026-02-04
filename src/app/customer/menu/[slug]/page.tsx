import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CustomerMenuPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ table?: string }>
}

export default async function CustomerMenuPage({
  params,
  searchParams,
}: CustomerMenuPageProps) {
  const { slug } = await params
  const { table } = await searchParams

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div>
            <h1 className="font-semibold">{slug}</h1>
            {table && (
              <p className="text-sm text-muted-foreground">Masa {table}</p>
            )}
          </div>
        </div>
      </header>

      {/* Kategoriler - yatay scroll */}
      <div className="border-b">
        <div className="flex gap-2 overflow-x-auto p-4">
          {["Tümü", "İçecekler", "Yemekler", "Tatlılar"].map((cat) => (
            <button
              key={cat}
              className="whitespace-nowrap rounded-full border px-4 py-2 text-sm hover:bg-accent"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menü İçeriği */}
      <div className="p-4">
        <p className="text-center text-muted-foreground">
          Menü yükleniyor...
        </p>

        {/* Örnek ürün kartları */}
        <div className="mt-4 space-y-3">
          <Card>
            <CardContent className="flex gap-4 p-4">
              <div className="h-20 w-20 shrink-0 rounded-lg bg-muted" />
              <div className="flex-1">
                <h3 className="font-medium">Örnek Ürün</h3>
                <p className="text-sm text-muted-foreground">
                  Ürün açıklaması burada görünecek
                </p>
                <p className="mt-1 font-semibold">₺0.00</p>
              </div>
              <Button size="sm" variant="outline">
                Ekle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alt Sepet Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" size="lg">
            Sepeti Görüntüle (0 ürün) - ₺0.00
          </Button>
        </div>
      </div>

      {/* AI Chatbot Butonu */}
      <button className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary text-2xl text-primary-foreground shadow-lg">
        💬
      </button>
    </div>
  )
}

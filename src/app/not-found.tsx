import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <span className="text-8xl font-bold text-orange-500">404</span>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Sayfa Bulunamadı
        </h1>

        <p className="mb-8 text-slate-600">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Link>
          </Button>

          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

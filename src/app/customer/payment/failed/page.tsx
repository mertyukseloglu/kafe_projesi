"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function PaymentFailedContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const message = searchParams.get("message")

  // Error messages
  const errorMessages: Record<string, string> = {
    no_token: "Ödeme bilgisi bulunamadı",
    payment_failed: "Ödeme işlemi başarısız oldu",
    system_error: "Sistem hatası oluştu",
    card_declined: "Kartınız reddedildi",
    insufficient_funds: "Yetersiz bakiye",
    expired_card: "Kartınızın süresi dolmuş",
  }

  const displayMessage = message || errorMessages[error || ""] || "Ödeme işlemi tamamlanamadı"

  return (
    <Card className="w-full max-w-md text-center shadow-xl">
      <CardContent className="p-8">
        {/* Error Icon */}
        <div className="relative mx-auto mb-6 h-24 w-24">
          <div className="absolute inset-0 animate-pulse rounded-full bg-red-400 opacity-25" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-red-500">
            <XCircle className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-red-700">
          Ödeme Başarısız
        </h1>
        <p className="mb-6 text-slate-600">
          {displayMessage}
        </p>

        {/* Error Details */}
        {error && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Hata kodu: {error}</span>
          </div>
        )}

        {/* Suggestions */}
        <div className="mb-6 rounded-lg bg-slate-50 p-4 text-left text-sm text-slate-600">
          <p className="mb-2 font-medium">Şunları deneyebilirsiniz:</p>
          <ul className="space-y-1 text-slate-500">
            <li>• Kart bilgilerinizi kontrol edin</li>
            <li>• Farklı bir kart deneyin</li>
            <li>• Bankanızla iletişime geçin</li>
            <li>• Masada nakit ödeme yapın</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={() => window.history.back()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-slate-400">
          Sorun devam ederse masada nakit ödeme yapabilirsiniz
        </p>
      </CardContent>
    </Card>
  )
}

function LoadingFallback() {
  return (
    <Card className="w-full max-w-md text-center shadow-xl">
      <CardContent className="p-8">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-500" />
        <p className="mt-4 text-slate-500">Yükleniyor...</p>
      </CardContent>
    </Card>
  )
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentFailedContent />
      </Suspense>
    </div>
  )
}

"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight, Receipt, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const paymentId = searchParams.get("paymentId")
  const demo = searchParams.get("demo")

  return (
    <Card className="w-full max-w-md text-center shadow-xl">
      <CardContent className="p-8">
        {/* Success Animation */}
        <div className="relative mx-auto mb-6 h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-25" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-green-500">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-green-700">
          Ödeme Başarılı!
        </h1>
        <p className="mb-6 text-slate-600">
          Siparişiniz onaylandı ve hazırlanmaya başlandı.
        </p>

        {/* Order Info */}
        <div className="mb-6 rounded-lg bg-slate-50 p-4">
          {paymentId && (
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">İşlem No:</span>
              <span className="font-mono font-medium">{paymentId.slice(0, 16)}...</span>
            </div>
          )}
          {demo && (
            <div className="mt-2 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
              Demo ödeme - Gerçek işlem yapılmadı
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {orderId && (
            <Link href={`/customer/order/${orderId}`} className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Receipt className="mr-2 h-4 w-4" />
                Siparişi Takip Et
              </Button>
            </Link>
          )}
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Ana Sayfaya Dön
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-slate-400">
          Siparişiniz hazır olduğunda bilgilendirileceksiniz
        </p>
      </CardContent>
    </Card>
  )
}

function LoadingFallback() {
  return (
    <Card className="w-full max-w-md text-center shadow-xl">
      <CardContent className="p-8">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-500" />
        <p className="mt-4 text-slate-500">Yükleniyor...</p>
      </CardContent>
    </Card>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  )
}

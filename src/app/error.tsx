"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { captureError } from "@/lib/error-tracking"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureError(error, { page: "global" })
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Bir Hata Oluştu
          </h1>

          <p className="mb-6 text-slate-600">
            Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 w-full rounded-lg bg-slate-100 p-4 text-left">
              <p className="mb-1 text-xs font-medium text-slate-500">Hata Detayı:</p>
              <p className="font-mono text-sm text-red-600">{error.message}</p>
              {error.digest && (
                <p className="mt-2 text-xs text-slate-400">Digest: {error.digest}</p>
              )}
            </div>
          )}

          <div className="flex w-full gap-3">
            <Button
              onClick={reset}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>

            <Button
              onClick={() => window.location.href = "/"}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

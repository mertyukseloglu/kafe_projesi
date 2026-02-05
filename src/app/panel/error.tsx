"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react"

export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service (e.g., Sentry)
    }
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle className="h-7 w-7 text-orange-600" />
          </div>

          <h1 className="mb-2 text-xl font-semibold text-slate-900">
            Sayfa Yüklenemedi
          </h1>

          <p className="mb-6 text-sm text-slate-600">
            Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 w-full rounded-lg bg-slate-50 p-3 text-left">
              <p className="mb-1 text-xs font-medium text-slate-500">Hata:</p>
              <p className="font-mono text-xs text-red-600">{error.message}</p>
            </div>
          )}

          <div className="flex w-full gap-3">
            <Button
              onClick={reset}
              className="flex-1"
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>

            <Button
              onClick={() => window.location.href = "/panel/dashboard"}
              className="flex-1"
              size="sm"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

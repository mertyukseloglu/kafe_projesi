import { Loader2 } from "lucide-react"

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-sm font-medium text-slate-600">RestoAI yükleniyor...</p>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  TrendingUp,
  TrendingDown,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react"

// Demo ödemeler
const demoPayments = [
  { id: "1", tenant: "Demo Kafe", plan: "Growth", amount: 599, status: "paid", date: "2024-02-01" },
  { id: "2", tenant: "Lezzet Durağı", plan: "Pro", amount: 999, status: "paid", date: "2024-02-01" },
  { id: "3", tenant: "Kahve Evi", plan: "Starter", amount: 299, status: "pending", date: "2024-02-05" },
  { id: "4", tenant: "Tatlı Köşe", plan: "Growth", amount: 599, status: "paid", date: "2024-02-01" },
  { id: "5", tenant: "Şehir Bistro", plan: "Growth", amount: 599, status: "failed", date: "2024-01-28" },
  { id: "6", tenant: "Demo Kafe", plan: "Growth", amount: 599, status: "paid", date: "2024-01-01" },
  { id: "7", tenant: "Lezzet Durağı", plan: "Pro", amount: 999, status: "paid", date: "2024-01-01" },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid: { label: "Ödendi", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  pending: { label: "Bekliyor", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  failed: { label: "Başarısız", color: "bg-red-500/20 text-red-400", icon: XCircle },
}

export default function PaymentsPage() {
  const totalRevenue = demoPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = demoPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)
  const failedAmount = demoPayments.filter(p => p.status === "failed").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Ödemeler</h1>
          <p className="text-slate-400">Gelir takibi ve ödeme geçmişi</p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <Download className="mr-2 h-4 w-4" />
          Rapor İndir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Toplam Gelir</p>
                <p className="text-2xl font-bold text-white">₺{totalRevenue.toLocaleString("tr-TR")}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Bu Ay</p>
                <p className="text-2xl font-bold text-green-400">₺{(totalRevenue * 0.4).toLocaleString("tr-TR")}</p>
              </div>
              <Calendar className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-400">₺{pendingAmount.toLocaleString("tr-TR")}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Başarısız</p>
                <p className="text-2xl font-bold text-red-400">₺{failedAmount.toLocaleString("tr-TR")}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Ödeme Geçmişi</CardTitle>
          <CardDescription className="text-slate-400">Son işlemler</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700 bg-slate-800/50">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Restoran</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Plan</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Tutar</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Durum</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {demoPayments.map((payment) => {
                  const status = statusConfig[payment.status]
                  const StatusIcon = status.icon
                  return (
                    <tr key={payment.id} className="border-b border-slate-700 last:border-0">
                      <td className="p-4">
                        <span className="font-medium text-white">{payment.tenant}</span>
                      </td>
                      <td className="p-4 text-slate-300">{payment.plan}</td>
                      <td className="p-4 font-medium text-white">₺{payment.amount}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(payment.date).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

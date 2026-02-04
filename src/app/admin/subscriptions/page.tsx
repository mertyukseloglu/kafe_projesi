"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Zap,
  Crown,
  Rocket,
} from "lucide-react"

// Demo planlar
const demoPlans = [
  {
    id: "1",
    name: "Starter",
    slug: "starter",
    price: 299,
    yearlyPrice: 2990,
    description: "Küçük işletmeler için ideal başlangıç paketi",
    maxOrders: 500,
    maxTables: 10,
    maxAiRequests: 100,
    maxStaff: 3,
    features: ["QR Menü", "Temel Analitik", "E-posta Desteği"],
    color: "slate",
    icon: Zap,
    subscribers: 3,
  },
  {
    id: "2",
    name: "Growth",
    slug: "growth",
    price: 599,
    yearlyPrice: 5990,
    description: "Büyüyen işletmeler için kapsamlı çözüm",
    maxOrders: 2000,
    maxTables: 30,
    maxAiRequests: 500,
    maxStaff: 10,
    features: ["QR Menü", "Gelişmiş Analitik", "AI Asistan", "Sadakat Programı", "Öncelikli Destek"],
    color: "blue",
    icon: Rocket,
    subscribers: 6,
  },
  {
    id: "3",
    name: "Pro",
    slug: "pro",
    price: 999,
    yearlyPrice: 9990,
    description: "Tam donanımlı profesyonel paket",
    maxOrders: -1,
    maxTables: -1,
    maxAiRequests: -1,
    maxStaff: -1,
    features: ["Sınırsız Her Şey", "Özel API Erişimi", "White Label", "Çoklu Dil", "7/24 Destek", "Özel Entegrasyonlar"],
    color: "purple",
    icon: Crown,
    subscribers: 3,
  },
]

const colorConfig: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  slate: {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-300",
    iconBg: "bg-slate-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    iconBg: "bg-blue-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    iconBg: "bg-purple-500/20",
  },
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState(demoPlans)
  const [editingPlan, setEditingPlan] = useState<typeof demoPlans[0] | null>(null)

  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribers, 0)
  const mrr = plans.reduce((sum, p) => sum + p.price * p.subscribers, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Abonelik Planları</h1>
          <p className="text-slate-400">Fiyatlandırma ve plan özelliklerini yönetin</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Toplam Abone</p>
            <p className="text-2xl font-bold text-white">{totalSubscribers}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Aylık Gelir (MRR)</p>
            <p className="text-2xl font-bold text-green-400">₺{mrr.toLocaleString("tr-TR")}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Ortalama Plan</p>
            <p className="text-2xl font-bold text-white">
              ₺{totalSubscribers > 0 ? Math.round(mrr / totalSubscribers) : 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Plan Sayısı</p>
            <p className="text-2xl font-bold text-white">{plans.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const colors = colorConfig[plan.color]
          const PlanIcon = plan.icon
          return (
            <Card
              key={plan.id}
              className={`relative border-2 ${colors.border} ${colors.bg}`}
            >
              {/* Popular badge */}
              {plan.slug === "growth" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                  En Popüler
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg ${colors.iconBg} p-2`}>
                    <PlanIcon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl text-white">{plan.name}</CardTitle>
                <CardDescription className="text-slate-400">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">₺{plan.price}</span>
                    <span className="text-slate-400">/ay</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    veya ₺{plan.yearlyPrice}/yıl (2 ay bedava)
                  </p>
                </div>

                {/* Limits */}
                <div className="mb-6 space-y-2 rounded-lg bg-slate-800/50 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Sipariş</span>
                    <span className="text-white">{plan.maxOrders === -1 ? "Sınırsız" : plan.maxOrders}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Masa</span>
                    <span className="text-white">{plan.maxTables === -1 ? "Sınırsız" : plan.maxTables}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">AI İstek</span>
                    <span className="text-white">{plan.maxAiRequests === -1 ? "Sınırsız" : plan.maxAiRequests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Personel</span>
                    <span className="text-white">{plan.maxStaff === -1 ? "Sınırsız" : plan.maxStaff}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 ${colors.text}`} />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribers */}
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Aktif Abone</span>
                    <span className="text-lg font-bold text-white">{plan.subscribers}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Aylık gelir: ₺{(plan.price * plan.subscribers).toLocaleString("tr-TR")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md border-slate-700 bg-slate-800">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Plan Düzenle: {editingPlan.name}</h2>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setEditingPlan(null); }}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Plan Adı</label>
                  <input
                    type="text"
                    defaultValue={editingPlan.name}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Aylık Fiyat (₺)</label>
                    <input
                      type="number"
                      defaultValue={editingPlan.price}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Yıllık Fiyat (₺)</label>
                    <input
                      type="number"
                      defaultValue={editingPlan.yearlyPrice}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Maks. Sipariş</label>
                    <input
                      type="number"
                      defaultValue={editingPlan.maxOrders}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      placeholder="-1 = sınırsız"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Maks. Masa</label>
                    <input
                      type="number"
                      defaultValue={editingPlan.maxTables}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      placeholder="-1 = sınırsız"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setEditingPlan(null)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1">
                    Kaydet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

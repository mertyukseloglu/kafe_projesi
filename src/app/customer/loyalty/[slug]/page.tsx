"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  Star,
  Gift,
  TrendingUp,
  History,
  ChevronRight,
  Sparkles,
  Crown,
  ArrowLeft,
  Coffee,
  Percent,
  Tag,
} from "lucide-react"
import Link from "next/link"

// Tier configuration
const tierConfig = {
  BRONZE: {
    name: "Bronze",
    color: "bg-amber-600",
    textColor: "text-amber-600",
    bgLight: "bg-amber-50",
    icon: Award,
    minPoints: 0,
    maxPoints: 499,
    multiplier: 1,
  },
  SILVER: {
    name: "Silver",
    color: "bg-gray-400",
    textColor: "text-gray-500",
    bgLight: "bg-gray-50",
    icon: Star,
    minPoints: 500,
    maxPoints: 1499,
    multiplier: 1.25,
  },
  GOLD: {
    name: "Gold",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgLight: "bg-yellow-50",
    icon: Crown,
    minPoints: 1500,
    maxPoints: 4999,
    multiplier: 1.5,
  },
  PLATINUM: {
    name: "Platinum",
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgLight: "bg-purple-50",
    icon: Sparkles,
    minPoints: 5000,
    maxPoints: Infinity,
    multiplier: 2,
  },
}

type TierType = keyof typeof tierConfig

interface LoyaltyData {
  points: number
  tier: TierType
  totalSpent: number
  visitCount: number
  nextTier: TierType | null
  pointsToNextTier: number
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  rewardType: "free_item" | "discount_percent" | "discount_amount"
  value: number
  minTier: TierType
}

interface Transaction {
  id: string
  type: "EARN" | "REDEEM" | "BONUS"
  points: number
  description: string
  createdAt: string
}

// Demo data
const demoLoyalty: LoyaltyData = {
  points: 1250,
  tier: "SILVER",
  totalSpent: 2500,
  visitCount: 18,
  nextTier: "GOLD",
  pointsToNextTier: 250,
}

const demoRewards: Reward[] = [
  { id: "1", name: "Ücretsiz Kahve", description: "Herhangi bir standart kahve", pointsCost: 100, rewardType: "free_item", value: 0, minTier: "BRONZE" },
  { id: "2", name: "%10 İndirim", description: "Tüm siparişlerde geçerli", pointsCost: 200, rewardType: "discount_percent", value: 10, minTier: "BRONZE" },
  { id: "3", name: "Ücretsiz Tatlı", description: "Seçili tatlılardan biri", pointsCost: 250, rewardType: "free_item", value: 0, minTier: "SILVER" },
  { id: "4", name: "%20 İndirim", description: "100₺ üzeri siparişlerde", pointsCost: 400, rewardType: "discount_percent", value: 20, minTier: "SILVER" },
  { id: "5", name: "50₺ İndirim", description: "Minimum sipariş yok", pointsCost: 500, rewardType: "discount_amount", value: 50, minTier: "GOLD" },
  { id: "6", name: "VIP Kahve Deneyimi", description: "Özel çekirdeklerden hazırlanan kahve", pointsCost: 750, rewardType: "free_item", value: 0, minTier: "PLATINUM" },
]

const demoTransactions: Transaction[] = [
  { id: "1", type: "EARN", points: 45, description: "Sipariş #S045", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "2", type: "REDEEM", points: -100, description: "Ücretsiz Kahve", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "3", type: "EARN", points: 78, description: "Sipariş #S032", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "4", type: "BONUS", points: 100, description: "Doğum günü bonusu", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "5", type: "EARN", points: 52, description: "Sipariş #S028", createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
]

interface CustomerLoyaltyPageProps {
  params: Promise<{ slug: string }>
}

export default function CustomerLoyaltyPage({ params }: CustomerLoyaltyPageProps) {
  const searchParams = useSearchParams()
  const customerId = searchParams.get("customer")
  const [slug, setSlug] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards")

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  // In real app, fetch from API
  const loyalty = demoLoyalty
  const rewards = demoRewards
  const transactions = demoTransactions

  const currentTier = tierConfig[loyalty.tier]
  const TierIcon = currentTier.icon

  // Calculate progress to next tier
  const progressToNextTier = loyalty.nextTier
    ? ((loyalty.points - currentTier.minPoints) / (tierConfig[loyalty.nextTier].minPoints - currentTier.minPoints)) * 100
    : 100

  const restaurantName = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Kafe"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 p-4">
          <Link href={`/customer/menu/${slug}`}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Sadakat Programı</h1>
            <p className="text-sm text-muted-foreground">{restaurantName}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Tier Card */}
        <Card className={`overflow-hidden ${currentTier.bgLight} border-2`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-2 rounded-xl ${currentTier.color}`}>
                    <TierIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-2xl font-bold ${currentTier.textColor}`}>
                    {currentTier.name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentTier.multiplier}x puan kazanımı
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{loyalty.points.toLocaleString("tr-TR")}</div>
                <p className="text-sm text-muted-foreground">puan</p>
              </div>
            </div>

            {/* Progress to next tier */}
            {loyalty.nextTier && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">Sonraki seviye: {tierConfig[loyalty.nextTier].name}</span>
                  <span className="font-medium">{loyalty.pointsToNextTier} puan kaldı</span>
                </div>
                <Progress value={progressToNextTier} className="h-2" indicatorClassName={currentTier.color} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Coffee className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{loyalty.visitCount}</div>
              <p className="text-xs text-muted-foreground">Toplam Ziyaret</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">₺{loyalty.totalSpent.toLocaleString("tr-TR")}</div>
              <p className="text-xs text-muted-foreground">Toplam Harcama</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setActiveTab("rewards")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "rewards"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gift className="h-4 w-4" />
            Ödüller
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4" />
            Geçmiş
          </button>
        </div>

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div className="space-y-3">
            {rewards.map((reward) => {
              const canRedeem = loyalty.points >= reward.pointsCost
              const tierMet = Object.keys(tierConfig).indexOf(loyalty.tier) >= Object.keys(tierConfig).indexOf(reward.minTier)
              const isAvailable = canRedeem && tierMet

              return (
                <Card
                  key={reward.id}
                  className={`overflow-hidden transition-all ${
                    isAvailable ? "hover:shadow-md" : "opacity-60"
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`p-3 rounded-xl ${isAvailable ? "bg-primary/10" : "bg-muted"}`}>
                      {reward.rewardType === "free_item" && <Gift className={`h-6 w-6 ${isAvailable ? "text-primary" : "text-muted-foreground"}`} />}
                      {reward.rewardType === "discount_percent" && <Percent className={`h-6 w-6 ${isAvailable ? "text-primary" : "text-muted-foreground"}`} />}
                      {reward.rewardType === "discount_amount" && <Tag className={`h-6 w-6 ${isAvailable ? "text-primary" : "text-muted-foreground"}`} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{reward.name}</h3>
                        {!tierMet && (
                          <Badge variant="outline" className="text-[10px]">
                            {tierConfig[reward.minTier].name}+
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <Button
                        size="sm"
                        variant={isAvailable ? "default" : "outline"}
                        disabled={!isAvailable}
                        className="rounded-xl"
                      >
                        {reward.pointsCost} puan
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`p-2 rounded-xl ${
                    tx.type === "EARN" ? "bg-green-100" :
                    tx.type === "REDEEM" ? "bg-orange-100" :
                    "bg-purple-100"
                  }`}>
                    {tx.type === "EARN" && <TrendingUp className="h-5 w-5 text-green-600" />}
                    {tx.type === "REDEEM" && <Gift className="h-5 w-5 text-orange-600" />}
                    {tx.type === "BONUS" && <Sparkles className="h-5 w-5 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    tx.points > 0 ? "text-green-600" : "text-orange-600"
                  }`}>
                    {tx.points > 0 ? "+" : ""}{tx.points}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tier Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tier Avantajları</CardTitle>
            <CardDescription>Her seviyede daha fazla kazanın</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(tierConfig).map(([key, tier]) => {
              const isCurrentOrLower = Object.keys(tierConfig).indexOf(loyalty.tier) >= Object.keys(tierConfig).indexOf(key)
              const Icon = tier.icon
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    key === loyalty.tier ? `${tier.bgLight} border-2 border-${tier.color}` : "bg-muted/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${tier.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tier.name}</span>
                      {key === loyalty.tier && (
                        <Badge variant="secondary" className="text-[10px]">Şu anki</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tier.minPoints === 0 ? "0" : tier.minPoints.toLocaleString("tr-TR")}
                      {tier.maxPoints === Infinity ? "+" : ` - ${tier.maxPoints.toLocaleString("tr-TR")}`} puan
                    </p>
                  </div>
                  <div className={`text-sm font-bold ${isCurrentOrLower ? tier.textColor : "text-muted-foreground"}`}>
                    {tier.multiplier}x
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

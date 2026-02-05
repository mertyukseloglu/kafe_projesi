import { prisma } from "@/lib/prisma"
import { LoyaltyTier, LoyaltyTransactionType } from "@prisma/client"

// Tier eşiklerini kontrol et ve güncelle
export function calculateTier(totalPoints: number, config: {
  silverThreshold: number
  goldThreshold: number
  platinumThreshold: number
}): LoyaltyTier {
  if (totalPoints >= config.platinumThreshold) return "PLATINUM"
  if (totalPoints >= config.goldThreshold) return "GOLD"
  if (totalPoints >= config.silverThreshold) return "SILVER"
  return "BRONZE"
}

// Tier çarpanını al
export function getTierMultiplier(tier: LoyaltyTier, config: {
  bronzeMultiplier: number
  silverMultiplier: number
  goldMultiplier: number
  platinumMultiplier: number
}): number {
  const multipliers = {
    BRONZE: Number(config.bronzeMultiplier),
    SILVER: Number(config.silverMultiplier),
    GOLD: Number(config.goldMultiplier),
    PLATINUM: Number(config.platinumMultiplier),
  }
  return multipliers[tier] || 1
}

// Sipariş için puan hesapla
export async function calculatePointsForOrder(
  tenantId: string,
  customerId: string,
  orderTotal: number
): Promise<{ points: number; multiplier: number; tier: LoyaltyTier }> {
  // Loyalty config al
  const config = await prisma.loyaltyConfig.findUnique({
    where: { tenantId },
  })

  if (!config || !config.isActive) {
    return { points: 0, multiplier: 1, tier: "BRONZE" }
  }

  // Müşteri bilgisini al
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { loyaltyTier: true, loyaltyPoints: true },
  })

  if (!customer) {
    return { points: 0, multiplier: 1, tier: "BRONZE" }
  }

  // Minimum harcama kontrolü
  if (orderTotal < Number(config.minSpendForPoints)) {
    return { points: 0, multiplier: 1, tier: customer.loyaltyTier }
  }

  // Tier çarpanını al
  const multiplier = getTierMultiplier(customer.loyaltyTier, {
    bronzeMultiplier: Number(config.bronzeMultiplier),
    silverMultiplier: Number(config.silverMultiplier),
    goldMultiplier: Number(config.goldMultiplier),
    platinumMultiplier: Number(config.platinumMultiplier),
  })

  // Puan hesapla: (harcama * puan oranı * çarpan)
  const basePoints = Math.floor(orderTotal * config.pointsPerSpent)
  const points = Math.floor(basePoints * multiplier)

  return { points, multiplier, tier: customer.loyaltyTier }
}

// Puan ekle (sipariş tamamlandığında)
export async function addLoyaltyPoints(
  tenantId: string,
  customerId: string,
  orderId: string,
  orderTotal: number
): Promise<{ success: boolean; pointsEarned: number; newBalance: number; newTier: LoyaltyTier }> {
  const { points, tier } = await calculatePointsForOrder(tenantId, customerId, orderTotal)

  if (points <= 0) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { loyaltyPoints: true, loyaltyTier: true },
    })
    return {
      success: true,
      pointsEarned: 0,
      newBalance: customer?.loyaltyPoints || 0,
      newTier: customer?.loyaltyTier || "BRONZE",
    }
  }

  // Transaction ile güncelle
  const result = await prisma.$transaction(async (tx) => {
    // Mevcut müşteriyi al
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
      select: { loyaltyPoints: true },
    })

    const balanceBefore = customer?.loyaltyPoints || 0
    const balanceAfter = balanceBefore + points

    // Loyalty transaction oluştur
    await tx.loyaltyTransaction.create({
      data: {
        tenantId,
        customerId,
        type: "EARN",
        points,
        orderId,
        description: `Sipariş #${orderId.slice(-6)} - ${orderTotal.toFixed(2)} TL`,
        balanceBefore,
        balanceAfter,
      },
    })

    // Config al (tier hesabı için)
    const config = await tx.loyaltyConfig.findUnique({
      where: { tenantId },
    })

    // Yeni tier hesapla
    const newTier = config
      ? calculateTier(balanceAfter, {
          silverThreshold: config.silverThreshold,
          goldThreshold: config.goldThreshold,
          platinumThreshold: config.platinumThreshold,
        })
      : "BRONZE"

    // Müşteriyi güncelle
    await tx.customer.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: balanceAfter,
        loyaltyTier: newTier,
      },
    })

    return { balanceAfter, newTier }
  })

  return {
    success: true,
    pointsEarned: points,
    newBalance: result.balanceAfter,
    newTier: result.newTier,
  }
}

// Puan harca (ödül kullanımı)
export async function redeemLoyaltyPoints(
  tenantId: string,
  customerId: string,
  rewardId: string,
  orderId?: string
): Promise<{ success: boolean; error?: string; pointsUsed?: number; newBalance?: number }> {
  // Ödülü kontrol et
  const reward = await prisma.loyaltyReward.findFirst({
    where: {
      id: rewardId,
      tenantId,
      isActive: true,
    },
  })

  if (!reward) {
    return { success: false, error: "Ödül bulunamadı" }
  }

  // Geçerlilik kontrolü
  if (reward.validUntil && new Date() > reward.validUntil) {
    return { success: false, error: "Ödülün süresi dolmuş" }
  }

  // Kullanım limiti kontrolü
  if (reward.usageLimit > 0 && reward.usedCount >= reward.usageLimit) {
    return { success: false, error: "Ödül kullanım limiti dolmuş" }
  }

  // Müşteri kontrolü
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { loyaltyPoints: true, loyaltyTier: true },
  })

  if (!customer) {
    return { success: false, error: "Müşteri bulunamadı" }
  }

  // Puan yeterliliği kontrolü
  if (customer.loyaltyPoints < reward.pointsCost) {
    return { success: false, error: "Yetersiz puan" }
  }

  // Tier kontrolü
  const tierOrder = { BRONZE: 0, SILVER: 1, GOLD: 2, PLATINUM: 3 }
  if (tierOrder[customer.loyaltyTier] < tierOrder[reward.minTier]) {
    return { success: false, error: `Bu ödül için minimum ${reward.minTier} seviyesi gerekli` }
  }

  // Transaction ile güncelle
  const result = await prisma.$transaction(async (tx) => {
    const balanceBefore = customer.loyaltyPoints
    const balanceAfter = balanceBefore - reward.pointsCost

    // Loyalty transaction oluştur
    await tx.loyaltyTransaction.create({
      data: {
        tenantId,
        customerId,
        type: "REDEEM",
        points: -reward.pointsCost,
        orderId,
        description: `Ödül kullanımı: ${reward.name}`,
        balanceBefore,
        balanceAfter,
      },
    })

    // Müşteriyi güncelle
    await tx.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: balanceAfter },
    })

    // Ödül kullanım sayısını artır
    await tx.loyaltyReward.update({
      where: { id: rewardId },
      data: { usedCount: { increment: 1 } },
    })

    return { balanceAfter }
  })

  return {
    success: true,
    pointsUsed: reward.pointsCost,
    newBalance: result.balanceAfter,
  }
}

// Müşteri loyalty özeti
export async function getCustomerLoyaltySummary(tenantId: string, customerId: string) {
  const [customer, config, recentTransactions, availableRewards] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        loyaltyPoints: true,
        loyaltyTier: true,
        totalSpent: true,
        visitCount: true,
      },
    }),
    prisma.loyaltyConfig.findUnique({
      where: { tenantId },
    }),
    prisma.loyaltyTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.loyaltyReward.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
      orderBy: { pointsCost: "asc" },
    }),
  ])

  if (!customer || !config) {
    return null
  }

  // Sonraki tier için gereken puan
  const tierThresholds = {
    BRONZE: config.silverThreshold,
    SILVER: config.goldThreshold,
    GOLD: config.platinumThreshold,
    PLATINUM: null,
  }

  const nextTierThreshold = tierThresholds[customer.loyaltyTier]
  const pointsToNextTier = nextTierThreshold
    ? Math.max(0, nextTierThreshold - customer.loyaltyPoints)
    : null

  // Kullanılabilir ödüller (yeterli puan ve tier olan)
  const tierOrder = { BRONZE: 0, SILVER: 1, GOLD: 2, PLATINUM: 3 }
  const redeemableRewards = availableRewards.filter(
    (r) =>
      r.pointsCost <= customer.loyaltyPoints &&
      tierOrder[customer.loyaltyTier] >= tierOrder[r.minTier] &&
      (r.usageLimit === 0 || r.usedCount < r.usageLimit)
  )

  return {
    points: customer.loyaltyPoints,
    tier: customer.loyaltyTier,
    totalSpent: Number(customer.totalSpent),
    visitCount: customer.visitCount,
    pointsToNextTier,
    nextTier: nextTierThreshold ? getNextTier(customer.loyaltyTier) : null,
    multiplier: getTierMultiplier(customer.loyaltyTier, {
      bronzeMultiplier: Number(config.bronzeMultiplier),
      silverMultiplier: Number(config.silverMultiplier),
      goldMultiplier: Number(config.goldMultiplier),
      platinumMultiplier: Number(config.platinumMultiplier),
    }),
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      points: t.points,
      description: t.description,
      createdAt: t.createdAt,
    })),
    availableRewards: availableRewards.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      pointsCost: r.pointsCost,
      rewardType: r.rewardType,
      value: Number(r.value),
      minTier: r.minTier,
      canRedeem:
        r.pointsCost <= customer.loyaltyPoints &&
        tierOrder[customer.loyaltyTier] >= tierOrder[r.minTier],
    })),
    redeemableRewardsCount: redeemableRewards.length,
  }
}

function getNextTier(currentTier: LoyaltyTier): LoyaltyTier | null {
  const order: LoyaltyTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"]
  const currentIndex = order.indexOf(currentTier)
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : null
}

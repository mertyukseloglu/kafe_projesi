import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Platform ayarları
  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "AI Restaurant Platform",
      aiProvider: "claude",
      defaultTrialDays: 14,
      defaultCurrency: "TRY",
      defaultLanguage: "tr",
    },
  })
  console.log("✅ Platform settings created")

  // Abonelik planları
  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "starter" },
    update: {},
    create: {
      name: "Starter",
      slug: "starter",
      description: "Küçük işletmeler için ideal başlangıç paketi",
      price: 299,
      yearlyPrice: 2990,
      maxOrders: 500,
      maxTables: 10,
      maxAiRequests: 100,
      maxStaff: 3,
      features: ["qrMenu", "basicAnalytics"],
      sortOrder: 1,
    },
  })

  const growthPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "growth" },
    update: {},
    create: {
      name: "Growth",
      slug: "growth",
      description: "Büyüyen işletmeler için kapsamlı çözüm",
      price: 599,
      yearlyPrice: 5990,
      maxOrders: 2000,
      maxTables: 30,
      maxAiRequests: 500,
      maxStaff: 10,
      features: ["qrMenu", "analytics", "aiAssistant", "loyalty"],
      sortOrder: 2,
    },
  })

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      description: "Tam donanımlı profesyonel paket",
      price: 999,
      yearlyPrice: 9990,
      maxOrders: -1,
      maxTables: -1,
      maxAiRequests: -1,
      maxStaff: -1,
      features: [
        "qrMenu",
        "advancedAnalytics",
        "aiAssistant",
        "loyalty",
        "multiLanguage",
        "customBranding",
        "apiAccess",
      ],
      sortOrder: 3,
    },
  })
  console.log("✅ Subscription plans created")

  // Demo Tenant (Restoran)
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "demo-kafe" },
    update: {},
    create: {
      name: "Demo Kafe",
      slug: "demo-kafe",
      description: "Şehrin en keyifli kahve durağı",
      phone: "0212 555 0001",
      email: "info@demo-kafe.com",
      address: "Bağdat Caddesi No:123",
      city: "İstanbul",
      district: "Kadıköy",
      settings: {
        workingHours: {
          monday: { open: "08:00", close: "23:00" },
          tuesday: { open: "08:00", close: "23:00" },
          wednesday: { open: "08:00", close: "23:00" },
          thursday: { open: "08:00", close: "23:00" },
          friday: { open: "08:00", close: "00:00" },
          saturday: { open: "09:00", close: "00:00" },
          sunday: { open: "09:00", close: "22:00" },
        },
        theme: {
          primaryColor: "#8B4513",
        },
        currency: "TRY",
        language: "tr",
        aiSettings: {
          enabled: true,
          personality: "friendly",
          welcomeMessage: "Merhaba! Demo Kafe'ye hoş geldiniz. Size nasıl yardımcı olabilirim?",
        },
      },
    },
  })
  console.log("✅ Demo tenant created:", demoTenant.name)

  // Demo tenant için abonelik
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)

  await prisma.subscription.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      tenantId: demoTenant.id,
      planId: growthPlan.id,
      status: "TRIAL",
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
      trialEndsAt: trialEnd,
    },
  })
  console.log("✅ Demo subscription created")

  // Kategoriler
  const categoryData = [
    { name: "Sıcak İçecekler", description: "Kahve ve çay çeşitleri", sortOrder: 1, icon: "coffee" },
    { name: "Soğuk İçecekler", description: "Serinletici içecekler", sortOrder: 2, icon: "glass-water" },
    { name: "Tatlılar", description: "Taze günlük tatlılar", sortOrder: 3, icon: "cake" },
    { name: "Atıştırmalıklar", description: "Hafif yiyecekler", sortOrder: 4, icon: "sandwich" },
  ]

  const categories: Record<string, { id: string }> = {}
  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: {
        id: `${demoTenant.id}-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `${demoTenant.id}-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
        tenantId: demoTenant.id,
        ...cat,
      },
    })
    categories[cat.name] = category
  }
  console.log("✅ Categories created")

  // Menü öğeleri
  const menuItems = [
    // Sıcak İçecekler
    {
      name: "Türk Kahvesi",
      description: "Geleneksel Türk kahvesi, orta şekerli",
      price: 45,
      category: "Sıcak İçecekler",
      tags: ["popular"],
      sortOrder: 1,
    },
    {
      name: "Latte",
      description: "Espresso ve buharla ısıtılmış süt",
      price: 65,
      category: "Sıcak İçecekler",
      tags: [],
      sortOrder: 2,
    },
    {
      name: "Cappuccino",
      description: "Espresso, süt köpüğü ve kakao",
      price: 60,
      category: "Sıcak İçecekler",
      tags: ["popular"],
      sortOrder: 3,
    },
    {
      name: "Filtre Kahve",
      description: "Taze çekilmiş çekirdeklerden",
      price: 40,
      category: "Sıcak İçecekler",
      tags: [],
      sortOrder: 4,
    },
    {
      name: "Sıcak Çikolata",
      description: "Belçika çikolatası ile hazırlanan",
      price: 55,
      category: "Sıcak İçecekler",
      tags: [],
      sortOrder: 5,
    },
    {
      name: "Çay",
      description: "Demlik çay, bardak",
      price: 20,
      category: "Sıcak İçecekler",
      tags: [],
      sortOrder: 6,
    },

    // Soğuk İçecekler
    {
      name: "Ice Latte",
      description: "Soğuk süt ve espresso",
      price: 70,
      category: "Soğuk İçecekler",
      tags: [],
      sortOrder: 1,
    },
    {
      name: "Limonata",
      description: "Taze sıkılmış limon, nane",
      price: 45,
      category: "Soğuk İçecekler",
      tags: ["vegan"],
      sortOrder: 2,
    },
    {
      name: "Ice Americano",
      description: "Buzlu americano",
      price: 55,
      category: "Soğuk İçecekler",
      tags: [],
      sortOrder: 3,
    },
    {
      name: "Smoothie",
      description: "Mevsim meyveleri ile",
      price: 65,
      category: "Soğuk İçecekler",
      tags: ["vegan", "new"],
      sortOrder: 4,
    },

    // Tatlılar
    {
      name: "Cheesecake",
      description: "New York usulü, frambuaz soslu",
      price: 85,
      category: "Tatlılar",
      tags: ["popular"],
      sortOrder: 1,
    },
    {
      name: "Tiramisu",
      description: "İtalyan usulü, mascarpone kremalı",
      price: 90,
      category: "Tatlılar",
      tags: [],
      sortOrder: 2,
    },
    {
      name: "Brownie",
      description: "Sıcak çikolatalı, dondurma ile",
      price: 75,
      category: "Tatlılar",
      tags: [],
      sortOrder: 3,
    },
    {
      name: "San Sebastian",
      description: "Basque usulü cheesecake",
      price: 95,
      category: "Tatlılar",
      tags: ["new"],
      sortOrder: 4,
    },

    // Atıştırmalıklar
    {
      name: "Sandviç",
      description: "Tavuklu, avokadolu, tam buğday ekmeği",
      price: 95,
      category: "Atıştırmalıklar",
      tags: [],
      sortOrder: 1,
    },
    {
      name: "Tost",
      description: "Kaşarlı, domatesli, közlenmiş biber",
      price: 65,
      category: "Atıştırmalıklar",
      tags: [],
      sortOrder: 2,
    },
    {
      name: "Kurabiye (3'lü)",
      description: "Günlük taze pişirilmiş",
      price: 35,
      category: "Atıştırmalıklar",
      tags: ["vegan"],
      sortOrder: 3,
    },
    {
      name: "Muffin",
      description: "Çikolatalı veya yaban mersinli",
      price: 45,
      category: "Atıştırmalıklar",
      tags: [],
      sortOrder: 4,
    },
  ]

  for (const item of menuItems) {
    const categoryId = categories[item.category].id
    await prisma.menuItem.upsert({
      where: {
        id: `${demoTenant.id}-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `${demoTenant.id}-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
        tenantId: demoTenant.id,
        categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        tags: item.tags,
        sortOrder: item.sortOrder,
        isAvailable: true,
      },
    })
  }
  console.log("✅ Menu items created")

  // Masalar
  const tables = [
    { number: "1", area: "İç Mekan", capacity: 2 },
    { number: "2", area: "İç Mekan", capacity: 4 },
    { number: "3", area: "İç Mekan", capacity: 4 },
    { number: "4", area: "İç Mekan", capacity: 6 },
    { number: "5", area: "Bahçe", capacity: 4 },
    { number: "6", area: "Bahçe", capacity: 4 },
    { number: "7", area: "Bahçe", capacity: 6 },
    { number: "8", area: "Teras", capacity: 2 },
    { number: "9", area: "Teras", capacity: 2 },
    { number: "10", area: "Teras", capacity: 4 },
  ]

  for (const table of tables) {
    await prisma.table.upsert({
      where: {
        tenantId_number: {
          tenantId: demoTenant.id,
          number: table.number,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        number: table.number,
        area: table.area,
        capacity: table.capacity,
        qrCode: `/customer/menu/${demoTenant.slug}?table=${table.number}`,
        isActive: true,
      },
    })
  }
  console.log("✅ Tables created")

  // Super Admin kullanıcısı
  const adminPasswordHash = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@platform.com" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "admin@platform.com",
      passwordHash: adminPasswordHash,
      name: "Platform Admin",
      role: "SUPER_ADMIN",
      tenantId: null,
    },
  })

  // Demo tenant admin
  const demoPasswordHash = await bcrypt.hash("demo123", 12)
  await prisma.user.upsert({
    where: { email: "demo@kafe.com" },
    update: { passwordHash: demoPasswordHash },
    create: {
      email: "demo@kafe.com",
      passwordHash: demoPasswordHash,
      name: "Demo Kafe Admin",
      role: "TENANT_ADMIN",
      tenantId: demoTenant.id,
    },
  })
  console.log("✅ Users created")

  // Demo müşteriler
  const customers = [
    { phone: "5551234567", name: "Ahmet Yılmaz", loyaltyPoints: 150, totalSpent: 450, visitCount: 5 },
    { phone: "5559876543", name: "Ayşe Kaya", loyaltyPoints: 80, totalSpent: 280, visitCount: 3 },
    { phone: "5554443322", name: "Mehmet Demir", loyaltyPoints: 320, totalSpent: 890, visitCount: 12 },
  ]

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: {
        tenantId_phone: {
          tenantId: demoTenant.id,
          phone: customer.phone,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        ...customer,
        lastVisitAt: new Date(),
      },
    })
  }
  console.log("✅ Demo customers created")

  // Loyalty Config
  await prisma.loyaltyConfig.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      tenantId: demoTenant.id,
      pointsPerSpent: 1, // Her 1 TL = 1 puan
      minSpendForPoints: 20, // Min 20 TL harcama
      silverThreshold: 500,
      goldThreshold: 1500,
      platinumThreshold: 5000,
      bronzeMultiplier: 1,
      silverMultiplier: 1.25,
      goldMultiplier: 1.5,
      platinumMultiplier: 2,
      pointsValidityDays: 365,
      birthdayBonusPoints: 100,
      isActive: true,
    },
  })
  console.log("✅ Loyalty config created")

  // Loyalty Rewards
  const rewards = [
    {
      name: "Ücretsiz Türk Kahvesi",
      description: "Herhangi bir siparişe ücretsiz Türk kahvesi",
      rewardType: "free_item",
      pointsCost: 100,
      value: 45,
      minTier: "BRONZE" as const,
    },
    {
      name: "%10 İndirim",
      description: "Toplam hesabınızda %10 indirim",
      rewardType: "discount_percent",
      pointsCost: 200,
      value: 10,
      minTier: "BRONZE" as const,
    },
    {
      name: "Ücretsiz Tatlı",
      description: "Cheesecake veya Tiramisu",
      rewardType: "free_item",
      pointsCost: 300,
      value: 90,
      minTier: "SILVER" as const,
    },
    {
      name: "%20 İndirim",
      description: "Toplam hesabınızda %20 indirim",
      rewardType: "discount_percent",
      pointsCost: 500,
      value: 20,
      minTier: "SILVER" as const,
    },
    {
      name: "50 TL İndirim",
      description: "100 TL üzeri siparişlerde 50 TL indirim",
      rewardType: "discount_amount",
      pointsCost: 750,
      value: 50,
      minTier: "GOLD" as const,
    },
    {
      name: "VIP Kahvaltı",
      description: "2 kişilik kahvaltı tabağı hediye",
      rewardType: "free_item",
      pointsCost: 1000,
      value: 250,
      minTier: "PLATINUM" as const,
    },
  ]

  for (const reward of rewards) {
    await prisma.loyaltyReward.upsert({
      where: {
        id: `${demoTenant.id}-${reward.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `${demoTenant.id}-${reward.name.toLowerCase().replace(/\s+/g, "-")}`,
        tenantId: demoTenant.id,
        ...reward,
        isActive: true,
      },
    })
  }
  console.log("✅ Loyalty rewards created")

  console.log("\n🎉 Seeding completed!")
  console.log("\n📝 Demo bilgileri:")
  console.log("   Menü URL: /customer/menu/demo-kafe?table=1")
  console.log("   Super Admin: admin@platform.com / admin123")
  console.log("   Restaurant: demo@kafe.com / demo123")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

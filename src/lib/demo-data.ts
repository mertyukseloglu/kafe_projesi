/**
 * Centralized Demo Data
 * Used as fallback when database is not available
 * This allows the app to work in demo mode without a database connection
 */

// ============================================
// DASHBOARD DEMO DATA
// ============================================
export const DEMO_DASHBOARD_STATS = {
  activeOrders: 3,
  pendingOrders: 1,
  todayRevenue: 1250,
  todayOrders: 18,
  occupiedTables: 6,
  totalTables: 10,
  monthlyOrders: 342,
  monthlyLimit: -1,
  revenueChange: 12.5,
  customers: 45,
}

export const DEMO_LOYALTY = {
  totalPoints: 12500,
  tiers: { BRONZE: 25, SILVER: 12, GOLD: 6, PLATINUM: 2 },
}

export const DEMO_SESSIONS = {
  today: 23,
  avgPageViews: 4.2,
  avgItemViews: 8.5,
}

// ============================================
// ORDERS DEMO DATA
// ============================================
export const DEMO_ORDERS = [
  {
    id: "1",
    orderNumber: "S4A2B1",
    table: "3",
    items: [
      { name: "Latte", quantity: 1 },
      { name: "Cheesecake", quantity: 1 },
    ],
    total: 150,
    status: "PREPARING",
    paymentStatus: "PENDING",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    orderNumber: "S4A2B2",
    table: "7",
    items: [
      { name: "Türk Kahvesi", quantity: 2 },
      { name: "Brownie", quantity: 1 },
    ],
    total: 165,
    status: "PENDING",
    paymentStatus: "PENDING",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "S4A2B3",
    table: "1",
    items: [
      { name: "Cappuccino", quantity: 1 },
      { name: "Sandviç", quantity: 1 },
    ],
    total: 155,
    status: "READY",
    paymentStatus: "PENDING",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    orderNumber: "S4A2B4",
    table: "5",
    items: [
      { name: "Espresso", quantity: 2 },
      { name: "Tiramisu", quantity: 1 },
    ],
    total: 195,
    status: "COMPLETED",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    orderNumber: "S4A2B5",
    table: null,
    items: [{ name: "Paket Kahve", quantity: 3 }],
    total: 180,
    status: "DELIVERED",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    customerName: "Ahmet Y.",
  },
]

// ============================================
// MENU ITEMS DEMO DATA
// ============================================
export const DEMO_CATEGORIES = [
  { id: "cat-1", name: "Sıcak İçecekler", sortOrder: 0 },
  { id: "cat-2", name: "Soğuk İçecekler", sortOrder: 1 },
  { id: "cat-3", name: "Tatlılar", sortOrder: 2 },
  { id: "cat-4", name: "Atıştırmalıklar", sortOrder: 3 },
]

export const DEMO_MENU_ITEMS = [
  {
    id: "item-1",
    name: "Latte",
    description: "Espresso ve sütlü kremalı kahve",
    price: 65,
    categoryId: "cat-1",
    category: { name: "Sıcak İçecekler" },
    isAvailable: true,
    tags: ["vegan-opsiyonlu", "popüler"],
    allergens: ["süt"],
    prepTime: 5,
    calories: 150,
  },
  {
    id: "item-2",
    name: "Türk Kahvesi",
    description: "Geleneksel Türk kahvesi",
    price: 45,
    categoryId: "cat-1",
    category: { name: "Sıcak İçecekler" },
    isAvailable: true,
    tags: ["geleneksel"],
    prepTime: 8,
    calories: 5,
  },
  {
    id: "item-3",
    name: "Cappuccino",
    description: "İtalyan usulü köpüklü kahve",
    price: 60,
    categoryId: "cat-1",
    category: { name: "Sıcak İçecekler" },
    isAvailable: true,
    allergens: ["süt"],
    prepTime: 5,
    calories: 120,
  },
  {
    id: "item-4",
    name: "Espresso",
    description: "Yoğun ve aromatik",
    price: 40,
    categoryId: "cat-1",
    category: { name: "Sıcak İçecekler" },
    isAvailable: true,
    prepTime: 3,
    calories: 3,
  },
  {
    id: "item-5",
    name: "Ice Latte",
    description: "Buzlu süt ve espresso",
    price: 70,
    categoryId: "cat-2",
    category: { name: "Soğuk İçecekler" },
    isAvailable: true,
    allergens: ["süt"],
    prepTime: 5,
    calories: 180,
  },
  {
    id: "item-6",
    name: "Cheesecake",
    description: "Ev yapımı cheesecake",
    price: 85,
    categoryId: "cat-3",
    category: { name: "Tatlılar" },
    isAvailable: true,
    tags: ["popüler"],
    allergens: ["süt", "yumurta", "gluten"],
    prepTime: 2,
    calories: 350,
  },
  {
    id: "item-7",
    name: "Brownie",
    description: "Çikolatalı brownie",
    price: 75,
    categoryId: "cat-3",
    category: { name: "Tatlılar" },
    isAvailable: true,
    allergens: ["süt", "yumurta", "gluten"],
    prepTime: 2,
    calories: 400,
  },
  {
    id: "item-8",
    name: "Tiramisu",
    description: "İtalyan usulü tiramisu",
    price: 95,
    categoryId: "cat-3",
    category: { name: "Tatlılar" },
    isAvailable: false,
    allergens: ["süt", "yumurta", "gluten"],
    prepTime: 2,
    calories: 450,
  },
  {
    id: "item-9",
    name: "Sandviç",
    description: "Taze sebzeli sandviç",
    price: 95,
    categoryId: "cat-4",
    category: { name: "Atıştırmalıklar" },
    isAvailable: true,
    allergens: ["gluten"],
    prepTime: 10,
    calories: 380,
  },
]

export const DEMO_POPULAR_ITEMS = [
  { id: "item-1", name: "Latte", quantity: 45, price: 65 },
  { id: "item-2", name: "Türk Kahvesi", quantity: 38, price: 45 },
  { id: "item-6", name: "Cheesecake", quantity: 24, price: 85 },
  { id: "item-3", name: "Cappuccino", quantity: 22, price: 60 },
]

// ============================================
// TABLES DEMO DATA
// ============================================
export const DEMO_TABLES = [
  { id: "t-1", number: 1, capacity: 4, location: "İç Mekan", status: "OCCUPIED", isActive: true },
  { id: "t-2", number: 2, capacity: 2, location: "İç Mekan", status: "AVAILABLE", isActive: true },
  { id: "t-3", number: 3, capacity: 6, location: "İç Mekan", status: "OCCUPIED", isActive: true },
  { id: "t-4", number: 4, capacity: 4, location: "Teras", status: "AVAILABLE", isActive: true },
  { id: "t-5", number: 5, capacity: 4, location: "Teras", status: "RESERVED", isActive: true },
  { id: "t-6", number: 6, capacity: 8, location: "VIP", status: "AVAILABLE", isActive: true },
  { id: "t-7", number: 7, capacity: 2, location: "Bar", status: "OCCUPIED", isActive: true },
  { id: "t-8", number: 8, capacity: 4, location: "İç Mekan", status: "CLEANING", isActive: false },
]

// ============================================
// CUSTOMERS DEMO DATA
// ============================================
export const DEMO_CUSTOMERS = [
  {
    id: "c-1",
    name: "Ahmet Yılmaz",
    phone: "+90 532 123 4567",
    email: "ahmet@email.com",
    visitCount: 15,
    totalSpent: 1250,
    loyaltyTier: "GOLD",
    loyaltyPoints: 1875,
    lastVisitAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c-2",
    name: "Ayşe Demir",
    phone: "+90 533 234 5678",
    email: "ayse@email.com",
    visitCount: 8,
    totalSpent: 680,
    loyaltyTier: "SILVER",
    loyaltyPoints: 680,
    lastVisitAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c-3",
    name: "Mehmet Kaya",
    phone: "+90 534 345 6789",
    visitCount: 3,
    totalSpent: 245,
    loyaltyTier: "BRONZE",
    loyaltyPoints: 245,
    lastVisitAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c-4",
    name: "Fatma Şahin",
    phone: "+90 535 456 7890",
    email: "fatma@email.com",
    visitCount: 42,
    totalSpent: 5200,
    loyaltyTier: "PLATINUM",
    loyaltyPoints: 7800,
    lastVisitAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ============================================
// CAMPAIGNS DEMO DATA
// ============================================
export const DEMO_CAMPAIGNS = [
  {
    id: "camp-1",
    name: "Hoşgeldin İndirimi",
    type: "DISCOUNT_PERCENT",
    discountValue: 15,
    status: "ACTIVE",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 45,
    totalRevenue: 8750,
  },
  {
    id: "camp-2",
    name: "Yaz Kampanyası",
    type: "DISCOUNT_AMOUNT",
    discountValue: 25,
    status: "SCHEDULED",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 0,
    totalRevenue: 0,
  },
  {
    id: "camp-3",
    name: "Kahve Festivali",
    type: "DISCOUNT_PERCENT",
    discountValue: 10,
    status: "ENDED",
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 120,
    totalRevenue: 15600,
  },
]

// ============================================
// COUPONS DEMO DATA
// ============================================
export const DEMO_COUPONS: Record<string, { type: string; value: number; min?: number }> = {
  HOSGELDIN: { type: "percent", value: 15, min: 50 },
  YAZ2024: { type: "amount", value: 25, min: 100 },
  KAHVE10: { type: "percent", value: 10 },
  INDIRIM20: { type: "percent", value: 20 },
}

// ============================================
// REPORTS DEMO DATA
// ============================================
export const DEMO_DAILY_SALES = [
  { date: "Pzt", revenue: 1250, orders: 18 },
  { date: "Sal", revenue: 1480, orders: 22 },
  { date: "Çar", revenue: 1120, orders: 15 },
  { date: "Per", revenue: 1650, orders: 25 },
  { date: "Cum", revenue: 1890, orders: 28 },
  { date: "Cmt", revenue: 2100, orders: 32 },
  { date: "Paz", revenue: 1950, orders: 29 },
]

export const DEMO_CATEGORY_BREAKDOWN = [
  { name: "Sıcak İçecekler", revenue: 4500, percentage: 45 },
  { name: "Soğuk İçecekler", revenue: 2200, percentage: 22 },
  { name: "Tatlılar", revenue: 2000, percentage: 20 },
  { name: "Atıştırmalıklar", revenue: 1300, percentage: 13 },
]

export const DEMO_TOP_PRODUCTS = [
  { name: "Latte", quantity: 145, revenue: 9425 },
  { name: "Türk Kahvesi", quantity: 120, revenue: 5400 },
  { name: "Cheesecake", quantity: 85, revenue: 7225 },
  { name: "Cappuccino", quantity: 78, revenue: 4680 },
  { name: "Ice Latte", quantity: 65, revenue: 4550 },
]

// ============================================
// STOCK DEMO DATA
// ============================================
export const DEMO_STOCK_ITEMS = [
  { id: "s-1", name: "Kahve Çekirdeği", unit: "kg", currentStock: 25, minStock: 10, status: "OK" },
  { id: "s-2", name: "Süt", unit: "lt", currentStock: 8, minStock: 15, status: "LOW" },
  { id: "s-3", name: "Şeker", unit: "kg", currentStock: 12, minStock: 5, status: "OK" },
  { id: "s-4", name: "Kek Malzemesi", unit: "kg", currentStock: 3, minStock: 5, status: "CRITICAL" },
  { id: "s-5", name: "Bardak (S)", unit: "adet", currentStock: 450, minStock: 200, status: "OK" },
  { id: "s-6", name: "Bardak (M)", unit: "adet", currentStock: 180, minStock: 200, status: "LOW" },
]

// ============================================
// WAITER CALLS DEMO DATA
// ============================================
export const DEMO_WAITER_CALLS = [
  {
    id: "wc-1",
    tableNumber: 3,
    type: "CALL_WAITER",
    status: "PENDING",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "wc-2",
    tableNumber: 7,
    type: "REQUEST_BILL",
    status: "ACKNOWLEDGED",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "wc-3",
    tableNumber: 1,
    type: "CALL_WAITER",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
]

// ============================================
// ANALYTICS DEMO DATA
// ============================================
export const DEMO_ANALYTICS = {
  kpis: {
    avgOrderValue: 87.5,
    avgOrderValueChange: 5.2,
    customerRetention: 68,
    retentionChange: 3.1,
    tableTurnover: 4.2,
    turnoverChange: -0.3,
    peakHourRevenue: 2450,
    peakHourChange: 12.5,
  },
  peakHours: [
    { hour: "08:00", orders: 5, revenue: 425 },
    { hour: "09:00", orders: 12, revenue: 1050 },
    { hour: "10:00", orders: 18, revenue: 1575 },
    { hour: "11:00", orders: 15, revenue: 1312 },
    { hour: "12:00", orders: 25, revenue: 2187 },
    { hour: "13:00", orders: 22, revenue: 1925 },
    { hour: "14:00", orders: 16, revenue: 1400 },
    { hour: "15:00", orders: 14, revenue: 1225 },
    { hour: "16:00", orders: 18, revenue: 1575 },
    { hour: "17:00", orders: 20, revenue: 1750 },
    { hour: "18:00", orders: 24, revenue: 2100 },
    { hour: "19:00", orders: 28, revenue: 2450 },
    { hour: "20:00", orders: 22, revenue: 1925 },
    { hour: "21:00", orders: 15, revenue: 1312 },
  ],
  weeklyTrends: [
    { week: "1. Hafta", revenue: 8500, orders: 120 },
    { week: "2. Hafta", revenue: 9200, orders: 135 },
    { week: "3. Hafta", revenue: 8800, orders: 128 },
    { week: "4. Hafta", revenue: 10500, orders: 152 },
  ],
}

// ============================================
// HELPER FUNCTIONS
// ============================================
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const diff = Math.floor((Date.now() - dateObj.getTime()) / 1000 / 60)
  if (diff < 1) return "Az önce"
  if (diff < 60) return `${diff} dk önce`
  if (diff < 60 * 24) return `${Math.floor(diff / 60)} saat önce`
  return `${Math.floor(diff / 60 / 24)} gün önce`
}

export function formatCurrency(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR")}`
}

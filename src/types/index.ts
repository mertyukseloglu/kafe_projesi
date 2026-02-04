// Type tanımlamaları

// User Roles
export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "MANAGER" | "STAFF"

// Order Status
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED"

// Subscription Status
export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED"

// Payment Status
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

// Menu Item Allergens
export type Allergen =
  | "gluten"
  | "dairy"
  | "nuts"
  | "shellfish"
  | "eggs"
  | "soy"
  | "fish"
  | "sesame"

// Menu Item Tags
export type MenuTag =
  | "vegan"
  | "vegetarian"
  | "spicy"
  | "popular"
  | "new"
  | "glutenFree"

// Tenant Settings
export interface TenantSettings {
  workingHours?: {
    [day: string]: { open: string; close: string } | null
  }
  theme?: {
    primaryColor?: string
    logo?: string
  }
  currency?: string
  language?: string
  aiSettings?: {
    enabled?: boolean
    personality?: string
    welcomeMessage?: string
  }
}

// Menu Item Variation
export interface MenuVariation {
  name: string
  options: {
    name: string
    price: number
  }[]
}

// Menu Item Extra
export interface MenuExtra {
  name: string
  price: number
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Session User
export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId?: string
  tenantSlug?: string
}

// ==========================================
// MENÜ TİPLERİ
// ==========================================

export interface Category {
  id: string
  name: string
  description?: string
  sortOrder: number
  isActive: boolean
  tenantId: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  categoryId: string
  category?: Category
  tags?: string[]
  allergens?: Allergen[]
  isAvailable: boolean
  tenantId: string
}

// Müşteri arayüzü için basitleştirilmiş menü item
export interface MenuItemPublic {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  categoryId: string
  tags?: string[]
}

// ==========================================
// SEPET TİPLERİ
// ==========================================

export interface CartItem extends MenuItemPublic {
  quantity: number
  notes?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

// ==========================================
// SİPARİŞ TİPLERİ
// ==========================================

export interface OrderItemInput {
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export interface CreateOrderInput {
  tenantSlug: string
  tableNumber?: string
  items: OrderItemInput[]
  customerName?: string
  customerPhone?: string
  notes?: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  tenantId: string
  tableId?: string
  tableNumber?: string
  customerId?: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  paymentStatus: PaymentStatus
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// TENANT TİPLERİ
// ==========================================

export interface Tenant {
  id: string
  name: string
  slug: string
  logo?: string
  primaryColor?: string
  phone?: string
  email?: string
  address?: string
  isActive: boolean
  settings?: TenantSettings
}

export interface TenantPublic {
  id: string
  name: string
  slug: string
  logo?: string
  primaryColor?: string
  phone?: string
}

// ==========================================
// MASA TİPLERİ
// ==========================================

export interface Table {
  id: string
  number: string
  name?: string
  qrCode: string
  isActive: boolean
  tenantId: string
}

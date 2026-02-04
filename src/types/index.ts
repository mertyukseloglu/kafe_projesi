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

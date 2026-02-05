import { NextResponse, NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import type { ApiResponse } from "@/types"

// ============================================
// RATE LIMITING
// ============================================
// In-memory rate limiter (for single-instance deployments)
// For production with multiple instances, use Redis/Upstash
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyPrefix?: string // Prefix for rate limit key
}

export function getClientIP(request: NextRequest): string {
  // Check various headers for client IP
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  // Fallback
  return "unknown"
}

export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetIn: number } {
  const ip = getClientIP(request)
  const key = `${options.keyPrefix || "rl"}:${ip}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    })
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetIn: options.windowMs,
    }
  }

  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  }
}

// Pre-configured rate limiters for common use cases
export const RATE_LIMITS = {
  // Public order creation - 10 requests per hour per IP
  publicOrders: { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: "order" },
  // Coupon validation - 5 requests per minute per IP
  couponValidate: { windowMs: 60 * 1000, maxRequests: 5, keyPrefix: "coupon" },
  // Registration - 3 requests per hour per IP
  registration: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "register" },
  // Login attempts - 5 per minute per IP
  login: { windowMs: 60 * 1000, maxRequests: 5, keyPrefix: "login" },
  // General API - 100 requests per minute per IP
  general: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: "api" },
}

export function rateLimitResponse(resetIn: number) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(resetIn / 1000)),
        "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000 + resetIn / 1000)),
      },
    }
  )
}

// ============================================
// INPUT VALIDATION HELPERS
// ============================================
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return ""
  // Remove potential XSS vectors
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .slice(0, 10000) // Limit length
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string") return null
  const trimmed = email.trim().toLowerCase()
  // Basic email regex - more permissive than RFC but catches most issues
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    return null
  }
  return trimmed
}

export function validatePrice(price: unknown): number | null {
  if (typeof price === "number") {
    if (isNaN(price) || price < 0 || price > 1000000) return null
    return Math.round(price * 100) / 100 // Round to 2 decimal places
  }
  if (typeof price === "string") {
    const parsed = parseFloat(price.replace(",", "."))
    if (isNaN(parsed) || parsed < 0 || parsed > 1000000) return null
    return Math.round(parsed * 100) / 100
  }
  return null
}

export function validatePositiveInt(value: unknown, max: number = 10000): number | null {
  const num = typeof value === "string" ? parseInt(value, 10) : value
  if (typeof num !== "number" || isNaN(num) || num < 0 || num > max) {
    return null
  }
  return Math.floor(num)
}

// ============================================
// AUTHENTICATION
// ============================================
// Get authenticated session with tenant check
export async function getAuthenticatedSession() {
  const session = await auth()

  if (!session) {
    return { session: null, error: "Oturum açmanız gerekiyor" }
  }

  if (!session.user.tenantId && session.user.role !== "SUPER_ADMIN") {
    return { session: null, error: "Tenant bilgisi bulunamadı" }
  }

  return { session, error: null }
}

// Standard error response
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status }
  )
}

// Standard success response
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    { status }
  )
}

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

// Tenant roles that can manage restaurant data
export const TENANT_MANAGER_ROLES = ["TENANT_ADMIN", "MANAGER"]
export const TENANT_ALL_ROLES = ["TENANT_ADMIN", "MANAGER", "STAFF"]

// ============================================
// AUTH MIDDLEWARE WRAPPER
// ============================================
// Simplifies API route auth checks - reduces duplicate code
// Note: These wrappers are provided for convenience but current routes
// use direct auth checks. Can be adopted incrementally.

export interface AuthenticatedContext {
  user: {
    id: string
    email: string
    name: string
    role: string
    tenantId: string | null
    tenantSlug: string | null
  }
}

export interface TenantAuthContext extends AuthenticatedContext {
  tenantId: string
}

type TenantApiHandler<T = unknown> = (
  request: NextRequest,
  context: TenantAuthContext
) => Promise<NextResponse<ApiResponse<T>>>

type AdminApiHandler<T = unknown> = (
  request: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse<ApiResponse<T>>>

export function withTenantAuth<T = unknown>(
  handler: TenantApiHandler<T>,
  requiredRoles: string[] = TENANT_ALL_ROLES
) {
  return async (request: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    const { session, error } = await getAuthenticatedSession()

    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401) as NextResponse<ApiResponse<T>>
    }

    if (!hasRole(session.user.role, requiredRoles)) {
      return errorResponse("Bu işlem için yetkiniz yok", 403) as NextResponse<ApiResponse<T>>
    }

    const tenantId = session.user.tenantId
    if (!tenantId) {
      return errorResponse("Tenant bilgisi bulunamadı", 400) as NextResponse<ApiResponse<T>>
    }

    return handler(request, { user: session.user, tenantId })
  }
}

export function withAdminAuth<T = unknown>(handler: AdminApiHandler<T>) {
  return async (request: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    const { session, error } = await getAuthenticatedSession()

    if (error || !session) {
      return errorResponse(error || "Yetkisiz erişim", 401) as NextResponse<ApiResponse<T>>
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Bu işlem için admin yetkisi gerekli", 403) as NextResponse<ApiResponse<T>>
    }

    return handler(request, { user: session.user })
  }
}

// ============================================
// RESPONSE HELPERS WITH CACHE
// ============================================
export function successResponseWithCache<T>(
  data: T,
  maxAge: number = 3600,
  status: number = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    {
      status,
      headers: {
        "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
      },
    }
  )
}

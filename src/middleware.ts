import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import {
  getSubdomainFromHost,
  getSubdomainType,
  isReservedSubdomain,
} from "@/lib/subdomain"

// Routes that require authentication
const protectedRoutes = ["/panel", "/admin"]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"]

// Static file patterns to skip
const STATIC_PATTERNS = [
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/sw.js",
  "/icons",
  "/images",
]

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const host = request.headers.get("host") || "localhost:3000"

  // Skip static files
  if (STATIC_PATTERNS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // =============================================
  // SUBDOMAIN ROUTING (Production)
  // =============================================
  const subdomain = getSubdomainFromHost(host)
  const subdomainType = getSubdomainType(subdomain)

  // Handle tenant subdomains (e.g., demo-kafe.restoai.com)
  if (subdomainType === "tenant" && subdomain) {
    // Rewrite to customer menu page
    const url = request.nextUrl.clone()

    // Root path → menu page
    if (pathname === "/" || pathname === "") {
      url.pathname = `/customer/menu/${subdomain}`
      // Preserve query params (e.g., ?table=1)
      const response = NextResponse.rewrite(url)
      // Add tenant slug header for API routes
      response.headers.set("x-tenant-slug", subdomain)
      return response
    }

    // Other paths under tenant subdomain → customer routes
    // e.g., /order/123 → /customer/order/123 with tenant context
    if (!pathname.startsWith("/customer/") && !pathname.startsWith("/api/")) {
      url.pathname = `/customer/menu/${subdomain}${pathname}`
      const response = NextResponse.rewrite(url)
      response.headers.set("x-tenant-slug", subdomain)
      return response
    }
  }

  // Handle panel subdomain (panel.restoai.com)
  if (subdomainType === "panel") {
    const session = await auth()

    // Not authenticated → redirect to login on main domain
    if (!session && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // SUPER_ADMIN should use admin panel
    if (session?.user.role === "SUPER_ADMIN") {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/dashboard"
      return NextResponse.redirect(url)
    }

    // Rewrite to /panel routes
    if (!pathname.startsWith("/panel") && !pathname.startsWith("/login") && !pathname.startsWith("/register") && !pathname.startsWith("/api/")) {
      const url = request.nextUrl.clone()
      url.pathname = `/panel${pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // Handle admin subdomain (admin.restoai.com)
  if (subdomainType === "admin") {
    const session = await auth()

    // Not authenticated or not SUPER_ADMIN → redirect
    if (!session || session.user.role !== "SUPER_ADMIN") {
      if (!pathname.startsWith("/login")) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(url)
      }
    }

    // Rewrite to /admin routes
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/login") && !pathname.startsWith("/api/")) {
      const url = request.nextUrl.clone()
      url.pathname = `/admin${pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // =============================================
  // PATH-BASED ROUTING (Development / Fallback)
  // =============================================
  const session = await auth()

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if route is auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If protected route and not authenticated, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If auth route and already authenticated, redirect to appropriate dashboard
  if (isAuthRoute && session) {
    const redirectUrl =
      session.user.role === "SUPER_ADMIN"
        ? "/admin/dashboard"
        : "/panel/dashboard"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Role-based route protection
  if (session) {
    // SUPER_ADMIN routes - only SUPER_ADMIN can access /admin/*
    if (pathname.startsWith("/admin") && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/panel/dashboard", request.url))
    }

    // Tenant routes - SUPER_ADMIN should use admin panel
    if (pathname.startsWith("/panel") && session.user.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files and specific patterns
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
}

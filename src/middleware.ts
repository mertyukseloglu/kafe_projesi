import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Routes that require authentication
const protectedRoutes = ["/panel", "/admin"]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
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
    const redirectUrl = session.user.role === "SUPER_ADMIN"
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
    // Match all routes except static files and api
    "/((?!api|_next/static|_next/image|favicon.ico|customer).*)",
  ],
}

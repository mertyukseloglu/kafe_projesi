import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { ApiResponse } from "@/types"

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

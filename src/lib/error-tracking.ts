/**
 * Error Tracking Utility
 *
 * This file provides a centralized error tracking interface.
 * When Sentry is integrated, update the implementation here.
 *
 * Setup Sentry:
 * 1. npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Add SENTRY_DSN to .env
 * 4. Update this file to use Sentry SDK
 */

interface ErrorContext {
  userId?: string
  tenantId?: string
  page?: string
  action?: string
  extra?: Record<string, unknown>
}

/**
 * Capture and report an error to the error tracking service
 */
export function captureError(error: Error, context?: ErrorContext): void {
  // In development, just log to console
  if (process.env.NODE_ENV === "development") {
    console.error("[Error Tracking]", error.message, context)
    return
  }

  // In production, send to error tracking service
  // TODO: Implement Sentry integration
  // Example:
  // Sentry.captureException(error, {
  //   tags: {
  //     page: context?.page,
  //     action: context?.action,
  //   },
  //   user: {
  //     id: context?.userId,
  //   },
  //   extra: {
  //     tenantId: context?.tenantId,
  //     ...context?.extra,
  //   },
  // })

  // Fallback: log to console in production until Sentry is set up
  console.error("[Production Error]", {
    message: error.message,
    stack: error.stack,
    context,
  })
}

/**
 * Capture a message (non-error event) to the error tracking service
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: ErrorContext
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${level.toUpperCase()}]`, message, context)
    return
  }

  // TODO: Implement Sentry integration
  // Sentry.captureMessage(message, level)

  console.log(`[Production ${level}]`, message, context)
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; name?: string } | null): void {
  // TODO: Implement Sentry integration
  // if (user) {
  //   Sentry.setUser({ id: user.id, email: user.email, username: user.name })
  // } else {
  //   Sentry.setUser(null)
  // }
}

/**
 * Set tenant context for error tracking
 */
export function setTenant(tenantId: string | null): void {
  // TODO: Implement Sentry integration
  // Sentry.setTag("tenant_id", tenantId)
}

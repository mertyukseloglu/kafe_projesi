/**
 * Subdomain Utilities
 * Handles subdomain-based multi-tenancy routing
 *
 * Development: Uses path-based fallback (/s/[slug] or query param ?tenant=slug)
 * Production: Uses real subdomains ([slug].domain.com)
 */

// Root domain from environment (e.g., "restoai.com")
// In development, this defaults to "localhost:3000"
export function getRootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
}

// Protocol (http for localhost, https for production)
export function getProtocol(): string {
  if (process.env.NEXT_PUBLIC_PROTOCOL) {
    return process.env.NEXT_PUBLIC_PROTOCOL
  }
  // Auto-detect based on domain
  const domain = getRootDomain()
  return domain.includes("localhost") ? "http" : "https"
}

// Reserved subdomains that should not be used for tenants
const RESERVED_SUBDOMAINS = [
  "www",
  "panel",
  "admin",
  "api",
  "app",
  "mail",
  "cdn",
  "static",
  "assets",
  "images",
  "docs",
  "help",
  "support",
  "blog",
]

/**
 * Check if a subdomain is reserved (system use)
 */
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())
}

/**
 * Extract subdomain from host header
 * Examples:
 *   "demo-kafe.restoai.com" → "demo-kafe"
 *   "panel.restoai.com" → "panel"
 *   "restoai.com" → null
 *   "localhost:3000" → null
 */
export function getSubdomainFromHost(host: string): string | null {
  const rootDomain = getRootDomain()

  // Remove port if present for comparison
  const hostWithoutPort = host.split(":")[0]
  const rootWithoutPort = rootDomain.split(":")[0]

  // Exact match with root domain (no subdomain)
  if (hostWithoutPort === rootWithoutPort || hostWithoutPort === `www.${rootWithoutPort}`) {
    return null
  }

  // Check if host ends with root domain
  if (!host.endsWith(rootDomain) && !hostWithoutPort.endsWith(rootWithoutPort)) {
    // For localhost development, check for special patterns
    // e.g., "demo-kafe.localhost:3000"
    if (hostWithoutPort.endsWith(".localhost")) {
      const subdomain = hostWithoutPort.replace(".localhost", "")
      return subdomain || null
    }
    return null
  }

  // Extract subdomain
  const subdomain = hostWithoutPort.replace(`.${rootWithoutPort}`, "")

  // If subdomain equals host, there was no subdomain
  if (subdomain === hostWithoutPort || !subdomain) {
    return null
  }

  return subdomain
}

/**
 * Get tenant slug from various sources (subdomain, path, query)
 * Priority: subdomain > path > query param
 */
export function getTenantSlugFromRequest(
  host: string,
  pathname: string,
  searchParams?: URLSearchParams
): string | null {
  // 1. Try subdomain first
  const subdomain = getSubdomainFromHost(host)
  if (subdomain && !isReservedSubdomain(subdomain)) {
    return subdomain
  }

  // 2. Check for development path pattern: /s/[slug] or /tenant/[slug]
  const pathMatch = pathname.match(/^\/(s|tenant)\/([a-z0-9-]+)/i)
  if (pathMatch) {
    return pathMatch[2]
  }

  // 3. Check for legacy path pattern: /customer/menu/[slug]
  const customerMatch = pathname.match(/^\/customer\/menu\/([a-z0-9-]+)/i)
  if (customerMatch) {
    return customerMatch[1]
  }

  // 4. Check query parameter (development fallback)
  if (searchParams?.get("tenant")) {
    return searchParams.get("tenant")
  }

  return null
}

/**
 * Generate full URL for a tenant's customer-facing site
 */
export function getTenantUrl(slug: string, path: string = ""): string {
  const protocol = getProtocol()
  const rootDomain = getRootDomain()

  // In development (localhost), use path-based URL
  if (rootDomain.includes("localhost")) {
    const port = rootDomain.includes(":") ? "" : ":3000"
    return `${protocol}://${rootDomain}${port}/customer/menu/${slug}${path}`
  }

  // In production, use subdomain
  return `${protocol}://${slug}.${rootDomain}${path}`
}

/**
 * Generate QR code URL for a table
 */
export function getTableQrUrl(slug: string, tableNumber: number): string {
  const protocol = getProtocol()
  const rootDomain = getRootDomain()

  // In development, use path-based URL
  if (rootDomain.includes("localhost")) {
    return `${protocol}://${rootDomain}/customer/menu/${slug}?table=${tableNumber}`
  }

  // In production, use subdomain
  return `${protocol}://${slug}.${rootDomain}?table=${tableNumber}`
}

/**
 * Generate panel URL
 */
export function getPanelUrl(path: string = ""): string {
  const protocol = getProtocol()
  const rootDomain = getRootDomain()

  // In development, use path-based URL
  if (rootDomain.includes("localhost")) {
    return `${protocol}://${rootDomain}/panel${path}`
  }

  // In production, use subdomain
  return `${protocol}://panel.${rootDomain}${path}`
}

/**
 * Generate admin URL
 */
export function getAdminUrl(path: string = ""): string {
  const protocol = getProtocol()
  const rootDomain = getRootDomain()

  // In development, use path-based URL
  if (rootDomain.includes("localhost")) {
    return `${protocol}://${rootDomain}/admin${path}`
  }

  // In production, use subdomain
  return `${protocol}://admin.${rootDomain}${path}`
}

/**
 * Check if current environment supports real subdomains
 */
export function supportsRealSubdomains(): boolean {
  const rootDomain = getRootDomain()
  return !rootDomain.includes("localhost")
}

/**
 * Get the type of subdomain
 */
export function getSubdomainType(
  subdomain: string | null
): "tenant" | "panel" | "admin" | "root" | "reserved" {
  if (!subdomain) return "root"
  if (subdomain === "panel") return "panel"
  if (subdomain === "admin") return "admin"
  if (isReservedSubdomain(subdomain)) return "reserved"
  return "tenant"
}

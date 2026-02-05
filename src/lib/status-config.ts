import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  XCircle,
  Truck,
  Ban,
  AlertCircle,
  Users,
  UserCheck,
  Utensils,
  Coffee,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Calendar,
  type LucideIcon,
} from "lucide-react"

// ============================================
// ORDER STATUS CONFIGURATION
// ============================================
export interface StatusConfig {
  label: string
  color: string
  bgColor: string
  textColor: string
  icon: LucideIcon
}

export const ORDER_STATUS: Record<string, StatusConfig> = {
  PENDING: {
    label: "Bekliyor",
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-200",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Onaylandı",
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-200",
    icon: CheckCircle2,
  },
  PREPARING: {
    label: "Hazırlanıyor",
    color: "orange",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-800 dark:text-orange-200",
    icon: ChefHat,
  },
  READY: {
    label: "Hazır",
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-200",
    icon: Package,
  },
  DELIVERED: {
    label: "Teslim Edildi",
    color: "emerald",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-800 dark:text-emerald-200",
    icon: Truck,
  },
  COMPLETED: {
    label: "Tamamlandı",
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "İptal",
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-200",
    icon: XCircle,
  },
}

// Active order statuses (for filtering)
export const ACTIVE_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY"]

// ============================================
// TABLE STATUS CONFIGURATION
// ============================================
export const TABLE_STATUS: Record<string, StatusConfig> = {
  AVAILABLE: {
    label: "Müsait",
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-200",
    icon: Coffee,
  },
  OCCUPIED: {
    label: "Dolu",
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-200",
    icon: Users,
  },
  RESERVED: {
    label: "Rezerve",
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-200",
    icon: Calendar,
  },
  CLEANING: {
    label: "Temizleniyor",
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-200",
    icon: Utensils,
  },
}

// ============================================
// CAMPAIGN STATUS CONFIGURATION
// ============================================
export const CAMPAIGN_STATUS: Record<string, StatusConfig> = {
  DRAFT: {
    label: "Taslak",
    color: "gray",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    textColor: "text-gray-800 dark:text-gray-200",
    icon: PauseCircle,
  },
  SCHEDULED: {
    label: "Planlandı",
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-200",
    icon: Calendar,
  },
  ACTIVE: {
    label: "Aktif",
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-200",
    icon: PlayCircle,
  },
  PAUSED: {
    label: "Duraklatıldı",
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-200",
    icon: PauseCircle,
  },
  ENDED: {
    label: "Sona Erdi",
    color: "gray",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    textColor: "text-gray-800 dark:text-gray-200",
    icon: StopCircle,
  },
  CANCELLED: {
    label: "İptal",
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-200",
    icon: Ban,
  },
}

// ============================================
// PAYMENT STATUS CONFIGURATION
// ============================================
export const PAYMENT_STATUS: Record<string, StatusConfig> = {
  PENDING: {
    label: "Bekliyor",
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-200",
    icon: Clock,
  },
  PAID: {
    label: "Ödendi",
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-200",
    icon: CheckCircle2,
  },
  REFUNDED: {
    label: "İade Edildi",
    color: "orange",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-800 dark:text-orange-200",
    icon: AlertCircle,
  },
  FAILED: {
    label: "Başarısız",
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-200",
    icon: XCircle,
  },
}

// ============================================
// WAITER CALL STATUS CONFIGURATION
// ============================================
export const WAITER_CALL_STATUS: Record<string, StatusConfig> = {
  PENDING: {
    label: "Bekliyor",
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-200",
    icon: AlertCircle,
  },
  ACKNOWLEDGED: {
    label: "Alındı",
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-200",
    icon: UserCheck,
  },
  COMPLETED: {
    label: "Tamamlandı",
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-200",
    icon: CheckCircle2,
  },
}

// ============================================
// LOYALTY TIERS CONFIGURATION
// ============================================
export const LOYALTY_TIERS = {
  BRONZE: {
    label: "Bronz",
    color: "amber",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-800 dark:text-amber-200",
    minPoints: 0,
    multiplier: 1,
  },
  SILVER: {
    label: "Gümüş",
    color: "gray",
    bgColor: "bg-gray-200 dark:bg-gray-700/50",
    textColor: "text-gray-700 dark:text-gray-200",
    minPoints: 500,
    multiplier: 1.25,
  },
  GOLD: {
    label: "Altın",
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-200",
    minPoints: 1500,
    multiplier: 1.5,
  },
  PLATINUM: {
    label: "Platin",
    color: "slate",
    bgColor: "bg-slate-200 dark:bg-slate-700/50",
    textColor: "text-slate-700 dark:text-slate-200",
    minPoints: 5000,
    multiplier: 2,
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================
export function getStatusConfig(
  statusType: "order" | "table" | "campaign" | "payment" | "waiterCall",
  status: string
): StatusConfig | undefined {
  const configs = {
    order: ORDER_STATUS,
    table: TABLE_STATUS,
    campaign: CAMPAIGN_STATUS,
    payment: PAYMENT_STATUS,
    waiterCall: WAITER_CALL_STATUS,
  }
  return configs[statusType]?.[status]
}

export function getStatusLabel(
  statusType: "order" | "table" | "campaign" | "payment" | "waiterCall",
  status: string
): string {
  return getStatusConfig(statusType, status)?.label || status
}

export function getStatusBadgeClasses(
  statusType: "order" | "table" | "campaign" | "payment" | "waiterCall",
  status: string
): string {
  const config = getStatusConfig(statusType, status)
  if (!config) return "bg-gray-100 text-gray-800"
  return `${config.bgColor} ${config.textColor}`
}

"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RefreshCw, Loader2, Download, Plus, LucideIcon } from "lucide-react"

export interface PageHeaderAction {
  label: string
  icon?: LucideIcon
  onClick?: () => void
  href?: string
  variant?: "default" | "outline" | "ghost" | "destructive"
  disabled?: boolean
  loading?: boolean
}

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: PageHeaderAction[]
  onRefresh?: () => void | Promise<void>
  isRefreshing?: boolean
  isLoading?: boolean
  className?: string
  children?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  onRefresh,
  isRefreshing,
  isLoading,
  className,
  children,
}: PageHeaderProps) {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    }
  }

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onRefresh && (
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            )}
            {isLoading ? "Yükleniyor..." : "Yenile"}
          </Button>
        )}
        {actions?.map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              variant={action.variant || "default"}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href}>
                  {action.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {Icon && !action.loading && <Icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </a>
              ) : (
                <>
                  {action.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {Icon && !action.loading && <Icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

// Convenience wrapper for pages with export functionality
export function PageHeaderWithExport({
  onExport,
  isExporting,
  exportLabel = "Dışa Aktar",
  ...props
}: PageHeaderProps & {
  onExport?: () => void
  isExporting?: boolean
  exportLabel?: string
}) {
  const exportAction: PageHeaderAction = {
    label: exportLabel,
    icon: Download,
    onClick: onExport,
    variant: "outline",
    loading: isExporting,
    disabled: isExporting,
  }

  return (
    <PageHeader
      {...props}
      actions={[...(props.actions || []), exportAction]}
    />
  )
}

// Convenience wrapper for pages with add functionality
export function PageHeaderWithAdd({
  onAdd,
  addLabel = "Ekle",
  ...props
}: PageHeaderProps & {
  onAdd?: () => void
  addLabel?: string
}) {
  const addAction: PageHeaderAction = {
    label: addLabel,
    icon: Plus,
    onClick: onAdd,
  }

  return (
    <PageHeader
      {...props}
      actions={[...(props.actions || []), addAction]}
    />
  )
}

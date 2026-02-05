"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"

export interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon | ReactNode
  description?: string
  change?: number
  changeLabel?: string
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "purple"
  className?: string
  valueClassName?: string
  isLoading?: boolean
}

const variantStyles = {
  default: "",
  primary: "border-primary/20 bg-primary/5",
  success: "border-green-500/20 bg-green-50 dark:bg-green-950/20",
  warning: "border-yellow-500/20 bg-yellow-50 dark:bg-yellow-950/20",
  danger: "border-red-500/20 bg-red-50 dark:bg-red-950/20",
  purple: "border-purple-500/20 bg-purple-50 dark:bg-purple-950/20",
}

const iconVariantStyles = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-green-500",
  warning: "text-yellow-500",
  danger: "text-red-500",
  purple: "text-purple-500",
}

export function StatCard({
  label,
  value,
  icon,
  description,
  change,
  changeLabel,
  variant = "default",
  className,
  valueClassName,
  isLoading,
}: StatCardProps) {
  const IconComponent = icon as LucideIcon

  const renderIcon = () => {
    if (!icon) return null

    // Check if it's a Lucide icon component
    if (typeof icon === "function") {
      return <IconComponent className={cn("h-4 w-4", iconVariantStyles[variant])} />
    }

    // Otherwise render as ReactNode
    return icon
  }

  const renderChange = () => {
    if (change === undefined) return null

    const isPositive = change >= 0
    const TrendIcon = isPositive ? TrendingUp : TrendingDown
    const colorClass = isPositive ? "text-green-600" : "text-red-600"

    return (
      <span className={colorClass}>
        <TrendIcon className="mr-1 inline h-3 w-3" />
        {isPositive ? "+" : ""}{change}%
      </span>
    )
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{label}</CardDescription>
        {renderIcon()}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <div className={cn("text-3xl font-bold", valueClassName)}>
            {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
          </div>
        )}
        {(description || change !== undefined) && (
          <p className="text-xs text-muted-foreground">
            {renderChange()}
            {change !== undefined && changeLabel && " "}
            {changeLabel}
            {!change && description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Convenience components for common use cases
export function RevenueStatCard({
  label,
  value,
  change,
  changeLabel = "düne göre",
  ...props
}: Omit<StatCardProps, "icon" | "value"> & { value: number }) {
  const isPositive = (change ?? 0) >= 0
  return (
    <StatCard
      label={label}
      value={`₺${value.toLocaleString("tr-TR")}`}
      icon={isPositive ? TrendingUp : TrendingDown}
      change={change}
      changeLabel={changeLabel}
      variant={isPositive ? "success" : "danger"}
      {...props}
    />
  )
}

export function CountStatCard({
  label,
  value,
  icon,
  description,
  ...props
}: Omit<StatCardProps, "value"> & { value: number }) {
  return (
    <StatCard
      label={label}
      value={value}
      icon={icon}
      description={description}
      {...props}
    />
  )
}

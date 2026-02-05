"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface FilterOption<T extends string = string> {
  value: T
  label: string
  icon?: LucideIcon
  count?: number
  color?: string
}

export interface FilterButtonGroupProps<T extends string = string> {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "pills"
  className?: string
  showCount?: boolean
  allowDeselect?: boolean
}

export function FilterButtonGroup<T extends string = string>({
  options,
  value,
  onChange,
  size = "default",
  variant = "default",
  className,
  showCount = false,
  allowDeselect = false,
}: FilterButtonGroupProps<T>) {
  const handleClick = (optionValue: T) => {
    if (allowDeselect && value === optionValue) {
      onChange("" as T)
    } else {
      onChange(optionValue)
    }
  }

  const variantStyles = {
    default: "rounded-lg",
    outline: "rounded-lg border",
    pills: "rounded-full",
  }

  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    default: "h-9 px-4 text-sm",
    lg: "h-10 px-6 text-base",
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = value === option.value
        const Icon = option.icon

        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => handleClick(option.value)}
            className={cn(
              variantStyles[variant],
              sizeStyles[size],
              isSelected && option.color && `bg-${option.color}-500 hover:bg-${option.color}-600`,
              !isSelected && option.color && `text-${option.color}-600 border-${option.color}-200 hover:bg-${option.color}-50`
            )}
          >
            {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
            {option.label}
            {showCount && option.count !== undefined && (
              <span className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                isSelected ? "bg-white/20" : "bg-muted"
              )}>
                {option.count}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
}

// Pre-configured filter groups for common use cases
export interface StatusFilterOption {
  value: string
  label: string
  color: string
  icon?: LucideIcon
}

export function StatusFilterGroup({
  statuses,
  value,
  onChange,
  showAll = true,
  allLabel = "Tümü",
}: {
  statuses: StatusFilterOption[]
  value: string
  onChange: (value: string) => void
  showAll?: boolean
  allLabel?: string
}) {
  const options: FilterOption[] = [
    ...(showAll ? [{ value: "", label: allLabel }] : []),
    ...statuses.map((s) => ({
      value: s.value,
      label: s.label,
      icon: s.icon,
      color: s.color,
    })),
  ]

  return (
    <FilterButtonGroup
      options={options}
      value={value}
      onChange={onChange}
      variant="pills"
      size="sm"
    />
  )
}

// Time range filter commonly used in reports/analytics
export type TimeRange = "today" | "week" | "month" | "year" | "custom"

export function TimeRangeFilter({
  value,
  onChange,
  showCustom = false,
}: {
  value: TimeRange
  onChange: (value: TimeRange) => void
  showCustom?: boolean
}) {
  const options: FilterOption<TimeRange>[] = [
    { value: "today", label: "Bugün" },
    { value: "week", label: "Bu Hafta" },
    { value: "month", label: "Bu Ay" },
    { value: "year", label: "Bu Yıl" },
    ...(showCustom ? [{ value: "custom" as TimeRange, label: "Özel" }] : []),
  ]

  return (
    <FilterButtonGroup
      options={options}
      value={value}
      onChange={onChange}
      variant="outline"
      size="sm"
    />
  )
}

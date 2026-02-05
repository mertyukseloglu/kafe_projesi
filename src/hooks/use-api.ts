"use client"

import { useState, useEffect, useCallback } from "react"

interface UseFetchOptions {
  immediate?: boolean
}

interface UseFetchResult<T> {
  data: T | null
  error: string | null
  isLoading: boolean
  refetch: () => Promise<void>
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = { immediate: true }
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Bir hata oluştu")
      }
    } catch {
      setError("Bağlantı hatası")
    } finally {
      setIsLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (options.immediate) {
      fetchData()
    }
  }, [fetchData, options.immediate])

  return { data, error, isLoading, refetch: fetchData }
}

// Mutation hook for POST/PATCH/DELETE
interface MutateOptions {
  method?: "POST" | "PATCH" | "DELETE"
  body?: string
}

interface UseMutationResult<T> {
  mutate: (url: string, options?: MutateOptions) => Promise<T | null>
  data: T | null
  error: string | null
  isLoading: boolean
}

export function useMutation<T = unknown>(): UseMutationResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutate = useCallback(
    async (url: string, options: MutateOptions = {}): Promise<T | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          method: options.method || "POST",
          headers: { "Content-Type": "application/json" },
          body: options.body,
        })

        const result = await response.json()

        if (result.success) {
          setData(result.data)
          return result.data
        } else {
          setError(result.error || "Bir hata oluştu")
          return null
        }
      } catch {
        setError("Bağlantı hatası")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { mutate, data, error, isLoading }
}

// API endpoints
export const API = {
  tenant: {
    dashboard: "/api/tenant/dashboard",
    orders: "/api/tenant/orders",
    menu: "/api/tenant/menu",
    categories: "/api/tenant/categories",
    tables: "/api/tenant/tables",
    customers: "/api/tenant/customers",
    settings: "/api/tenant/settings",
    reports: "/api/tenant/reports",
  },
  admin: {
    dashboard: "/api/admin/dashboard",
    restaurants: "/api/admin/restaurants",
    subscriptions: "/api/admin/subscriptions",
    payments: "/api/admin/payments",
    settings: "/api/admin/settings",
  },
  public: {
    menu: "/api/public/menu",
    orders: "/api/public/orders",
    chat: "/api/public/chat",
    waiterCall: "/api/public/waiter-call",
  },
}

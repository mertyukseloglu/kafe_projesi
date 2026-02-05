"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  CreditCard,
  HelpCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  User,
  Timer,
  XCircle,
} from "lucide-react"

// Call status configuration
const statusConfig = {
  PENDING: {
    label: "Bekliyor",
    color: "bg-red-500",
    textColor: "text-red-600",
    bgLight: "bg-red-50 border-red-200",
  },
  ACKNOWLEDGED: {
    label: "Alındı",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgLight: "bg-yellow-50 border-yellow-200",
  },
  RESOLVED: {
    label: "Çözüldü",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgLight: "bg-green-50 border-green-200",
  },
  CANCELLED: {
    label: "İptal",
    color: "bg-gray-500",
    textColor: "text-gray-600",
    bgLight: "bg-gray-50 border-gray-200",
  },
}

// Reason configuration
const reasonConfig = {
  order: { label: "Sipariş Vermek", icon: MessageSquare, color: "text-blue-500" },
  payment: { label: "Ödeme", icon: CreditCard, color: "text-green-500" },
  assistance: { label: "Yardım", icon: HelpCircle, color: "text-orange-500" },
  other: { label: "Diğer", icon: Phone, color: "text-gray-500" },
}

type CallStatus = keyof typeof statusConfig
type CallReason = keyof typeof reasonConfig

interface WaiterCall {
  id: string
  tableNumber: string
  reason: CallReason
  message?: string
  status: CallStatus
  assignedTo?: string
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
}

// Demo data
const generateDemoCalls = (): WaiterCall[] => [
  {
    id: "1",
    tableNumber: "5",
    reason: "order",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    tableNumber: "3",
    reason: "payment",
    message: "Kartla ödeme yapmak istiyorum",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    tableNumber: "8",
    reason: "assistance",
    status: "ACKNOWLEDGED",
    assignedTo: "Ahmet",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    tableNumber: "12",
    reason: "other",
    message: "Mama sandalyesi lazım",
    status: "RESOLVED",
    assignedTo: "Ayşe",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
]

export default function WaiterCallsPage() {
  const { data: session } = useSession()
  const [calls, setCalls] = useState<WaiterCall[]>(generateDemoCalls())
  const [filter, setFilter] = useState<CallStatus | "ALL">("ALL")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate elapsed time
  const getElapsedTime = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Az önce"
    if (minutes < 60) return `${minutes} dk`
    return `${Math.floor(minutes / 60)} sa ${minutes % 60} dk`
  }

  // Acknowledge call
  const acknowledgeCall = useCallback(async (callId: string) => {
    setCalls(prev => prev.map(call =>
      call.id === callId
        ? {
            ...call,
            status: "ACKNOWLEDGED" as CallStatus,
            assignedTo: session?.user?.name || "Personel",
            acknowledgedAt: new Date().toISOString(),
          }
        : call
    ))

    // Sync with API
    try {
      await fetch("/api/tenant/waiter-calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, status: "ACKNOWLEDGED" }),
      })
    } catch {
      // Optimistic update already applied
    }
  }, [session])

  // Resolve call
  const resolveCall = useCallback(async (callId: string) => {
    setCalls(prev => prev.map(call =>
      call.id === callId
        ? {
            ...call,
            status: "RESOLVED" as CallStatus,
            resolvedAt: new Date().toISOString(),
          }
        : call
    ))

    // Sync with API
    try {
      await fetch("/api/tenant/waiter-calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, status: "RESOLVED" }),
      })
    } catch {
      // Optimistic update already applied
    }
  }, [])

  // Cancel call
  const cancelCall = useCallback(async (callId: string) => {
    if (!confirm("Çağrıyı iptal etmek istediğinize emin misiniz?")) return

    setCalls(prev => prev.map(call =>
      call.id === callId
        ? { ...call, status: "CANCELLED" as CallStatus }
        : call
    ))
  }, [])

  // Refresh calls
  const refreshCalls = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch("/api/tenant/waiter-calls")
      const data = await res.json()
      if (data.success && data.data) {
        setCalls(data.data)
      }
    } catch {
      // Use demo data
      setCalls(generateDemoCalls())
    }
    setIsRefreshing(false)
  }

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCalls()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Filter calls
  const filteredCalls = filter === "ALL"
    ? calls.filter(c => c.status !== "RESOLVED" && c.status !== "CANCELLED")
    : calls.filter(c => c.status === filter)

  // Count by status
  const statusCounts = {
    PENDING: calls.filter(c => c.status === "PENDING").length,
    ACKNOWLEDGED: calls.filter(c => c.status === "ACKNOWLEDGED").length,
    RESOLVED: calls.filter(c => c.status === "RESOLVED").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Garson Çağrıları</h1>
          <p className="text-muted-foreground">Masa çağrılarını yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? "bg-green-50" : "bg-red-50"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCalls}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-red-500">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">{statusCounts.PENDING}</div>
              <p className="text-sm text-red-600">Bekleyen Çağrı</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">{statusCounts.ACKNOWLEDGED}</div>
              <p className="text-sm text-yellow-600">İşleniyor</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{statusCounts.RESOLVED}</div>
              <p className="text-sm text-green-600">Çözüldü (Bugün)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
        >
          Aktif ({calls.filter(c => !["RESOLVED", "CANCELLED"].includes(c.status)).length})
        </Button>
        <Button
          variant={filter === "PENDING" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("PENDING")}
          className={filter === "PENDING" ? "bg-red-500 hover:bg-red-600" : ""}
        >
          <Bell className="mr-1 h-4 w-4" />
          Bekleyen ({statusCounts.PENDING})
        </Button>
        <Button
          variant={filter === "ACKNOWLEDGED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ACKNOWLEDGED")}
          className={filter === "ACKNOWLEDGED" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
        >
          <Clock className="mr-1 h-4 w-4" />
          İşleniyor ({statusCounts.ACKNOWLEDGED})
        </Button>
        <Button
          variant={filter === "RESOLVED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("RESOLVED")}
          className={filter === "RESOLVED" ? "bg-green-500 hover:bg-green-600" : ""}
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Çözüldü ({statusCounts.RESOLVED})
        </Button>
      </div>

      {/* Calls List */}
      {filteredCalls.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h3 className="text-xl font-semibold">Bekleyen çağrı yok</h3>
          <p className="mt-2 text-muted-foreground">Yeni çağrılar burada görünecek</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCalls.map((call) => {
            const status = statusConfig[call.status]
            const reason = reasonConfig[call.reason]
            const ReasonIcon = reason.icon
            const elapsed = getElapsedTime(call.createdAt)
            const isUrgent = call.status === "PENDING" &&
              (Date.now() - new Date(call.createdAt).getTime()) > 3 * 60 * 1000

            return (
              <Card
                key={call.id}
                className={`overflow-hidden border-2 ${status.bgLight} ${isUrgent ? "animate-pulse" : ""}`}
              >
                {/* Card Header */}
                <div className={`${status.color} px-4 py-3 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">Masa {call.tableNumber}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm opacity-90">
                      <Timer className="h-4 w-4" />
                      {elapsed}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Reason */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${reason.color}`}>
                      <ReasonIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{reason.label}</p>
                      <p className={`text-sm ${status.textColor}`}>{status.label}</p>
                    </div>
                  </div>

                  {/* Message if exists */}
                  {call.message && (
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <MessageSquare className="inline h-4 w-4 mr-2 text-muted-foreground" />
                      {call.message}
                    </div>
                  )}

                  {/* Assigned to */}
                  {call.assignedTo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{call.assignedTo} tarafından alındı</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {call.status === "PENDING" && (
                      <>
                        <Button
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                          onClick={() => acknowledgeCall(call.id)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Al
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => cancelCall(call.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {call.status === "ACKNOWLEDGED" && (
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => resolveCall(call.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Tamamlandı
                      </Button>
                    )}
                    {call.status === "RESOLVED" && (
                      <Badge variant="outline" className="w-full justify-center py-2 text-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Çözüldü
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground">
        Sayfa otomatik olarak yenileniyor • Son güncelleme: {new Date().toLocaleTimeString("tr-TR")}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Code,
  Link2,
  Copy,
  Check,
  ChevronRight,
  Webhook,
  Key,
  AlertCircle,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  Play,
  ExternalLink,
} from "lucide-react"

interface WebhookConfig {
  id: string
  url: string
  secret: string
  events: string[]
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  failureCount: number
}

type WebhookEvent = {
  event: string
  description: string
}

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<"webhooks" | "api">("webhooks")
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [availableEvents, setAvailableEvents] = useState<WebhookEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewWebhook, setShowNewWebhook] = useState(false)
  const [newWebhookUrl, setNewWebhookUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const fetchWebhooks = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tenant/webhooks")
      const data = await res.json()
      if (data.success) {
        setWebhooks(data.data.webhooks || [])
        setAvailableEvents(data.data.availableEvents || [])
      }
    } catch {
      // Demo data
      setAvailableEvents([
        { event: "order.created", description: "Yeni sipariş oluşturulduğunda" },
        { event: "order.updated", description: "Sipariş durumu güncellendiğinde" },
        { event: "order.completed", description: "Sipariş tamamlandığında" },
        { event: "menu.updated", description: "Menü güncellendiğinde" },
        { event: "stock.low", description: "Stok düşük seviyeye indiğinde" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const createWebhook = async () => {
    if (!newWebhookUrl || selectedEvents.length === 0) return

    setLoading(true)
    try {
      const res = await fetch("/api/tenant/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newWebhookUrl, events: selectedEvents }),
      })
      const data = await res.json()
      if (data.success) {
        setWebhooks(prev => [...prev, data.data.webhook])
        setShowNewWebhook(false)
        setNewWebhookUrl("")
        setSelectedEvents([])
      }
    } catch {
      console.error("Webhook create failed")
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async (webhookId: string) => {
    setTestingWebhook(webhookId)
    try {
      await fetch("/api/tenant/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId, action: "test" }),
      })
    } catch {
      console.error("Webhook test failed")
    } finally {
      setTestingWebhook(null)
    }
  }

  const deleteWebhook = async (webhookId: string) => {
    try {
      await fetch(`/api/tenant/webhooks?id=${webhookId}`, { method: "DELETE" })
      setWebhooks(prev => prev.filter(w => w.id !== webhookId))
    } catch {
      console.error("Webhook delete failed")
    }
  }

  // Fetch on mount
  useState(() => {
    fetchWebhooks()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API & Entegrasyon</h1>
        <p className="text-slate-500">Webhook ve API entegrasyonlarını yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "webhooks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Webhook className="h-4 w-4" />
          Webhooks
        </button>
        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "api"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code className="h-4 w-4" />
          API Dokümantasyonu
        </button>
      </div>

      {/* Webhooks Tab */}
      {activeTab === "webhooks" && (
        <div className="space-y-6">
          {/* Webhook List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Webhook Endpoints</CardTitle>
                <CardDescription>Harici sistemlere gerçek zamanlı bildirimler gönderin</CardDescription>
              </div>
              <Button onClick={() => setShowNewWebhook(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Webhook
              </Button>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p>Henüz webhook tanımlanmamış</p>
                  <p className="text-sm">İlk webhook&apos;unuzu oluşturun</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm bg-slate-100 px-2 py-0.5 rounded truncate">
                              {webhook.url}
                            </code>
                            <Badge variant={webhook.isActive ? "default" : "secondary"}>
                              {webhook.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Secret: {webhook.secret.slice(0, 15)}...
                            <button
                              onClick={() => copyToClipboard(webhook.secret, webhook.id)}
                              className="ml-2 text-primary hover:underline"
                            >
                              {copiedText === webhook.id ? (
                                <Check className="h-3 w-3 inline" />
                              ) : (
                                <Copy className="h-3 w-3 inline" />
                              )}
                            </button>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testWebhook(webhook.id)}
                            disabled={testingWebhook === webhook.id}
                          >
                            {testingWebhook === webhook.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => deleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Webhook Form */}
              {showNewWebhook && (
                <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                  <h4 className="font-medium mb-4">Yeni Webhook Oluştur</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Endpoint URL</label>
                      <input
                        type="url"
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                        placeholder="https://example.com/webhooks"
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">HTTPS zorunludur</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Event&apos;ler</label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableEvents.map((event) => (
                          <label
                            key={event.event}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                              selectedEvents.includes(event.event)
                                ? "border-primary bg-primary/5"
                                : "border-slate-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(event.event)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEvents((prev) => [...prev, event.event])
                                } else {
                                  setSelectedEvents((prev) => prev.filter((ev) => ev !== event.event))
                                }
                              }}
                              className="rounded"
                            />
                            <div>
                              <p className="text-sm font-medium">{event.event}</p>
                              <p className="text-xs text-muted-foreground">{event.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowNewWebhook(false)}>
                        İptal
                      </Button>
                      <Button onClick={createWebhook} disabled={loading || !newWebhookUrl || selectedEvents.length === 0}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Oluştur
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhook Payload Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Webhook Payload Örneği
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-slate-900 p-4 text-sm font-mono text-slate-100 overflow-x-auto">
                <pre>{`{
  "event": "order.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "orderId": "ord_123456",
    "tableNumber": "5",
    "items": [
      {
        "name": "Türk Kahvesi",
        "quantity": 2,
        "price": 45.00
      }
    ],
    "total": 90.00,
    "status": "PENDING"
  }
}`}</pre>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2">İmza Doğrulama</h4>
                <p className="text-sm text-blue-700">
                  Her webhook isteği <code className="bg-blue-100 px-1 rounded">X-Webhook-Signature</code> header&apos;ı ile gönderilir.
                  HMAC-SHA256 algoritması ile secret key kullanılarak oluşturulur.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Documentation Tab */}
      {activeTab === "api" && (
        <div className="space-y-6">
          {/* API Overview */}
          <Card>
            <CardHeader>
              <CardTitle>REST API</CardTitle>
              <CardDescription>
                Menü, sipariş ve müşteri verilerine programatik erişim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base URL */}
              <div>
                <label className="text-sm font-medium mb-2 block">Base URL</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-100 px-4 py-2 rounded-lg text-sm">
                    https://api.restoai.com/v1
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("https://api.restoai.com/v1", "base-url")}
                  >
                    {copiedText === "base-url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Authentication */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Authentication
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  API isteklerinde Bearer token kullanılır.
                </p>
                <div className="rounded-lg bg-slate-900 p-4 text-sm font-mono text-slate-100">
                  <code>Authorization: Bearer YOUR_API_KEY</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { method: "GET", path: "/menu", description: "Menü listesi" },
                  { method: "GET", path: "/menu/:id", description: "Menü detayı" },
                  { method: "POST", path: "/menu", description: "Yeni ürün ekle" },
                  { method: "PUT", path: "/menu/:id", description: "Ürün güncelle" },
                  { method: "DELETE", path: "/menu/:id", description: "Ürün sil" },
                  { method: "GET", path: "/orders", description: "Sipariş listesi" },
                  { method: "GET", path: "/orders/:id", description: "Sipariş detayı" },
                  { method: "PATCH", path: "/orders/:id/status", description: "Sipariş durumu güncelle" },
                  { method: "GET", path: "/categories", description: "Kategori listesi" },
                  { method: "GET", path: "/stock", description: "Stok durumu" },
                  { method: "PATCH", path: "/stock/:id", description: "Stok güncelle" },
                ].map((endpoint, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          endpoint.method === "GET"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : endpoint.method === "POST"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : endpoint.method === "PUT" || endpoint.method === "PATCH"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Kod Örnekleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">JavaScript / Node.js</h4>
                <div className="rounded-lg bg-slate-900 p-4 text-sm font-mono text-slate-100 overflow-x-auto">
                  <pre>{`const response = await fetch('https://api.restoai.com/v1/menu', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const menu = await response.json();`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Python</h4>
                <div className="rounded-lg bg-slate-900 p-4 text-sm font-mono text-slate-100 overflow-x-auto">
                  <pre>{`import requests

response = requests.get(
    'https://api.restoai.com/v1/menu',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
menu = response.json()`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">cURL</h4>
                <div className="rounded-lg bg-slate-900 p-4 text-sm font-mono text-slate-100 overflow-x-auto">
                  <pre>{`curl -X GET https://api.restoai.com/v1/menu \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Rate Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 text-center">
                  <p className="text-3xl font-bold text-primary">1000</p>
                  <p className="text-sm text-muted-foreground">İstek / saat</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 text-center">
                  <p className="text-3xl font-bold text-primary">100</p>
                  <p className="text-sm text-muted-foreground">İstek / dakika</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 text-center">
                  <p className="text-3xl font-bold text-primary">10MB</p>
                  <p className="text-sm text-muted-foreground">Max. payload</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

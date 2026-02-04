"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Save,
  Bot,
  Globe,
  CreditCard,
  Mail,
  Bell,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [aiConfig, setAiConfig] = useState({
    provider: "claude",
    apiKey: "sk-ant-api03-****",
    model: "claude-3-sonnet",
    maxTokens: 1024,
    temperature: 0.7,
  })

  const [platformConfig, setPlatformConfig] = useState({
    name: "AI Restaurant Platform",
    defaultCurrency: "TRY",
    defaultLanguage: "tr",
    trialDays: 14,
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert("Ayarlar kaydedildi!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Platform Ayarları</h1>
          <p className="text-slate-400">Genel yapılandırma ve entegrasyonlar</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Configuration */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-white">AI Yapılandırması</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Claude API bağlantı ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Provider</label>
              <select
                value={aiConfig.provider}
                onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              >
                <option value="claude">Anthropic Claude</option>
                <option value="openai">OpenAI GPT</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">API Key</label>
              <input
                type="password"
                value={aiConfig.apiKey}
                onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="sk-ant-api03-..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Model</label>
              <select
                value={aiConfig.model}
                onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              >
                <option value="claude-3-haiku">Claude 3 Haiku (Hızlı)</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet (Dengeli)</option>
                <option value="claude-3-opus">Claude 3 Opus (Güçlü)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Max Tokens</label>
                <input
                  type="number"
                  value={aiConfig.maxTokens}
                  onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={aiConfig.temperature}
                  onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>API bağlantısı aktif ve çalışıyor</span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-white">Platform Ayarları</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Genel platform yapılandırması
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Platform Adı</label>
              <input
                type="text"
                value={platformConfig.name}
                onChange={(e) => setPlatformConfig({ ...platformConfig, name: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Para Birimi</label>
                <select
                  value={platformConfig.defaultCurrency}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, defaultCurrency: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Varsayılan Dil</label>
                <select
                  value={platformConfig.defaultLanguage}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, defaultLanguage: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Deneme Süresi (gün)</label>
              <input
                type="number"
                value={platformConfig.trialDays}
                onChange={(e) => setPlatformConfig({ ...platformConfig, trialDays: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateway */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-white">Ödeme Gateway</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Ödeme sistemi entegrasyonu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Provider</label>
              <select className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none">
                <option value="">Seçin...</option>
                <option value="iyzico">iyzico</option>
                <option value="stripe">Stripe</option>
                <option value="paytr">PayTR</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">API Key</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="Henüz yapılandırılmadı"
                disabled
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>Ödeme sistemi henüz yapılandırılmadı</span>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-white">E-posta Ayarları</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Bildirim e-posta yapılandırması
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">SMTP Host</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="smtp.example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Port</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  placeholder="587"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Gönderen</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  placeholder="noreply@platform.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>E-posta sistemi henüz yapılandırılmadı</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

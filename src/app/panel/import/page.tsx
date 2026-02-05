"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  LayoutTemplate,
  Link2,
  Trash2,
  RefreshCw,
  X,
  Coffee,
  UtensilsCrossed,
  Pizza,
  Beer,
  Cake,
  ExternalLink,
} from "lucide-react"

type ImportTab = "csv" | "photos" | "templates" | "api"

interface MenuTemplate {
  id: string
  name: string
  description: string
  icon: string
  categoryCount: number
  itemCount: number
}

interface TemplateResult {
  success: boolean
  message?: string
  stats?: {
    categoriesCreated: number
    itemsCreated: number
  }
  error?: string
}

interface ImportResult {
  success: boolean
  imported?: number
  categories?: number
  items?: { id: string; name: string }[]
  error?: string
  demo?: boolean
}

interface PhotoResult {
  success: boolean
  total?: number
  matched?: number
  unmatched?: number
  results?: { filename: string; matched: boolean; itemName?: string }[]
  error?: string
  demo?: boolean
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<ImportTab>("csv")

  // CSV Import State
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<"add" | "replace">("add")
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Photo Import State
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
  const [photoResult, setPhotoResult] = useState<PhotoResult | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Template State
  const [templates, setTemplates] = useState<MenuTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateMode, setTemplateMode] = useState<"add" | "replace">("add")
  const [applyingTemplate, setApplyingTemplate] = useState(false)
  const [templateResult, setTemplateResult] = useState<TemplateResult | null>(null)

  // Load templates on mount
  useEffect(() => {
    if (activeTab === "templates" && templates.length === 0) {
      loadTemplates()
    }
  }, [activeTab])

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const res = await fetch("/api/tenant/import/templates")
      const data = await res.json()
      if (data.templates) {
        setTemplates(data.templates)
      }
    } catch {
      console.error("Failed to load templates")
    } finally {
      setLoadingTemplates(false)
    }
  }

  const getTemplateIcon = (icon: string) => {
    switch (icon) {
      case "☕": return Coffee
      case "🍽️": return UtensilsCrossed
      case "🍕": return Pizza
      case "🍺": return Beer
      case "🧁": return Cake
      default: return LayoutTemplate
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return

    setApplyingTemplate(true)
    setTemplateResult(null)

    try {
      const res = await fetch("/api/tenant/import/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          mode: templateMode,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setTemplateResult({
          success: true,
          message: data.message,
          stats: data.stats,
        })
        setSelectedTemplate(null)
      } else {
        setTemplateResult({
          success: false,
          error: data.error || "Şablon uygulanamadı",
        })
      }
    } catch {
      setTemplateResult({
        success: false,
        error: "Bağlantı hatası oluştu",
      })
    } finally {
      setApplyingTemplate(false)
    }
  }

  // CSV Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".txt"))) {
      setFile(droppedFile)
      setResult(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mode", importMode)

      const res = await fetch("/api/tenant/import/menu", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        setResult({
          success: true,
          imported: data.data.imported,
          categories: data.data.categories,
          items: data.data.items,
          demo: data.data.demo,
        })
        setFile(null)
      } else {
        setResult({
          success: false,
          error: data.error || "İçe aktarma başarısız",
        })
      }
    } catch {
      setResult({
        success: false,
        error: "Bağlantı hatası oluştu",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    window.location.href = "/api/tenant/import/menu"
  }

  // Photo Handlers
  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)
    )
    if (files.length > 0) {
      setPhotoFiles(prev => [...prev, ...files])
      setPhotoResult(null)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setPhotoFiles(prev => [...prev, ...files])
      setPhotoResult(null)
    }
  }

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handlePhotoUpload = async () => {
    if (photoFiles.length === 0) return

    setIsUploadingPhotos(true)
    setPhotoResult(null)

    try {
      const formData = new FormData()
      photoFiles.forEach(file => {
        formData.append("files", file)
      })

      const res = await fetch("/api/tenant/import/photos", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        setPhotoResult({
          success: true,
          total: data.data.total,
          matched: data.data.matched,
          unmatched: data.data.unmatched,
          results: data.data.results,
          demo: data.data.demo,
        })
        setPhotoFiles([])
      } else {
        setPhotoResult({
          success: false,
          error: data.error || "Yükleme başarısız",
        })
      }
    } catch {
      setPhotoResult({
        success: false,
        error: "Bağlantı hatası oluştu",
      })
    } finally {
      setIsUploadingPhotos(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Veri İçe Aktarma</h1>
        <p className="text-slate-500">Menü, kategori ve ürünlerinizi toplu olarak yükleyin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: "csv" as const, label: "CSV / Excel", icon: FileSpreadsheet },
          { id: "photos" as const, label: "Fotoğraflar", icon: Image },
          { id: "templates" as const, label: "Şablonlar", icon: LayoutTemplate },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
        <Link
          href="/panel/api-docs"
          className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link2 className="h-4 w-4" />
          API & Webhook
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* CSV Import Tab */}
      {activeTab === "csv" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              CSV ile Menü İçe Aktarma
            </CardTitle>
            <CardDescription>
              Menü ürünlerinizi CSV formatında yükleyin. Kategoriler otomatik oluşturulur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Download */}
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Şablon CSV İndir</p>
                  <p className="text-sm text-blue-700">Doğru format için örnek dosyayı indirin</p>
                </div>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                İndir
              </Button>
            </div>

            {/* Import Mode */}
            <div>
              <label className="text-sm font-medium mb-2 block">İçe Aktarma Modu</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setImportMode("add")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    importMode === "add"
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Upload className={`h-5 w-5 ${importMode === "add" ? "text-primary" : "text-slate-400"}`} />
                    <div className="text-left">
                      <p className="font-medium">Ekle</p>
                      <p className="text-sm text-muted-foreground">Mevcut menüye ürün ekle</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setImportMode("replace")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    importMode === "replace"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className={`h-5 w-5 ${importMode === "replace" ? "text-red-500" : "text-slate-400"}`} />
                    <div className="text-left">
                      <p className="font-medium">Değiştir</p>
                      <p className="text-sm text-muted-foreground">Mevcut menüyü sil ve yenile</p>
                    </div>
                  </div>
                </button>
              </div>
              {importMode === "replace" && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Dikkat: Bu işlem mevcut tüm menü ürünlerini silecektir!
                </p>
              )}
            </div>

            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-10 w-10 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFile(null)
                        setResult(null)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <Button onClick={handleImport} disabled={isImporting} className="px-8">
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        İçe Aktarılıyor...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        İçe Aktar
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-slate-400" />
                  <div>
                    <p className="text-lg font-medium">CSV dosyasını sürükleyip bırakın</p>
                    <p className="text-sm text-muted-foreground">veya</p>
                  </div>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Dosya Seç
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Desteklenen formatlar: .csv, .txt (UTF-8)
                  </p>
                </div>
              )}
            </div>

            {/* Import Result */}
            {result && (
              <div
                className={`rounded-lg p-4 ${
                  result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                {result.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">İçe Aktarma Başarılı!</span>
                      {result.demo && <Badge variant="outline">Demo</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                        <p className="text-muted-foreground">Ürün eklendi</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-2xl font-bold text-green-600">{result.categories}</p>
                        <p className="text-muted-foreground">Kategori</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{result.error}</span>
                  </div>
                )}
              </div>
            )}

            {/* CSV Format Guide */}
            <div className="rounded-lg bg-slate-50 p-4">
              <h4 className="font-medium mb-2">CSV Format Rehberi</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Zorunlu sütunlar:</strong> name, price, category</p>
                <p><strong>Opsiyonel sütunlar:</strong> description, tags, allergens, prepTime, calories, isAvailable, trackStock, stockQuantity, lowStockAlert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos Import Tab */}
      {activeTab === "photos" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Fotoğraf Toplu Yükleme
            </CardTitle>
            <CardDescription>
              Ürün fotoğraflarını toplu olarak yükleyin. Dosya adları ürün adlarıyla eşleştirilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info */}
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-4">
              <AlertCircle className="h-8 w-8 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Dosya Adlandırma</p>
                <p className="text-sm text-amber-700">
                  Fotoğraf dosya adları ürün adlarıyla eşleşmelidir. Örneğin &quot;turk-kahvesi.jpg&quot;
                  dosyası &quot;Türk Kahvesi&quot; ürünüyle eşleştirilir. Boşluklar yerine tire kullanın.
                </p>
              </div>
            </div>

            {/* Photo Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handlePhotoDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <div className="space-y-3">
                <Image className="h-12 w-12 mx-auto text-slate-400" />
                <div>
                  <p className="text-lg font-medium">Fotoğrafları sürükleyip bırakın</p>
                  <p className="text-sm text-muted-foreground">veya</p>
                </div>
                <Button variant="outline" onClick={() => photoInputRef.current?.click()}>
                  Fotoğraf Seç
                </Button>
                <p className="text-xs text-muted-foreground">
                  Desteklenen formatlar: JPEG, PNG, WebP, GIF (Maks. 5MB)
                </p>
              </div>
            </div>

            {/* Selected Photos */}
            {photoFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{photoFiles.length} fotoğraf seçildi</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPhotoFiles([])}
                    className="text-red-500"
                  >
                    Tümünü Kaldır
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photoFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border bg-slate-50"
                    >
                      <div className="aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePhoto(index)}
                          className="text-white hover:bg-white/20"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="p-2 text-xs truncate">{file.name}</div>
                    </div>
                  ))}
                </div>
                <Button onClick={handlePhotoUpload} disabled={isUploadingPhotos} className="w-full">
                  {isUploadingPhotos ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {photoFiles.length} Fotoğrafı Yükle
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Photo Upload Result */}
            {photoResult && (
              <div
                className={`rounded-lg p-4 ${
                  photoResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                {photoResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Yükleme Tamamlandı!</span>
                      {photoResult.demo && <Badge variant="outline">Demo</Badge>}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-slate-600">{photoResult.total}</p>
                        <p className="text-muted-foreground">Toplam</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{photoResult.matched}</p>
                        <p className="text-muted-foreground">Eşleşti</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">{photoResult.unmatched}</p>
                        <p className="text-muted-foreground">Eşleşmedi</p>
                      </div>
                    </div>
                    {photoResult.results && photoResult.results.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium mb-2">Sonuçlar:</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {photoResult.results.map((r, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              {r.matched ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-orange-600" />
                              )}
                              <span className={r.matched ? "text-green-700" : "text-orange-700"}>
                                {r.filename}
                                {r.matched && r.itemName && ` → ${r.itemName}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{photoResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Hazır Menü Şablonları
            </CardTitle>
            <CardDescription>
              İşletme türünüze uygun hazır şablondan seçerek hızlıca başlayın. Kategoriler ve ürünler otomatik oluşturulur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import Mode */}
            <div>
              <label className="text-sm font-medium mb-2 block">Uygulama Modu</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setTemplateMode("add")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    templateMode === "add"
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Upload className={`h-5 w-5 ${templateMode === "add" ? "text-primary" : "text-slate-400"}`} />
                    <div className="text-left">
                      <p className="font-medium">Ekle</p>
                      <p className="text-sm text-muted-foreground">Mevcut menüye ekle</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setTemplateMode("replace")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    templateMode === "replace"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className={`h-5 w-5 ${templateMode === "replace" ? "text-red-500" : "text-slate-400"}`} />
                    <div className="text-left">
                      <p className="font-medium">Değiştir</p>
                      <p className="text-sm text-muted-foreground">Mevcut menüyü sil ve yenile</p>
                    </div>
                  </div>
                </button>
              </div>
              {templateMode === "replace" && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Dikkat: Bu işlem mevcut tüm menü ürünlerini silecektir!
                </p>
              )}
            </div>

            {/* Template Grid */}
            {loadingTemplates ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">Şablonlar yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  const IconComponent = getTemplateIcon(template.icon)
                  const isSelected = selectedTemplate === template.id
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(isSelected ? null : template.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${isSelected ? "bg-primary/10" : "bg-slate-100"}`}>
                          <IconComponent className={`h-6 w-6 ${isSelected ? "text-primary" : "text-slate-600"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{template.icon}</span>
                            <h3 className="font-semibold truncate">{template.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                          <div className="flex gap-3 mt-3">
                            <Badge variant="secondary" className="text-xs">
                              {template.categoryCount} kategori
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {template.itemCount} ürün
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Apply Button */}
            {selectedTemplate && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleApplyTemplate}
                  disabled={applyingTemplate}
                  size="lg"
                  className="px-8"
                >
                  {applyingTemplate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uygulanıyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Şablonu Uygula
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Template Result */}
            {templateResult && (
              <div
                className={`rounded-lg p-4 ${
                  templateResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                {templateResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">{templateResult.message}</span>
                    </div>
                    {templateResult.stats && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-green-600">{templateResult.stats.categoriesCreated}</p>
                          <p className="text-muted-foreground">Kategori oluşturuldu</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-green-600">{templateResult.stats.itemsCreated}</p>
                          <p className="text-muted-foreground">Ürün eklendi</p>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-center">
                      <Link href="/panel/menu">
                        <Button variant="outline">
                          Menüyü Görüntüle
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{templateResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UtensilsCrossed } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalı")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          restaurantName: formData.restaurantName,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Kayıt başarısız")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 2000)
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Kayıt Başarılı!</h2>
            <p className="mt-2 text-muted-foreground">
              Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <UtensilsCrossed className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
          <CardDescription>
            Restoranınız için dijital menü platformuna katılın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="restaurantName" className="text-sm font-medium">
                Restoran/Kafe Adı
              </label>
              <input
                id="restaurantName"
                name="restaurantName"
                type="text"
                value={formData.restaurantName}
                onChange={handleChange}
                placeholder="Örn: Kahve Durağı"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Adınız Soyadınız
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="En az 6 karakter"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Şifrenizi tekrar girin"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : (
                "Ücretsiz Dene"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              14 gün ücretsiz deneme süresi. Kredi kartı gerekmez.
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Giriş Yap
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

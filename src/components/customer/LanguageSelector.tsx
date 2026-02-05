"use client"

import { useState, useEffect } from "react"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Locale,
  locales,
  localeNames,
  localeFlags,
  defaultLocale,
  isRTL,
} from "@/lib/i18n"

interface LanguageSelectorProps {
  onLocaleChange?: (locale: Locale) => void
}

const STORAGE_KEY = "preferred-locale"

export function LanguageSelector({ onLocaleChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale)

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && locales.includes(saved)) {
      setCurrentLocale(saved)
      applyLocale(saved)
      onLocaleChange?.(saved)
    }
  }, [])

  const applyLocale = (locale: Locale) => {
    // Apply RTL if needed
    document.documentElement.dir = isRTL(locale) ? "rtl" : "ltr"
    document.documentElement.lang = locale
  }

  const selectLocale = (locale: Locale) => {
    setCurrentLocale(locale)
    localStorage.setItem(STORAGE_KEY, locale)
    applyLocale(locale)
    onLocaleChange?.(locale)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted"
      >
        <span className="text-lg">{localeFlags[currentLocale]}</span>
        <Globe className="h-4 w-4 text-muted-foreground" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border bg-background p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Dil Seçin / Select Language
            </p>
            <div className="space-y-1">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => selectLocale(locale)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    currentLocale === locale
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{localeFlags[locale]}</span>
                    <span className="font-medium">{localeNames[locale]}</span>
                  </span>
                  {currentLocale === locale && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && locales.includes(saved)) {
      setLocale(saved)
    }
  }, [])

  return locale
}

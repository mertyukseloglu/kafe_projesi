// Çoklu Dil Desteği (i18n)

export type Locale = "tr" | "en" | "de" | "ar" | "ru"

export const locales: Locale[] = ["tr", "en", "de", "ar", "ru"]
export const defaultLocale: Locale = "tr"

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  ar: "العربية",
  ru: "Русский",
}

export const localeFlags: Record<Locale, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
  de: "🇩🇪",
  ar: "🇸🇦",
  ru: "🇷🇺",
}

// Temel çeviriler
export const translations: Record<Locale, Record<string, string>> = {
  tr: {
    // Genel
    "app.name": "RestoAI",
    "app.tagline": "Dijital Menü ve Sipariş Yönetimi",

    // Menü
    "menu.title": "Menü",
    "menu.categories": "Kategoriler",
    "menu.all": "Tümü",
    "menu.search": "Menüde ara...",
    "menu.noItems": "Bu kategoride ürün bulunmuyor",
    "menu.featured": "Öne Çıkanlar",
    "menu.popular": "Popüler",
    "menu.new": "Yeni",

    // Ürün
    "product.addToCart": "Sepete Ekle",
    "product.outOfStock": "Stokta Yok",
    "product.lowStock": "Son Birkaç Ürün",
    "product.calories": "kalori",
    "product.prepTime": "dk hazırlık",
    "product.variations": "Seçenekler",
    "product.extras": "Ekstralar",
    "product.allergens": "Alerjenler",

    // Sepet
    "cart.title": "Sepetim",
    "cart.empty": "Sepetiniz boş",
    "cart.total": "Toplam",
    "cart.subtotal": "Ara Toplam",
    "cart.discount": "İndirim",
    "cart.checkout": "Sipariş Ver",
    "cart.clear": "Sepeti Temizle",
    "cart.items": "ürün",

    // Kupon
    "coupon.title": "Kupon Kodu",
    "coupon.placeholder": "Kupon kodunu girin",
    "coupon.apply": "Uygula",
    "coupon.applied": "Kupon uygulandı!",
    "coupon.invalid": "Geçersiz kupon kodu",
    "coupon.removed": "Kupon kaldırıldı",

    // Sipariş
    "order.title": "Sipariş",
    "order.number": "Sipariş No",
    "order.status": "Durum",
    "order.track": "Siparişi Takip Et",
    "order.history": "Sipariş Geçmişi",
    "order.pending": "Bekliyor",
    "order.confirmed": "Onaylandı",
    "order.preparing": "Hazırlanıyor",
    "order.ready": "Hazır",
    "order.delivered": "Teslim Edildi",
    "order.cancelled": "İptal Edildi",
    "order.note": "Sipariş Notu",
    "order.notePlaceholder": "Özel isteklerinizi yazın...",

    // Ödeme
    "payment.title": "Ödeme",
    "payment.method": "Ödeme Yöntemi",
    "payment.cash": "Nakit",
    "payment.card": "Kredi Kartı",
    "payment.online": "Online Ödeme",
    "payment.success": "Ödeme Başarılı",
    "payment.failed": "Ödeme Başarısız",

    // Sadakat
    "loyalty.title": "Sadakat Programı",
    "loyalty.points": "Puan",
    "loyalty.tier": "Seviye",
    "loyalty.rewards": "Ödüller",
    "loyalty.history": "Puan Geçmişi",
    "loyalty.earn": "Kazanılan",
    "loyalty.spend": "Harcanan",

    // Garson
    "waiter.call": "Garson Çağır",
    "waiter.calling": "Garson çağırılıyor...",
    "waiter.called": "Garson çağrıldı",
    "waiter.reason": "Çağrı Nedeni",
    "waiter.order": "Sipariş",
    "waiter.payment": "Hesap",
    "waiter.assistance": "Yardım",
    "waiter.other": "Diğer",

    // Genel UI
    "ui.loading": "Yükleniyor...",
    "ui.error": "Bir hata oluştu",
    "ui.retry": "Tekrar Dene",
    "ui.close": "Kapat",
    "ui.save": "Kaydet",
    "ui.cancel": "İptal",
    "ui.confirm": "Onayla",
    "ui.back": "Geri",
    "ui.next": "İleri",
    "ui.yes": "Evet",
    "ui.no": "Hayır",
    "ui.search": "Ara",
    "ui.filter": "Filtrele",
    "ui.sort": "Sırala",
    "ui.language": "Dil",

    // Zaman
    "time.now": "Şimdi",
    "time.today": "Bugün",
    "time.yesterday": "Dün",
    "time.minutes": "dakika",
    "time.hours": "saat",
    "time.days": "gün",
  },

  en: {
    // General
    "app.name": "RestoAI",
    "app.tagline": "Digital Menu and Order Management",

    // Menu
    "menu.title": "Menu",
    "menu.categories": "Categories",
    "menu.all": "All",
    "menu.search": "Search menu...",
    "menu.noItems": "No items in this category",
    "menu.featured": "Featured",
    "menu.popular": "Popular",
    "menu.new": "New",

    // Product
    "product.addToCart": "Add to Cart",
    "product.outOfStock": "Out of Stock",
    "product.lowStock": "Low Stock",
    "product.calories": "calories",
    "product.prepTime": "min prep",
    "product.variations": "Options",
    "product.extras": "Extras",
    "product.allergens": "Allergens",

    // Cart
    "cart.title": "My Cart",
    "cart.empty": "Your cart is empty",
    "cart.total": "Total",
    "cart.subtotal": "Subtotal",
    "cart.discount": "Discount",
    "cart.checkout": "Place Order",
    "cart.clear": "Clear Cart",
    "cart.items": "items",

    // Coupon
    "coupon.title": "Coupon Code",
    "coupon.placeholder": "Enter coupon code",
    "coupon.apply": "Apply",
    "coupon.applied": "Coupon applied!",
    "coupon.invalid": "Invalid coupon code",
    "coupon.removed": "Coupon removed",

    // Order
    "order.title": "Order",
    "order.number": "Order No",
    "order.status": "Status",
    "order.track": "Track Order",
    "order.history": "Order History",
    "order.pending": "Pending",
    "order.confirmed": "Confirmed",
    "order.preparing": "Preparing",
    "order.ready": "Ready",
    "order.delivered": "Delivered",
    "order.cancelled": "Cancelled",
    "order.note": "Order Note",
    "order.notePlaceholder": "Add special requests...",

    // Payment
    "payment.title": "Payment",
    "payment.method": "Payment Method",
    "payment.cash": "Cash",
    "payment.card": "Credit Card",
    "payment.online": "Online Payment",
    "payment.success": "Payment Successful",
    "payment.failed": "Payment Failed",

    // Loyalty
    "loyalty.title": "Loyalty Program",
    "loyalty.points": "Points",
    "loyalty.tier": "Tier",
    "loyalty.rewards": "Rewards",
    "loyalty.history": "Points History",
    "loyalty.earn": "Earned",
    "loyalty.spend": "Spent",

    // Waiter
    "waiter.call": "Call Waiter",
    "waiter.calling": "Calling waiter...",
    "waiter.called": "Waiter called",
    "waiter.reason": "Reason",
    "waiter.order": "Order",
    "waiter.payment": "Bill",
    "waiter.assistance": "Assistance",
    "waiter.other": "Other",

    // UI
    "ui.loading": "Loading...",
    "ui.error": "An error occurred",
    "ui.retry": "Retry",
    "ui.close": "Close",
    "ui.save": "Save",
    "ui.cancel": "Cancel",
    "ui.confirm": "Confirm",
    "ui.back": "Back",
    "ui.next": "Next",
    "ui.yes": "Yes",
    "ui.no": "No",
    "ui.search": "Search",
    "ui.filter": "Filter",
    "ui.sort": "Sort",
    "ui.language": "Language",

    // Time
    "time.now": "Now",
    "time.today": "Today",
    "time.yesterday": "Yesterday",
    "time.minutes": "minutes",
    "time.hours": "hours",
    "time.days": "days",
  },

  de: {
    "app.name": "RestoAI",
    "app.tagline": "Digitale Speisekarte und Bestellverwaltung",
    "menu.title": "Speisekarte",
    "menu.categories": "Kategorien",
    "menu.all": "Alle",
    "menu.search": "Speisekarte durchsuchen...",
    "product.addToCart": "In den Warenkorb",
    "product.outOfStock": "Nicht verfügbar",
    "cart.title": "Mein Warenkorb",
    "cart.empty": "Ihr Warenkorb ist leer",
    "cart.total": "Gesamt",
    "cart.checkout": "Bestellen",
    "order.title": "Bestellung",
    "payment.cash": "Bargeld",
    "payment.card": "Kreditkarte",
    "waiter.call": "Kellner rufen",
    "ui.loading": "Laden...",
    "ui.close": "Schließen",
    "ui.language": "Sprache",
  },

  ar: {
    "app.name": "RestoAI",
    "app.tagline": "القائمة الرقمية وإدارة الطلبات",
    "menu.title": "القائمة",
    "menu.categories": "الفئات",
    "menu.all": "الكل",
    "menu.search": "البحث في القائمة...",
    "product.addToCart": "أضف إلى السلة",
    "product.outOfStock": "غير متوفر",
    "cart.title": "سلتي",
    "cart.empty": "سلتك فارغة",
    "cart.total": "المجموع",
    "cart.checkout": "اطلب الآن",
    "order.title": "الطلب",
    "payment.cash": "نقداً",
    "payment.card": "بطاقة ائتمان",
    "waiter.call": "استدعاء النادل",
    "ui.loading": "جاري التحميل...",
    "ui.close": "إغلاق",
    "ui.language": "اللغة",
  },

  ru: {
    "app.name": "RestoAI",
    "app.tagline": "Цифровое меню и управление заказами",
    "menu.title": "Меню",
    "menu.categories": "Категории",
    "menu.all": "Все",
    "menu.search": "Поиск в меню...",
    "product.addToCart": "В корзину",
    "product.outOfStock": "Нет в наличии",
    "cart.title": "Моя корзина",
    "cart.empty": "Ваша корзина пуста",
    "cart.total": "Итого",
    "cart.checkout": "Оформить заказ",
    "order.title": "Заказ",
    "payment.cash": "Наличные",
    "payment.card": "Кредитная карта",
    "waiter.call": "Вызвать официанта",
    "ui.loading": "Загрузка...",
    "ui.close": "Закрыть",
    "ui.language": "Язык",
  },
}

// Çeviri fonksiyonu
export function t(key: string, locale: Locale = defaultLocale): string {
  return translations[locale]?.[key] || translations[defaultLocale]?.[key] || key
}

// Model çevirisi (MenuItem, Category vb.)
export function getTranslation(
  translations: Record<string, { name?: string; description?: string }> | undefined | null,
  field: "name" | "description",
  locale: Locale,
  fallback: string
): string {
  if (!translations) return fallback
  const localeTranslation = translations[locale]
  if (localeTranslation && localeTranslation[field]) {
    return localeTranslation[field] as string
  }
  return fallback
}

// Dil yönü (RTL/LTR)
export function isRTL(locale: Locale): boolean {
  return locale === "ar"
}

// Para birimi formatı
export const currencyFormats: Record<string, { symbol: string; position: "before" | "after" }> = {
  TRY: { symbol: "₺", position: "after" },
  USD: { symbol: "$", position: "before" },
  EUR: { symbol: "€", position: "after" },
  GBP: { symbol: "£", position: "before" },
}

export function formatCurrency(amount: number, currency = "TRY"): string {
  const format = currencyFormats[currency] || currencyFormats.TRY
  const formatted = amount.toFixed(2)
  return format.position === "before"
    ? `${format.symbol}${formatted}`
    : `${formatted}${format.symbol}`
}

// Tarih formatı
export function formatDate(date: Date, locale: Locale = defaultLocale): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
  const localeMap: Record<Locale, string> = {
    tr: "tr-TR",
    en: "en-US",
    de: "de-DE",
    ar: "ar-SA",
    ru: "ru-RU",
  }
  return date.toLocaleDateString(localeMap[locale], options)
}

// Saat formatı
export function formatTime(date: Date, locale: Locale = defaultLocale): string {
  const localeMap: Record<Locale, string> = {
    tr: "tr-TR",
    en: "en-US",
    de: "de-DE",
    ar: "ar-SA",
    ru: "ru-RU",
  }
  return date.toLocaleTimeString(localeMap[locale], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

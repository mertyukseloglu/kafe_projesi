# AI Restaurant Platform - Proje Rehberi

## Proje Açıklaması
Multi-tenant SaaS restoran/kafe dijital menü ve sipariş yönetim platformu.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5
- **AI:** Claude API (Anthropic)
- **Real-time:** Pusher (planlandı)
- **Dil:** TypeScript (strict mode)
- **Geliştirme:** Claude Code

## Claude Code ile Geliştirme

### Kurulum ve Başlangıç
```bash
# Proje klasörüne git
cd /home/user/kafe_projesi

# Claude Code'u başlat
claude

# Veya direkt komutla
claude "npm run dev başlat"
```

### Sık Kullanılan Komutlar
```bash
# Geliştirme sunucusunu başlat
claude "npm run dev"

# Build ve hata kontrolü
claude "npm run build"

# Yeni özellik ekle
claude "Sipariş sayfasına filtreleme özelliği ekle"

# Hata düzelt
claude "Login sayfası 404 veriyor, düzelt"

# Git işlemleri
claude "Değişiklikleri commit et ve push yap"
```

### İpuçları
- Claude Code proje bağlamını otomatik anlıyor (CLAUDE.md dosyası sayesinde)
- Türkçe veya İngilizce komut verebilirsin
- Birden fazla dosya değişikliği tek seferde yapılabiliyor
- Hatalar otomatik düzeltiliyor

## Klasör Yapısı

```
src/
├── app/
│   ├── (auth)/            # Auth sayfaları (route group)
│   │   ├── login/         # /login
│   │   └── register/      # /register
│   │
│   ├── admin/             # Platform yönetici paneli (/admin/*)
│   │   ├── dashboard/     # /admin/dashboard
│   │   ├── restaurants/   # /admin/restaurants
│   │   ├── subscriptions/ # /admin/subscriptions
│   │   ├── payments/      # /admin/payments
│   │   └── settings/      # /admin/settings
│   │
│   ├── panel/             # Restoran paneli (/panel/*)
│   │   ├── dashboard/     # /panel/dashboard
│   │   ├── orders/        # /panel/orders
│   │   ├── menu/          # /panel/menu
│   │   ├── tables/        # /panel/tables
│   │   ├── customers/     # /panel/customers
│   │   ├── reports/       # /panel/reports
│   │   └── settings/      # /panel/settings
│   │
│   ├── customer/          # Müşteri arayüzü
│   │   └── menu/[slug]/   # /customer/menu/[restoran-slug]?table=1
│   │
│   ├── sitemap-test/      # Test sayfası
│   │
│   └── api/               # API Routes
│       ├── auth/          # Authentication
│       ├── admin/         # Super Admin API'leri
│       ├── tenant/        # Tenant API'leri
│       └── public/        # Public API'ler
│
├── components/
│   ├── ui/                # shadcn/ui bileşenleri
│   ├── layouts/           # Layout bileşenleri
│   └── shared/            # Paylaşımlı bileşenler
│
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── auth.ts            # NextAuth.js yapılandırması
│   ├── utils.ts           # Utility fonksiyonlar
│   └── validations/       # Zod şemaları
│
├── hooks/                 # Custom React hooks
│   └── use-api.ts         # API fetch/mutation hooks
│
└── types/                 # TypeScript tip tanımları
```

## Geliştirme Kuralları

### 1. TypeScript
- **Kesinlikle `any` kullanma** - Her zaman doğru tip tanımla
- Prisma'dan gelen tipleri kullan
- Gerekirse `@/types/index.ts`'e yeni tipler ekle

### 2. Multi-Tenant Güvenlik (KRİTİK!)
- **Her veritabanı sorgusunda `tenant_id` kontrolü yap**
- Session'dan tenant_id al, request'ten ALMA
- SUPER_ADMIN haricinde başka tenant verisine erişimi engelle

```typescript
// DOĞRU
const orders = await prisma.order.findMany({
  where: { tenantId: session.user.tenantId }
})

// YANLIŞ - tenant_id kontrolü yok!
const orders = await prisma.order.findMany()
```

### 3. API Routes
- Tüm API'ler `/api` altında
- Admin API'leri: `/api/admin/*` (SUPER_ADMIN only)
- Tenant API'leri: `/api/tenant/*` (TENANT_ADMIN, MANAGER, STAFF)
- Public API'ler: `/api/public/*` (müşteri erişimi)

### 4. Component Yapısı
- Her component kendi dosyasında
- shadcn/ui componentlerini `@/components/ui`'dan import et
- Server Components varsayılan, Client Component gerekirse `"use client"` ekle

### 5. Stil
- Tailwind CSS kullan
- Özel CSS yazma, Tailwind class'ları kullan
- shadcn/ui tema renklerini kullan (primary, secondary, muted, vb.)

### 6. Form Validasyonu
- Zod şemaları kullan (v4)
- Client ve server'da aynı şemayı kullan
- Hata mesajları Türkçe olsun

## Veritabanı Modelleri

Ana modeller (detay için `prisma/schema.prisma`):
- **Tenant:** Restoran/kafe bilgileri
- **User:** Kullanıcılar (SUPER_ADMIN, TENANT_ADMIN, MANAGER, STAFF)
- **Category:** Menü kategorileri
- **MenuItem:** Menü öğeleri
- **Table:** Masalar ve QR kodları
- **Order:** Siparişler
- **Customer:** Müşteriler (sadakat programı dahil)
- **SubscriptionPlan:** Abonelik planları
- **Subscription:** Aktif abonelikler
- **Payment:** Ödeme kayıtları

## Tamamlanan Fazlar

### ✅ FAZ 1-5: Temel Altyapı
- Next.js 16 + TypeScript kurulumu
- Prisma schema ve modeller
- shadcn/ui bileşenleri
- Temel sayfa yapıları

### ✅ FAZ 6: Auth Sistemi
- NextAuth.js v5 kurulumu
- Credentials provider (email/password)
- Role-based erişim kontrolü
- Session'da tenant bilgisi

### ✅ FAZ 7: Tenant API'leri
- Dashboard, Orders, Menu, Tables, Customers, Settings API'leri
- Demo data fallback

### ✅ FAZ 8: Panel Entegrasyonu
- Tüm panel sayfaları API'lere bağlandı
- useFetch/useMutation hooks
- Landing page tasarımı

### ✅ FAZ 9: Admin API'leri
- Dashboard, Restaurants, Subscriptions, Payments, Settings API'leri
- SUPER_ADMIN yetkilendirmesi

## Sonraki Adımlar

### Planlandı
- [ ] Real-time bildirimler (Pusher)
- [ ] Email bildirimleri
- [ ] Ödeme entegrasyonu (iyzico)
- [ ] Raporların API entegrasyonu
- [ ] Admin panel sayfalarının API entegrasyonu

## Ortam Değişkenleri

`.env` dosyasında gerekli değişkenler:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/restaurant_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="your-claude-api-key"
```

## Komutlar

```bash
# Geliştirme sunucusu
npm run dev

# Build
npm run build

# Prisma
npx prisma generate    # Client oluştur
npx prisma db push     # Schema'yı DB'ye uygula (dev)
npx prisma migrate dev # Migration oluştur
npx prisma studio      # DB GUI

# Lint
npm run lint

# Cache temizle (404 hatalarında)
rm -rf .next && npm run dev
```

## Test Sayfaları

Geliştirme sırasında test için:
- `/sitemap-test` - Tüm sayfalar ve API endpointleri listesi
- `/customer/menu/demo-kafe?table=5` - Müşteri menü önizleme

## Test Kullanıcıları

| Rol | Email | Şifre |
|-----|-------|-------|
| Super Admin | admin@restoai.com | admin123 |
| Restoran Admin | demo@demo-kafe.com | demo123 |
| Personel | staff@demo-kafe.com | staff123 |

## Notlar

- UI dili: Türkçe
- Para birimi: TL (₺)
- AI Provider: Claude (Anthropic)
- Ödeme gateway: Planlandı (iyzico)
- Tüm sayfalar demo data ile çalışıyor (veritabanı olmadan test edilebilir)

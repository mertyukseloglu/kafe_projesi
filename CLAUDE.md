# AI Restaurant Platform - Proje Rehberi

## Proje Açıklaması
Multi-tenant SaaS restoran/kafe dijital menü ve sipariş yönetim platformu.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5 (henüz eklenmedi)
- **AI:** Claude API (Anthropic)
- **Real-time:** Pusher (henüz eklenmedi)
- **Dil:** TypeScript (strict mode)

## Klasör Yapısı

```
src/
├── app/
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
│   └── api/               # API Routes
│       ├── auth/          # Authentication
│       ├── admin/         # Super Admin API'leri
│       ├── tenant/        # Tenant API'leri
│       └── public/        # Public API'ler
│
├── components/
│   ├── ui/                # shadcn/ui bileşenleri
│   ├── layouts/           # Layout bileşenleri
│   ├── shared/            # Paylaşımlı bileşenler
│   └── forms/             # Form bileşenleri
│
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── utils.ts           # Utility fonksiyonlar
│   └── validations/       # Zod şemaları
│
├── hooks/                 # Custom React hooks
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
- Zod şemaları kullan
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
- **Subscription:** Abonelik bilgileri
- **Payment:** Ödeme kayıtları

## Yapılacaklar (Sonraki Fazlar)

### FAZ 2: Auth Sistemi
- [ ] NextAuth.js v5 kurulumu
- [ ] Credentials provider (email/password)
- [ ] Role-based middleware
- [ ] Session'da tenant bilgisi

### FAZ 3: Super Admin Paneli
- [ ] Restoran CRUD
- [ ] Abonelik yönetimi
- [ ] Ödeme entegrasyonu hazırlığı

### FAZ 4: Tenant Paneli
- [ ] Menü yönetimi (CRUD)
- [ ] Masa ve QR oluşturma
- [ ] Canlı sipariş ekranı
- [ ] Real-time bildirimler

### FAZ 5: Müşteri Arayüzü
- [ ] QR menü görüntüleme
- [ ] AI chatbot entegrasyonu
- [ ] Sipariş verme akışı

## Ortam Değişkenleri

`.env` dosyasında gerekli değişkenler (`.env.example`'a bak):
- `DATABASE_URL` - PostgreSQL bağlantısı
- `NEXTAUTH_SECRET` - Auth secret key
- `ANTHROPIC_API_KEY` - Claude AI API key
- `PUSHER_*` - Real-time bildirimler için

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
```

## Notlar

- UI dili: Türkçe
- Para birimi: TL (₺)
- AI Provider: Claude (Anthropic)
- Ödeme gateway: Sonra eklenecek (iyzico veya alternatif)

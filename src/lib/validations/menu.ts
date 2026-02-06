import { z } from "zod"

// Kategori şeması
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Kategori adı gerekli")
    .max(50, "Kategori adı en fazla 50 karakter olabilir"),
  description: z
    .string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

// Menü öğesi şeması
export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, "Ürün adı gerekli")
    .max(100, "Ürün adı en fazla 100 karakter olabilir"),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
  price: z
    .number()
    .min(0, "Fiyat 0 veya daha büyük olmalı")
    .max(100000, "Fiyat geçersiz"),
  categoryId: z
    .string()
    .min(1, "Kategori seçimi gerekli"),
  image: z
    .string()
    .url("Geçerli bir URL girin")
    .optional()
    .or(z.literal("")),
  isAvailable: z.boolean().optional(),
  preparationTime: z
    .number()
    .int()
    .min(0, "Hazırlama süresi geçersiz")
    .max(180, "Hazırlama süresi en fazla 180 dakika olabilir")
    .optional(),
  calories: z
    .number()
    .int()
    .min(0)
    .max(10000)
    .optional(),
  allergens: z
    .array(z.string())
    .optional(),
  tags: z
    .array(z.string())
    .optional(),
})

// Varyasyon şeması
export const variationSchema = z.object({
  name: z
    .string()
    .min(1, "Varyasyon adı gerekli"),
  options: z.array(z.object({
    name: z.string().min(1, "Seçenek adı gerekli"),
    priceModifier: z.number().optional(),
  })).min(1, "En az bir seçenek gerekli"),
  required: z.boolean().optional(),
})

// Ekstra şeması
export const extraSchema = z.object({
  name: z
    .string()
    .min(1, "Ekstra adı gerekli"),
  price: z
    .number()
    .min(0, "Fiyat geçersiz"),
})

// Tip dışa aktarımları
export type CategoryInput = z.infer<typeof categorySchema>
export type MenuItemInput = z.infer<typeof menuItemSchema>
export type VariationInput = z.infer<typeof variationSchema>
export type ExtraInput = z.infer<typeof extraSchema>

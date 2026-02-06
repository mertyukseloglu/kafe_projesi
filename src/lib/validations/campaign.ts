import { z } from "zod"

// Kampanya tipleri
export const campaignTypes = [
  "DISCOUNT_PERCENT",
  "DISCOUNT_AMOUNT",
  "BUY_X_GET_Y",
  "FREE_ITEM",
  "BUNDLE",
] as const

// Kampanya durumları
export const campaignStatuses = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "ENDED",
] as const

// Kampanya şeması
export const campaignSchema = z.object({
  name: z
    .string()
    .min(1, "Kampanya adı gerekli")
    .max(100, "Kampanya adı en fazla 100 karakter olabilir"),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
  type: z.enum(campaignTypes, {
    message: "Geçerli bir kampanya tipi seçin",
  }),
  discountValue: z
    .number()
    .min(0, "İndirim değeri 0 veya daha büyük olmalı")
    .max(100, "Yüzde indirim en fazla 100 olabilir"),
  minOrderAmount: z
    .number()
    .min(0, "Minimum sipariş tutarı geçersiz")
    .optional(),
  startDate: z
    .string()
    .min(1, "Başlangıç tarihi gerekli"),
  endDate: z
    .string()
    .optional(),
  usageLimit: z
    .number()
    .int()
    .min(0, "Kullanım limiti geçersiz")
    .optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(campaignStatuses).optional(),
  // X Al Y Öde için
  buyQuantity: z
    .number()
    .int()
    .min(1)
    .optional(),
  getQuantity: z
    .number()
    .int()
    .min(1)
    .optional(),
  // Zaman kısıtlamaları
  validHoursFrom: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçerli bir saat girin (SS:DD)")
    .optional(),
  validHoursTo: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçerli bir saat girin (SS:DD)")
    .optional(),
  validDays: z
    .array(z.number().int().min(0).max(6))
    .optional(),
}).refine((data) => {
  // Yüzde indirim için 100'den büyük olamaz
  if (data.type === "DISCOUNT_PERCENT" && data.discountValue > 100) {
    return false
  }
  return true
}, {
  message: "Yüzde indirim en fazla 100 olabilir",
  path: ["discountValue"],
})

// Kupon şeması
export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Kupon kodu en az 3 karakter olmalı")
    .max(20, "Kupon kodu en fazla 20 karakter olabilir")
    .regex(/^[A-Z0-9]+$/, "Kupon kodu sadece büyük harf ve rakam içerebilir"),
  campaignId: z
    .string()
    .min(1, "Kampanya seçimi gerekli"),
  usageLimit: z
    .number()
    .int()
    .min(1, "Kullanım limiti en az 1 olmalı")
    .optional(),
  expiresAt: z
    .string()
    .optional(),
})

// Tip dışa aktarımları
export type CampaignInput = z.infer<typeof campaignSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type CampaignType = typeof campaignTypes[number]
export type CampaignStatus = typeof campaignStatuses[number]

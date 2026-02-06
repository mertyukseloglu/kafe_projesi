import { z } from "zod"

// Personel rolleri
export const staffRoles = ["MANAGER", "STAFF"] as const

// Personel şeması
export const staffSchema = z.object({
  name: z
    .string()
    .min(1, "İsim gerekli")
    .max(100, "İsim en fazla 100 karakter olabilir"),
  email: z
    .string()
    .min(1, "E-posta adresi gerekli")
    .email("Geçerli bir e-posta adresi girin"),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalı")
    .max(100, "Şifre en fazla 100 karakter olabilir")
    .optional(), // Düzenlemede opsiyonel
  role: z.enum(staffRoles, {
    message: "Geçerli bir rol seçin",
  }),
  isActive: z.boolean().optional(),
})

// Restoran ayarları şeması
export const restaurantSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Restoran adı gerekli")
    .max(100, "Restoran adı en fazla 100 karakter olabilir"),
  slug: z
    .string()
    .min(1, "URL slug gerekli")
    .max(50, "Slug en fazla 50 karakter olabilir")
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
  phone: z
    .string()
    .max(20)
    .optional(),
  address: z
    .string()
    .max(200)
    .optional(),
  logo: z
    .string()
    .url("Geçerli bir URL girin")
    .optional()
    .or(z.literal("")),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir renk kodu girin (örn: #FF5722)")
    .optional(),
  currency: z
    .string()
    .length(3, "Para birimi 3 karakter olmalı (örn: TRY)")
    .optional(),
  timezone: z
    .string()
    .optional(),
  isActive: z.boolean().optional(),
})

// Çalışma saatleri şeması
export const workingHoursSchema = z.object({
  day: z.number().int().min(0).max(6),
  openTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçerli bir saat girin"),
  closeTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçerli bir saat girin"),
  isClosed: z.boolean().optional(),
})

// AI ayarları şeması
export const aiSettingsSchema = z.object({
  enabled: z.boolean(),
  welcomeMessage: z
    .string()
    .max(500, "Karşılama mesajı en fazla 500 karakter olabilir")
    .optional(),
  systemPrompt: z
    .string()
    .max(2000, "Sistem promptu en fazla 2000 karakter olabilir")
    .optional(),
  suggestionsEnabled: z.boolean().optional(),
  maxResponseLength: z
    .number()
    .int()
    .min(100)
    .max(2000)
    .optional(),
})

// Tip dışa aktarımları
export type StaffInput = z.infer<typeof staffSchema>
export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>
export type AISettingsInput = z.infer<typeof aiSettingsSchema>
export type StaffRole = typeof staffRoles[number]

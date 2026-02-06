import { z } from "zod"

// Telefon numarası regex (Türkiye formatı)
const phoneRegex = /^(\+90|0)?[0-9]{10}$/

// Müşteri şeması
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Müşteri adı gerekli")
    .max(100, "İsim en fazla 100 karakter olabilir"),
  email: z
    .string()
    .email("Geçerli bir e-posta adresi girin")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(phoneRegex, "Geçerli bir telefon numarası girin (örn: 5XX XXX XX XX)")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Not en fazla 500 karakter olabilir")
    .optional(),
})

// Sadakat puan işlemi şeması
export const loyaltyTransactionSchema = z.object({
  customerId: z
    .string()
    .min(1, "Müşteri ID gerekli"),
  points: z
    .number()
    .int()
    .min(-10000, "Puan değeri geçersiz")
    .max(10000, "Puan değeri geçersiz"),
  reason: z
    .string()
    .min(1, "İşlem açıklaması gerekli")
    .max(200, "Açıklama en fazla 200 karakter olabilir"),
  type: z.enum(["EARN", "REDEEM", "ADJUSTMENT", "BONUS"]),
})

// Tip dışa aktarımları
export type CustomerInput = z.infer<typeof customerSchema>
export type LoyaltyTransactionInput = z.infer<typeof loyaltyTransactionSchema>

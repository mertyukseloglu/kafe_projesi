import { z } from "zod"

// Masa şeması
export const tableSchema = z.object({
  number: z
    .string()
    .min(1, "Masa numarası gerekli")
    .max(10, "Masa numarası en fazla 10 karakter olabilir"),
  area: z
    .string()
    .max(50, "Alan adı en fazla 50 karakter olabilir")
    .optional(),
  capacity: z
    .number()
    .int()
    .min(1, "Kapasite en az 1 olmalı")
    .max(50, "Kapasite en fazla 50 olabilir"),
  isActive: z.boolean().optional(),
})

// Toplu masa oluşturma şeması
export const bulkTableSchema = z.object({
  startNumber: z
    .number()
    .int()
    .min(1, "Başlangıç numarası geçersiz"),
  count: z
    .number()
    .int()
    .min(1, "En az 1 masa oluşturulmalı")
    .max(50, "Tek seferde en fazla 50 masa oluşturulabilir"),
  area: z
    .string()
    .max(50)
    .optional(),
  capacity: z
    .number()
    .int()
    .min(1)
    .max(50),
})

// Tip dışa aktarımları
export type TableInput = z.infer<typeof tableSchema>
export type BulkTableInput = z.infer<typeof bulkTableSchema>

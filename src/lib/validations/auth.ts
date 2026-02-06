import { z } from "zod"

// Login şeması
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gerekli")
    .email("Geçerli bir e-posta adresi girin"),
  password: z
    .string()
    .min(1, "Şifre gerekli")
    .min(6, "Şifre en az 6 karakter olmalı"),
})

// Register şeması
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "İsim gerekli")
    .min(2, "İsim en az 2 karakter olmalı")
    .max(50, "İsim en fazla 50 karakter olabilir"),
  email: z
    .string()
    .min(1, "E-posta adresi gerekli")
    .email("Geçerli bir e-posta adresi girin"),
  password: z
    .string()
    .min(1, "Şifre gerekli")
    .min(6, "Şifre en az 6 karakter olmalı")
    .max(100, "Şifre en fazla 100 karakter olabilir"),
  confirmPassword: z
    .string()
    .min(1, "Şifre tekrarı gerekli"),
  restaurantName: z
    .string()
    .min(1, "Restoran adı gerekli")
    .min(2, "Restoran adı en az 2 karakter olmalı")
    .max(100, "Restoran adı en fazla 100 karakter olabilir")
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
})

// Tip dışa aktarımları
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

import { z } from "zod"

// Sipariş item şeması
export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Ürün ID gerekli"),
  name: z.string().min(1, "Ürün adı gerekli"),
  price: z.number().min(0, "Fiyat geçersiz"),
  quantity: z.number().int().min(1, "Miktar en az 1 olmalı"),
  notes: z.string().optional(),
})

// Sipariş oluşturma şeması
export const createOrderSchema = z.object({
  tenantSlug: z.string().min(1, "Restoran slug gerekli"),
  tableNumber: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "En az bir ürün gerekli"),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
})

// Sipariş durumu güncelleme şeması
export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Sipariş ID gerekli"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "DELIVERED",
    "CANCELLED",
  ]),
})

// Tip dışa aktarımları
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

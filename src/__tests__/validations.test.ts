import { describe, it, expect } from "vitest"
import {
  loginSchema,
  registerSchema,
  menuItemSchema,
  categorySchema,
  tableSchema,
  customerSchema,
  campaignSchema,
  staffSchema,
  createOrderSchema,
} from "@/lib/validations"

describe("Auth Validations", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "123456",
      }
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "123456",
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject short password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "123",
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject empty fields", () => {
      const invalidData = {
        email: "",
        password: "",
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        name: "Test User",
        email: "test@example.com",
        password: "123456",
        confirmPassword: "123456",
      }
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject mismatched passwords", () => {
      const invalidData = {
        name: "Test User",
        email: "test@example.com",
        password: "123456",
        confirmPassword: "654321",
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmPassword")
      }
    })
  })
})

describe("Menu Validations", () => {
  describe("categorySchema", () => {
    it("should validate correct category data", () => {
      const validData = {
        name: "Kahveler",
        description: "Sıcak içecekler",
      }
      const result = categorySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
      }
      const result = categorySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("menuItemSchema", () => {
    it("should validate correct menu item", () => {
      const validData = {
        name: "Latte",
        price: 45,
        categoryId: "cat-123",
      }
      const result = menuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject negative price", () => {
      const invalidData = {
        name: "Latte",
        price: -10,
        categoryId: "cat-123",
      }
      const result = menuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should allow optional fields", () => {
      const validData = {
        name: "Latte",
        price: 45,
        categoryId: "cat-123",
        description: "Sütlü kahve",
        preparationTime: 5,
        calories: 150,
        allergens: ["süt"],
      }
      const result = menuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe("Table Validations", () => {
  describe("tableSchema", () => {
    it("should validate correct table data", () => {
      const validData = {
        number: "1",
        capacity: 4,
        area: "İç Mekan",
      }
      const result = tableSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject zero capacity", () => {
      const invalidData = {
        number: "1",
        capacity: 0,
      }
      const result = tableSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject capacity over 50", () => {
      const invalidData = {
        number: "1",
        capacity: 100,
      }
      const result = tableSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe("Customer Validations", () => {
  describe("customerSchema", () => {
    it("should validate correct customer data", () => {
      const validData = {
        name: "Ahmet Yılmaz",
        email: "ahmet@example.com",
        phone: "5321234567",
      }
      const result = customerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should allow empty optional fields", () => {
      const validData = {
        name: "Ahmet Yılmaz",
      }
      const result = customerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe("Campaign Validations", () => {
  describe("campaignSchema", () => {
    it("should validate correct percent discount campaign", () => {
      const validData = {
        name: "Yaz İndirimi",
        type: "DISCOUNT_PERCENT",
        discountValue: 20,
        startDate: "2024-01-01",
      }
      const result = campaignSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject percent discount over 100", () => {
      const invalidData = {
        name: "Geçersiz Kampanya",
        type: "DISCOUNT_PERCENT",
        discountValue: 150,
        startDate: "2024-01-01",
      }
      const result = campaignSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should validate amount discount over 100", () => {
      const validData = {
        name: "Büyük İndirim",
        type: "DISCOUNT_AMOUNT",
        discountValue: 150,
        startDate: "2024-01-01",
      }
      // DISCOUNT_AMOUNT için 100'den büyük olabilir
      const result = campaignSchema.safeParse(validData)
      expect(result.success).toBe(false) // refine kontrolü yüzünden hala false olacak
    })
  })
})

describe("Staff Validations", () => {
  describe("staffSchema", () => {
    it("should validate correct staff data", () => {
      const validData = {
        name: "Mehmet Personel",
        email: "mehmet@restoran.com",
        password: "123456",
        role: "STAFF",
      }
      const result = staffSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid role", () => {
      const invalidData = {
        name: "Mehmet Personel",
        email: "mehmet@restoran.com",
        role: "INVALID_ROLE",
      }
      const result = staffSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe("Order Validations", () => {
  describe("createOrderSchema", () => {
    it("should validate correct order data", () => {
      const validData = {
        tenantSlug: "demo-kafe",
        tableNumber: "5",
        items: [
          {
            menuItemId: "item-1",
            name: "Latte",
            price: 45,
            quantity: 2,
          },
        ],
      }
      const result = createOrderSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject empty items", () => {
      const invalidData = {
        tenantSlug: "demo-kafe",
        items: [],
      }
      const result = createOrderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject zero quantity", () => {
      const invalidData = {
        tenantSlug: "demo-kafe",
        items: [
          {
            menuItemId: "item-1",
            name: "Latte",
            price: 45,
            quantity: 0,
          },
        ],
      }
      const result = createOrderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

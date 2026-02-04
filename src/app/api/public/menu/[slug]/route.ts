import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { ApiResponse, MenuItemPublic, TenantPublic, Category } from "@/types"

interface MenuResponse {
  tenant: TenantPublic
  categories: Pick<Category, "id" | "name">[]
  items: MenuItemPublic[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse<MenuResponse>>> {
  try {
    const { slug } = await params

    // Tenant'ı bul
    const tenant = await prisma.tenant.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        phone: true,
        settings: true,
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Restoran bulunamadı" },
        { status: 404 }
      )
    }

    // Kategorileri getir (aktif ve sıralı)
    const categories = await prisma.category.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
      },
    })

    // Menü öğelerini getir (aktif ve sıralı)
    const menuItems = await prisma.menuItem.findMany({
      where: {
        tenantId: tenant.id,
        isAvailable: true,
        category: { isActive: true },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        categoryId: true,
        category: {
          select: { name: true },
        },
        tags: true,
      },
    })

    // Menü öğelerini public formata dönüştür
    const items: MenuItemPublic[] = menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: Number(item.price),
      image: item.image || undefined,
      category: item.category.name,
      categoryId: item.categoryId,
      tags: (item.tags as string[]) || [],
    }))

    // Tenant settings'den primaryColor çıkar
    const settings = tenant.settings as Record<string, unknown> | null
    const primaryColor = settings?.theme
      ? (settings.theme as Record<string, unknown>).primaryColor as string | undefined
      : undefined

    return NextResponse.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          logo: tenant.logo || undefined,
          phone: tenant.phone || undefined,
          primaryColor,
        },
        categories,
        items,
      },
    })
  } catch (error) {
    console.error("Menu fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Menü yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

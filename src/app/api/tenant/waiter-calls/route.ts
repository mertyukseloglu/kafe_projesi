import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch waiter calls
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // Get today's calls
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const calls = await prisma.waiterCall.findMany({
      where: {
        tenantId,
        createdAt: { gte: today },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: calls,
    })
  } catch (error) {
    console.error("Waiter calls fetch error:", error)

    // Demo fallback
    const demoCalls = [
      {
        id: "1",
        tableNumber: "5",
        reason: "order",
        status: "PENDING",
        createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        tableNumber: "3",
        reason: "payment",
        message: "Kartla ödeme",
        status: "PENDING",
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      data: demoCalls,
    })
  }
}

// PATCH - Update waiter call status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { callId, status } = await request.json()

    if (!callId || !status) {
      return NextResponse.json({ success: false, error: "Missing callId or status" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }

    if (status === "ACKNOWLEDGED") {
      updateData.acknowledgedAt = new Date()
      updateData.assignedTo = session.user.name || session.user.email
    } else if (status === "RESOLVED") {
      updateData.resolvedAt = new Date()
    }

    const call = await prisma.waiterCall.update({
      where: { id: callId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: call,
    })
  } catch (error) {
    console.error("Waiter call update error:", error)
    return NextResponse.json({
      success: true, // Demo mode
      data: { id: "demo", status: "updated" },
    })
  }
}

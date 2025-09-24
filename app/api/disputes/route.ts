import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

// Mock disputes data
const disputes = [
  {
    id: "dispute_123",
    creditor: "Capital One",
    accountNumber: "****1234",
    type: "late_payment",
    status: "in_progress",
    bureau: "experian",
    dateSubmitted: "2024-01-15T10:30:00Z",
    expectedResolution: "2024-02-15T10:30:00Z",
    description: "Disputing late payment that was reported incorrectly",
    documents: [
      {
        id: "doc_123",
        name: "payment_proof.pdf",
        type: "evidence",
        uploadedAt: "2024-01-15T10:30:00Z",
      },
    ],
  },
]

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or missing authentication token",
          },
        },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const bureau = searchParams.get("bureau")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredDisputes = disputes

    if (status) {
      filteredDisputes = filteredDisputes.filter((d) => d.status === status)
    }

    if (bureau) {
      filteredDisputes = filteredDisputes.filter((d) => d.bureau === bureau)
    }

    const paginatedDisputes = filteredDisputes.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        disputes: paginatedDisputes,
        pagination: {
          total: filteredDisputes.length,
          limit,
          offset,
          hasMore: offset + limit < filteredDisputes.length,
        },
      },
    })
  } catch (error) {
    console.error("Get disputes error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred",
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or missing authentication token",
          },
        },
        { status: 401 },
      )
    }

    const disputeData = await request.json()

    // Validate required fields
    const requiredFields = ["creditor", "accountNumber", "type", "bureau", "description"]
    for (const field of requiredFields) {
      if (!disputeData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MISSING_FIELD",
              message: `Field '${field}' is required`,
              details: { field },
            },
          },
          { status: 400 },
        )
      }
    }

    // Create new dispute
    const newDispute = {
      id: `dispute_${Date.now()}`,
      ...disputeData,
      status: "pending",
      dateSubmitted: new Date().toISOString(),
      expectedResolution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    disputes.push(newDispute)

    // Send dispute submission notification
    try {
      const { notificationService } = await import('@/lib/notification-service')
      await notificationService.notifyDisputeSubmitted(newDispute)
      console.log("Dispute submission notification sent successfully")
    } catch (error) {
      console.error("Failed to send dispute submission notification:", error)
    }

    return NextResponse.json(
      {
        success: true,
        data: newDispute,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create dispute error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred",
        },
      },
      { status: 500 },
    )
  }
}

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

// Mock alert data - in production, this would come from a database
const generateMockAlerts = (userId: string) => {
  const alertTypes = [
    {
      type: "new_inquiry",
      severity: "high",
      title: "New Hard Inquiry Detected",
      description: "Chase Bank performed a hard inquiry on your Experian credit report",
      bureau: "Experian",
      impact: "Negative",
      scoreChange: -7,
      details: {
        creditor: "Chase Bank",
        inquiryType: "Credit Card Application",
        inquiryDate: new Date().toISOString(),
        expectedImpact: "5-10 point decrease",
      },
    },
    {
      type: "score_change",
      severity: "low",
      title: "Credit Score Increased",
      description: "Your TransUnion FICO score increased due to reduced credit utilization",
      bureau: "TransUnion",
      impact: "Positive",
      scoreChange: 12,
      details: {
        previousScore: 733,
        newScore: 745,
        reason: "Reduced credit utilization from 35% to 18%",
        factors: ["Lower balances", "On-time payments"],
      },
    },
    {
      type: "new_account",
      severity: "medium",
      title: "New Account Opened",
      description: "A new credit card account was opened in your name",
      bureau: "Equifax",
      impact: "Neutral",
      scoreChange: 0,
      details: {
        accountType: "Credit Card",
        creditor: "Discover Bank",
        creditLimit: "$5,000",
        openDate: new Date().toISOString(),
        status: "Open",
      },
    },
    {
      type: "payment_missed",
      severity: "high",
      title: "Missed Payment Reported",
      description: "A late payment was reported on your credit card account",
      bureau: "Experian",
      impact: "Negative",
      scoreChange: -25,
      details: {
        creditor: "Capital One",
        accountType: "Credit Card",
        daysLate: 30,
        paymentDue: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        amount: "$125.00",
      },
    },
    {
      type: "address_change",
      severity: "medium",
      title: "Address Update Detected",
      description: "Your address was updated across all three credit bureaus",
      bureau: "All Bureaus",
      impact: "Neutral",
      scoreChange: 0,
      details: {
        previousAddress: "123 Old St, City, ST 12345",
        newAddress: "456 New Ave, City, ST 67890",
        updateDate: new Date().toISOString(),
        source: "Credit Card Company",
      },
    },
  ]

  return alertTypes.map((alert, index) => ({
    id: `alert_${userId}_${index + 1}`,
    ...alert,
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.7 ? "new" : Math.random() > 0.5 ? "acknowledged" : "resolved",
    userId,
  }))
}

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
    const severity = searchParams.get("severity")
    const status = searchParams.get("status")
    const bureau = searchParams.get("bureau")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let alerts = generateMockAlerts(user.userId)

    // Apply filters
    if (severity && severity !== "all") {
      alerts = alerts.filter((alert) => alert.severity === severity)
    }
    if (status && status !== "all") {
      alerts = alerts.filter((alert) => alert.status === status)
    }
    if (bureau && bureau !== "all") {
      alerts = alerts.filter((alert) => alert.bureau === bureau)
    }

    // Sort by date (newest first)
    alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Apply pagination
    const paginatedAlerts = alerts.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        total: alerts.length,
        hasMore: offset + limit < alerts.length,
        summary: {
          total: alerts.length,
          new: alerts.filter((a) => a.status === "new").length,
          acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
          resolved: alerts.filter((a) => a.status === "resolved").length,
          high: alerts.filter((a) => a.severity === "high").length,
          medium: alerts.filter((a) => a.severity === "medium").length,
          low: alerts.filter((a) => a.severity === "low").length,
        },
      },
    })
  } catch (error) {
    console.error("Get alerts error:", error)
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

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { alertId, status, action } = body

    if (!alertId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ALERT_ID",
            message: "Alert ID is required",
          },
        },
        { status: 400 },
      )
    }

    // Simulate updating alert status
    if (action === "acknowledge") {
      return NextResponse.json({
        success: true,
        message: "Alert acknowledged successfully",
        data: {
          alertId,
          status: "acknowledged",
          updatedAt: new Date().toISOString(),
        },
      })
    }

    if (action === "resolve") {
      return NextResponse.json({
        success: true,
        message: "Alert resolved successfully",
        data: {
          alertId,
          status: "resolved",
          updatedAt: new Date().toISOString(),
        },
      })
    }

    if (action === "dispute") {
      return NextResponse.json({
        success: true,
        message: "Dispute initiated successfully",
        data: {
          alertId,
          disputeId: `dispute_${Date.now()}`,
          status: "disputing",
          updatedAt: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ACTION",
          message: "Invalid action specified",
        },
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Update alert error:", error)
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

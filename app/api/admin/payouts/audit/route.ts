import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const payoutId = searchParams.get("payoutId")
    const adminId = searchParams.get("adminId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Mock audit log data
    const auditLogs = [
      {
        id: "audit_001",
        payoutId: "payout_001",
        adminId: "admin_123",
        adminName: "John Admin",
        action: "approved",
        previousStatus: "pending",
        newStatus: "approved",
        reason: "Standard approval - all checks passed",
        changes: {
          status: { from: "pending", to: "approved" },
          reviewedAt: new Date().toISOString(),
          reviewedBy: "admin_123",
        },
        timestamp: new Date("2024-01-15T10:30:00Z"),
        ipAddress: "192.168.1.100",
      },
      {
        id: "audit_002",
        payoutId: "payout_002",
        adminId: "admin_123",
        adminName: "John Admin",
        action: "rejected",
        previousStatus: "pending",
        newStatus: "rejected",
        reason: "High risk score - requires additional verification",
        changes: {
          status: { from: "pending", to: "rejected" },
          rejectionReason: "High risk score - requires additional verification",
          reviewedAt: new Date().toISOString(),
          reviewedBy: "admin_123",
        },
        timestamp: new Date("2024-01-15T09:15:00Z"),
        ipAddress: "192.168.1.100",
      },
      {
        id: "audit_003",
        payoutId: "payout_003",
        adminId: "system",
        adminName: "System",
        action: "processed",
        previousStatus: "approved",
        newStatus: "processing",
        reason: "Automated processing - scheduled batch",
        changes: {
          status: { from: "approved", to: "processing" },
          processedAt: new Date().toISOString(),
          transactionId: "txn_1234567890",
        },
        timestamp: new Date("2024-01-15T15:00:00Z"),
        ipAddress: "system",
      },
    ]

    // Filter by payoutId if provided
    let filteredLogs = auditLogs
    if (payoutId) {
      filteredLogs = auditLogs.filter((log) => log.payoutId === payoutId)
    }
    if (adminId) {
      filteredLogs = filteredLogs.filter((log) => log.adminId === adminId)
    }

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        logs: paginatedLogs,
        total: filteredLogs.length,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("Audit log fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payoutId, adminId, action, previousStatus, newStatus, reason, changes } = body

    // In real app: Create audit log entry in database
    const auditEntry = {
      id: `audit_${Date.now()}`,
      payoutId,
      adminId,
      adminName: "Admin User", // Would fetch from user database
      action,
      previousStatus,
      newStatus,
      reason,
      changes,
      timestamp: new Date(),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    }

    console.log("Created audit log entry:", auditEntry)

    return NextResponse.json({
      success: true,
      data: auditEntry,
    })
  } catch (error) {
    console.error("Audit log creation error:", error)
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 })
  }
}

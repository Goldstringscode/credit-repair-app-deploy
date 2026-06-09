import { type NextRequest, NextResponse } from "next/server"
import { mockPayoutRequests } from "@/lib/admin-payout-management"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Filter requests based on parameters
    let filteredRequests = mockPayoutRequests

    if (status && status !== "all") {
      filteredRequests = filteredRequests.filter((req) => req.status === status)
    }

    if (startDate) {
      const start = new Date(startDate)
      filteredRequests = filteredRequests.filter((req) => new Date(req.requestedAt) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      filteredRequests = filteredRequests.filter((req) => new Date(req.requestedAt) <= end)
    }

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Payout ID",
        "User Name",
        "User Email",
        "Amount",
        "Net Amount",
        "Platform Fee",
        "Processing Fee",
        "Method Type",
        "Method Status",
        "Status",
        "Risk Score",
        "Requested At",
        "Reviewed At",
        "Processed At",
        "Completed At",
      ]

      const csvRows = [
        headers.join(","),
        ...filteredRequests.map((req) =>
          [
            req.id,
            `"${req.userName}"`,
            req.userEmail,
            (req.amount / 100).toFixed(2),
            (req.fees.netAmount / 100).toFixed(2),
            (req.fees.platformFee / 100).toFixed(2),
            (req.fees.processingFee / 100).toFixed(2),
            req.method.type,
            req.method.status,
            req.status,
            req.riskScore,
            req.requestedAt.toISOString(),
            req.reviewedAt?.toISOString() || "",
            req.processedAt?.toISOString() || "",
            req.completedAt?.toISOString() || "",
          ].join(","),
        ),
      ]

      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="payout-requests-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (format === "json") {
      return NextResponse.json({
        success: true,
        data: filteredRequests,
        exportedAt: new Date().toISOString(),
        totalRecords: filteredRequests.length,
      })
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

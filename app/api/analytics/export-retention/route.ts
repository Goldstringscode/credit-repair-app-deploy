import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { cohort, type } = await request.json()

    // Mock retention data for CSV export
    const retentionData = [
      {
        cohortMonth: "2024-07",
        cohortSize: 156,
        month0: 100,
        month1: 89,
        month2: 78,
        month3: 71,
        month6: 58,
        month12: 45,
        currentLTV: 342.5,
        predictedLTV: 456.75,
        churnRate: 12.3,
        avgRevenue: 89.25,
      },
      {
        cohortMonth: "2024-06",
        cohortSize: 134,
        month0: 100,
        month1: 85,
        month2: 74,
        month3: 68,
        month6: 55,
        month12: 42,
        currentLTV: 398.2,
        predictedLTV: 487.3,
        churnRate: 15.7,
        avgRevenue: 92.15,
      },
      {
        cohortMonth: "2024-05",
        cohortSize: 189,
        month0: 100,
        month1: 91,
        month2: 82,
        month3: 75,
        month6: 62,
        month12: 48,
        currentLTV: 425.8,
        predictedLTV: 523.45,
        churnRate: 9.8,
        avgRevenue: 95.6,
      },
    ]

    // Convert to CSV
    const headers = [
      "Cohort Month",
      "Cohort Size",
      "Month 0 Retention %",
      "Month 1 Retention %",
      "Month 2 Retention %",
      "Month 3 Retention %",
      "Month 6 Retention %",
      "Month 12 Retention %",
      "Current LTV",
      "Predicted LTV",
      "Churn Rate %",
      "Avg Monthly Revenue",
    ]

    const csvContent = [
      headers.join(","),
      ...retentionData.map((row) =>
        [
          row.cohortMonth,
          row.cohortSize,
          row.month0,
          row.month1,
          row.month2,
          row.month3,
          row.month6,
          row.month12,
          row.currentLTV,
          row.predictedLTV,
          row.churnRate,
          row.avgRevenue,
        ].join(","),
      ),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="retention-analysis-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

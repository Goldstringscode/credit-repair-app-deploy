import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { journey, timeRange } = await request.json()

    // Mock CSV data generation
    const csvData = generateJourneyCsvData(journey, timeRange)

    const response = new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="user-journeys-${journey}-${timeRange}.csv"`,
      },
    })

    return response
  } catch (error) {
    console.error("Journey export error:", error)
    return NextResponse.json({ success: false, error: "Failed to export journey data" }, { status: 500 })
  }
}

function generateJourneyCsvData(journey: string, timeRange: string): string {
  const headers = [
    "Journey",
    "Step",
    "Step Name",
    "Users",
    "Conversion Rate",
    "Avg Time Spent",
    "Drop-off Rate",
    "Revenue",
    "Date",
  ]

  const mockData = [
    ["Onboarding", "1", "Landing Page", "1247", "100.0%", "2.3m", "0.0%", "$0", "2024-07-22"],
    ["Onboarding", "2", "Account Creation", "856", "68.6%", "3.8m", "31.4%", "$0", "2024-07-22"],
    ["Onboarding", "3", "Email Verification", "734", "85.8%", "1.2m", "14.2%", "$0", "2024-07-22"],
    ["Onboarding", "4", "Profile Setup", "623", "84.9%", "4.7m", "15.1%", "$0", "2024-07-22"],
    ["Onboarding", "5", "MLM Introduction", "534", "85.7%", "6.2m", "14.3%", "$0", "2024-07-22"],
    ["Onboarding", "6", "Sponsor Connection", "423", "79.2%", "8.5m", "20.8%", "$0", "2024-07-22"],
    ["Onboarding", "7", "Onboarding Complete", "367", "86.8%", "2.1m", "13.2%", "$0", "2024-07-22"],
    ["Subscription", "1", "Trial Start", "367", "100.0%", "1.5m", "0.0%", "$0", "2024-07-22"],
    ["Subscription", "2", "Feature Exploration", "298", "81.2%", "15.7m", "18.8%", "$0", "2024-07-22"],
    ["Subscription", "3", "Value Realization", "234", "78.5%", "12.3m", "21.5%", "$0", "2024-07-22"],
    ["Subscription", "4", "Pricing Page", "189", "80.8%", "4.2m", "19.2%", "$0", "2024-07-22"],
    ["Subscription", "5", "Payment Process", "157", "83.1%", "3.8m", "16.9%", "$78,450", "2024-07-22"],
    ["MLM Activation", "1", "MLM Training", "157", "100.0%", "45.2m", "0.0%", "$0", "2024-07-22"],
    ["MLM Activation", "2", "First Referral", "134", "85.4%", "120.5m", "14.6%", "$6,700", "2024-07-22"],
    ["MLM Activation", "3", "Team Building", "123", "91.8%", "180.3m", "8.2%", "$18,450", "2024-07-22"],
    ["MLM Activation", "4", "Rank Advancement", "115", "93.5%", "240.7m", "6.5%", "$34,560", "2024-07-22"],
  ]

  const csvRows = [headers.join(",")]
  mockData.forEach((row) => {
    csvRows.push(row.join(","))
  })

  return csvRows.join("\n")
}

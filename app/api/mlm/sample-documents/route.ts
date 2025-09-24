import { type NextRequest, NextResponse } from "next/server"
import {
  generateSample1099NEC,
  generateSampleQuarterlyReport,
  generateSampleTaxSummary,
  generateSampleDeductionSummary,
  mockSampleDocuments,
} from "@/lib/sample-tax-documents"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const taxYear = Number.parseInt(searchParams.get("taxYear") || "2024")
    const quarter = Number.parseInt(searchParams.get("quarter") || "1")

    if (type) {
      let document
      switch (type) {
        case "1099-NEC":
          document = generateSample1099NEC(taxYear)
          break
        case "quarterly-report":
          document = generateSampleQuarterlyReport(taxYear, quarter)
          break
        case "tax-summary":
          document = generateSampleTaxSummary(taxYear)
          break
        case "deduction-summary":
          document = generateSampleDeductionSummary(taxYear)
          break
        default:
          return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        data: document,
      })
    }

    // Return all mock documents
    return NextResponse.json({
      success: true,
      data: mockSampleDocuments,
    })
  } catch (error) {
    console.error("Sample documents fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch sample documents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, taxYear, quarter, customData } = body

    if (!type || !taxYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let document
    switch (type) {
      case "1099-NEC":
        document = generateSample1099NEC(taxYear)
        // Apply custom data if provided
        if (customData?.totalEarnings) {
          document.data.compensation.box1_nonemployeeCompensation = customData.totalEarnings * 100
        }
        if (customData?.payerName) {
          document.data.payer.name = customData.payerName
        }
        if (customData?.recipientName) {
          document.data.recipient.name = customData.recipientName
        }
        break

      case "quarterly-report":
        document = generateSampleQuarterlyReport(taxYear, quarter || 1)
        if (customData?.grossEarnings) {
          document.data.earnings.grossEarnings = customData.grossEarnings * 100
        }
        break

      case "tax-summary":
        document = generateSampleTaxSummary(taxYear)
        if (customData?.annualEarnings) {
          document.data.earnings.totalGrossEarnings = customData.annualEarnings * 100
        }
        break

      case "deduction-summary":
        document = generateSampleDeductionSummary(taxYear)
        if (customData?.totalDeductions) {
          document.data.totalDeductions = customData.totalDeductions * 100
        }
        break

      default:
        return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${type} for ${taxYear}`,
      data: document,
    })
  } catch (error) {
    console.error("Sample document generation error:", error)
    return NextResponse.json({ error: "Failed to generate sample document" }, { status: 500 })
  }
}

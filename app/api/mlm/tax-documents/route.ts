import { type NextRequest, NextResponse } from "next/server"
import { mlmStripeService } from "@/lib/mlm/stripe-service"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { requireAuth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limiter"

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const targetUserId = searchParams.get("userId") || user.id
      const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())

      // Get user's tax information
      const mlmUser = await mlmDatabaseService.getMLMUser(targetUserId)
      if (!mlmUser) {
        return NextResponse.json({ 
          success: false,
          error: "MLM user not found" 
        }, { status: 404 })
      }

      // Get earnings for the year
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31)
      const commissions = await mlmDatabaseService.getCommissions(targetUserId, startDate, endDate)
      
      const paidCommissions = commissions.filter(c => c.status === 'paid')
      const totalEarnings = paidCommissions.reduce((sum, c) => sum + c.totalAmount, 0)

      // Check if user qualifies for 1099 (minimum $600)
      const qualifiesFor1099 = totalEarnings >= 600

      const taxDocument = {
        year,
        totalEarnings,
        commissionCount: paidCommissions.length,
        qualifiesFor1099,
        user: {
          id: mlmUser.userId,
          name: `${mlmUser.firstName} ${mlmUser.lastName}`,
          email: mlmUser.email,
          ssn: mlmUser.tax?.ssn ? '***-**-' + mlmUser.tax.ssn.slice(-4) : 'Not provided',
          address: mlmUser.billing?.address || 'Not provided'
        },
        earnings: {
          byMonth: getEarningsByMonth(paidCommissions, year),
          byType: getEarningsByType(paidCommissions),
          totalCommissions: paidCommissions.length,
          averageCommission: paidCommissions.length > 0 ? totalEarnings / paidCommissions.length : 0
        },
        generatedAt: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: taxDocument
      })
    } catch (error) {
      console.error("Tax document fetch error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to fetch tax document data" 
      }, { status: 500 })
    }
  }),
  'general'
)

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const { year, format = 'pdf' } = body

      if (!year) {
        return NextResponse.json({ 
          success: false,
          error: "Year is required" 
        }, { status: 400 })
      }

      // Validate year
      const currentYear = new Date().getFullYear()
      if (year < 2020 || year > currentYear) {
        return NextResponse.json({ 
          success: false,
          error: "Invalid year. Must be between 2020 and current year." 
        }, { status: 400 })
      }

      // Generate tax document
      const taxDocumentBuffer = await mlmStripeService.generateTaxDocument(user.id, year)

      // Return the document as a download
      const headers = new Headers()
      headers.set('Content-Type', 'application/pdf')
      headers.set('Content-Disposition', `attachment; filename="1099-${year}-${user.id}.pdf"`)
      headers.set('Content-Length', taxDocumentBuffer.length.toString())

      return new NextResponse(taxDocumentBuffer, {
        status: 200,
        headers
      })
    } catch (error) {
      console.error("Tax document generation error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to generate tax document",
        details: error.message
      }, { status: 500 })
    }
  }),
  'general'
)

// Helper functions
function getEarningsByMonth(commissions: any[], year: number): any[] {
  const monthlyEarnings = Array(12).fill(0)
  
  commissions.forEach(commission => {
    const month = new Date(commission.createdAt).getMonth()
    monthlyEarnings[month] += commission.totalAmount
  })

  return monthlyEarnings.map((amount, index) => ({
    month: new Date(year, index).toLocaleString('default', { month: 'long' }),
    amount: Math.round(amount * 100) / 100,
    commissionCount: commissions.filter(c => new Date(c.createdAt).getMonth() === index).length
  }))
}

function getEarningsByType(commissions: any[]): any[] {
  const typeEarnings: { [key: string]: { amount: number; count: number } } = {}
  
  commissions.forEach(commission => {
    if (!typeEarnings[commission.type]) {
      typeEarnings[commission.type] = { amount: 0, count: 0 }
    }
    typeEarnings[commission.type].amount += commission.totalAmount
    typeEarnings[commission.type].count += 1
  })

  return Object.entries(typeEarnings).map(([type, data]) => ({
    type: type.replace('_', ' ').toUpperCase(),
    amount: Math.round(data.amount * 100) / 100,
    count: data.count,
    percentage: Math.round((data.amount / commissions.reduce((sum, c) => sum + c.totalAmount, 0)) * 100)
  }))
}
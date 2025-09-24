import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { CreditMonitoringService } from '@/lib/credit-monitoring/credit-bureau-apis'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const bureau = searchParams.get('bureau') // 'experian', 'equifax', 'transunion', or 'all'
      
      if (bureau && bureau !== 'all') {
        // Get specific bureau report
        let report
        switch (bureau) {
          case 'experian':
            const { ExperianAPI } = await import('@/lib/credit-monitoring/credit-bureau-apis')
            report = await ExperianAPI.getCreditReport(user.id)
            break
          case 'equifax':
            const { EquifaxAPI } = await import('@/lib/credit-monitoring/credit-bureau-apis')
            report = await EquifaxAPI.getCreditReport(user.id)
            break
          case 'transunion':
            const { TransUnionAPI } = await import('@/lib/credit-monitoring/credit-bureau-apis')
            report = await TransUnionAPI.getCreditReport(user.id)
            break
          default:
            return NextResponse.json(
              { success: false, error: 'Invalid bureau specified' },
              { status: 400 }
            )
        }
        
        return NextResponse.json({
          success: true,
          report
        })
      } else {
        // Get all bureau reports
        const reports = await CreditMonitoringService.getAllCreditReports(user.id)
        
        return NextResponse.json({
          success: true,
          reports,
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to fetch credit reports:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch credit reports' },
        { status: 500 }
      )
    }
  }),
  'general'
)

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
        // Get specific bureau score
        let score
        switch (bureau) {
          case 'experian':
            const { ExperianAPI } = await import('@/lib/credit-monitoring/credit-bureau-apis')
            score = await ExperianAPI.getCreditScore(user.id)
            break
          case 'equifax':
            const { EquifaxAPI } = await import('@/lib/credit-monitoring/credit-bureau-apis')
            score = await EquifaxAPI.getCreditScore(user.id)
            break
          case 'transunion':
            const { TransUnionAPI } = await import('@/lib/credit-monitoring/credit-bureau-apis')
            score = await TransUnionAPI.getCreditScore(user.id)
            break
          default:
            return NextResponse.json(
              { success: false, error: 'Invalid bureau specified' },
              { status: 400 }
            )
        }
        
        return NextResponse.json({
          success: true,
          score,
          average: score.score,
          trend: 'stable'
        })
      } else {
        // Get all bureau scores
        const scores = await CreditMonitoringService.getAllCreditScores(user.id)
        const average = CreditMonitoringService.calculateAverageScore(scores)
        const trend = CreditMonitoringService.calculateScoreTrend(scores)
        
        return NextResponse.json({
          success: true,
          scores,
          average,
          trend,
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to fetch credit scores:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch credit scores' },
        { status: 500 }
      )
    }
  }),
  'general'
)

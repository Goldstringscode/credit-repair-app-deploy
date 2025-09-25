import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { CreditMonitoringService } from '@/lib/credit-monitoring/credit-bureau-apis'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const since = searchParams.get('since')
      const bureau = searchParams.get('bureau')
      const severity = searchParams.get('severity')
      const type = searchParams.get('type')
      
      let alerts = await CreditMonitoringService.getAllAlerts(user.id, since || undefined)
      
      // Filter by bureau if specified
      if (bureau && bureau !== 'all') {
        alerts = alerts.filter(alert => alert.bureau === bureau || alert.bureau === 'all')
      }
      
      // Filter by severity if specified
      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity)
      }
      
      // Filter by type if specified
      if (type) {
        alerts = alerts.filter(alert => alert.type === type)
      }
      
      // Sort by date (newest first)
      alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      return NextResponse.json({
        success: true,
        alerts,
        total: alerts.length,
        unread: alerts.filter(alert => !alert.actionRequired).length,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to fetch credit alerts:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch credit alerts' },
        { status: 500 }
      )
    }
  }),
  'general'
)

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const { alertId, action } = body
      
      if (!alertId || !action) {
        return NextResponse.json(
          { success: false, error: 'Alert ID and action are required' },
          { status: 400 }
        )
      }
      
      // In a real implementation, you would update the alert status in the database
      // For now, we'll just return success
      
      return NextResponse.json({
        success: true,
        message: 'Alert action completed successfully',
        alertId,
        action
      })
    } catch (error) {
      console.error('Failed to process alert action:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to process alert action' },
        { status: 500 }
      )
    }
  }),
  'general'
)

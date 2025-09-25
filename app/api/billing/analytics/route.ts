import { NextRequest, NextResponse } from 'next/server'
import { billingAnalytics } from '@/lib/billing-analytics'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schemas
const generateReportSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['revenue', 'subscriptions', 'customers', 'churn', 'custom']),
  period: z.object({
    start: z.string(),
    end: z.string()
  }),
  generatedBy: z.string().min(1)
})

const createAlertSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['revenue_drop', 'churn_increase', 'payment_failure', 'subscription_canceled', 'custom']),
  condition: z.object({
    metric: z.string().min(1),
    operator: z.enum(['greater_than', 'less_than', 'equals', 'not_equals']),
    threshold: z.number(),
    timeWindow: z.number().min(1)
  }),
  isActive: z.boolean().default(true),
  recipients: z.array(z.string().email()).min(1)
})

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const type = searchParams.get('type')
      const timeRange = searchParams.get('timeRange') || '30d'
      const forceRefresh = searchParams.get('forceRefresh') === 'true'

      if (type === 'metrics' || !type) {
        console.log('📊 Fetching billing metrics for timeRange:', timeRange)
        const metrics = await billingAnalytics.getBillingMetrics(forceRefresh)
        
        return NextResponse.json({
          success: true,
          metrics,
          timeRange,
          generatedAt: new Date().toISOString()
        })
      }

      if (type === 'reports') {
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')
        
        console.log('📊 Fetching billing reports')
        const reports = await billingAnalytics.getReports(limit, offset)
        
        return NextResponse.json({
          success: true,
          reports: reports.map(report => ({
            id: report.id,
            name: report.name,
            type: report.type,
            period: report.period,
            generatedAt: report.generatedAt,
            generatedBy: report.generatedBy
          }))
        })
      }

      if (type === 'alerts') {
        console.log('📊 Fetching billing alerts')
        const alerts = await billingAnalytics.getAlerts()
        
        return NextResponse.json({
          success: true,
          alerts: alerts.map(alert => ({
            id: alert.id,
            name: alert.name,
            description: alert.description,
            type: alert.type,
            condition: alert.condition,
            isActive: alert.isActive,
            lastTriggered: alert.lastTriggered,
            triggerCount: alert.triggerCount,
            recipients: alert.recipients,
            createdAt: alert.createdAt
          }))
        })
      }

      if (type === 'forecast') {
        const months = parseInt(searchParams.get('months') || '12')
        
        console.log('📊 Generating revenue forecast')
        const forecast = await billingAnalytics.getRevenueForecast(months)
        
        return NextResponse.json({
          success: true,
          forecast
        })
      }

      if (type === 'churn') {
        console.log('📊 Fetching churn analysis')
        const churnAnalysis = await billingAnalytics.getChurnAnalysis()
        
        return NextResponse.json({
          success: true,
          churnAnalysis
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Invalid type parameter'
      }, { status: 400 })

    } catch (error: any) {
      console.error('❌ Failed to fetch analytics:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch analytics',
        message: error.message
      }, { status: 500 })
    }
  }
)

export const POST = withRateLimit(
  withValidation({
    body: z.union([
      z.object({
        action: z.literal('generate_report'),
        name: z.string().min(1),
        type: z.enum(['revenue', 'subscriptions', 'customers', 'churn', 'custom']),
        period: z.object({
          start: z.string(),
          end: z.string()
        }),
        generatedBy: z.string().min(1)
      }),
      z.object({
        action: z.literal('create_alert'),
        name: z.string().min(1),
        description: z.string().min(1),
        type: z.enum(['revenue_drop', 'churn_increase', 'payment_failure', 'subscription_canceled', 'custom']),
        condition: z.object({
          metric: z.string().min(1),
          operator: z.enum(['greater_than', 'less_than', 'equals', 'not_equals']),
          threshold: z.number(),
          timeWindow: z.number().min(1)
        }),
        isActive: z.boolean().default(true),
        recipients: z.array(z.string().email()).min(1)
      })
    ])
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const body = validatedData?.body
        const action = body.action

        if (action === 'generate_report') {
          console.log('📊 Generating billing report:', body.name)
          const report = await billingAnalytics.generateReport(
            body.name,
            body.type,
            body.period,
            body.generatedBy
          )

          return NextResponse.json({
            success: true,
            report: {
              id: report.id,
              name: report.name,
              type: report.type,
              period: report.period,
              generatedAt: report.generatedAt,
              generatedBy: report.generatedBy
            }
          })
        }

        if (action === 'create_alert') {
          console.log('📊 Creating billing alert:', body.name)
          const alert = await billingAnalytics.createAlert(body)

          return NextResponse.json({
            success: true,
            alert: {
              id: alert.id,
              name: alert.name,
              description: alert.description,
              type: alert.type,
              condition: alert.condition,
              isActive: alert.isActive,
              recipients: alert.recipients,
              createdAt: alert.createdAt
            }
          })
        }

        if (action === 'check_alerts') {
          console.log('📊 Checking billing alerts')
          await billingAnalytics.checkAlerts()

          return NextResponse.json({
            success: true,
            message: 'Alerts checked successfully'
          })
        }

        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })

      } catch (error: any) {
        console.error('❌ Analytics action failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Analytics action failed',
          message: error.message
        }, { status: 500 })
      }
    }
  )
)



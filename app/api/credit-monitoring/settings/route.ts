import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { MonitoringSettings } from '@/lib/credit-monitoring/credit-bureau-apis'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      // In a real implementation, you would fetch from database
      // For now, return default settings
      const settings: MonitoringSettings = {
        userId: user.id,
        enabled: true,
        scoreAlerts: {
          enabled: true,
          threshold: 10,
          direction: 'both'
        },
        newAccountAlerts: true,
        inquiryAlerts: true,
        paymentAlerts: true,
        balanceAlerts: {
          enabled: true,
          threshold: 1000
        },
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        frequency: 'immediate'
      }
      
      return NextResponse.json({
        success: true,
        settings
      })
    } catch (error) {
      console.error('Failed to fetch monitoring settings:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch monitoring settings' },
        { status: 500 }
      )
    }
  }),
  'general'
)

export const PUT = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      
      // Validate the settings
      const validSettings = {
        userId: user.id,
        enabled: Boolean(body.enabled),
        scoreAlerts: {
          enabled: Boolean(body.scoreAlerts?.enabled),
          threshold: Number(body.scoreAlerts?.threshold) || 10,
          direction: ['increase', 'decrease', 'both'].includes(body.scoreAlerts?.direction) 
            ? body.scoreAlerts.direction 
            : 'both'
        },
        newAccountAlerts: Boolean(body.newAccountAlerts),
        inquiryAlerts: Boolean(body.inquiryAlerts),
        paymentAlerts: Boolean(body.paymentAlerts),
        balanceAlerts: {
          enabled: Boolean(body.balanceAlerts?.enabled),
          threshold: Number(body.balanceAlerts?.threshold) || 1000
        },
        emailNotifications: Boolean(body.emailNotifications),
        smsNotifications: Boolean(body.smsNotifications),
        pushNotifications: Boolean(body.pushNotifications),
        frequency: ['immediate', 'daily', 'weekly'].includes(body.frequency) 
          ? body.frequency 
          : 'immediate'
      }
      
      // In a real implementation, you would save to database
      // For now, just return success
      
      return NextResponse.json({
        success: true,
        message: 'Monitoring settings updated successfully',
        settings: validSettings
      })
    } catch (error) {
      console.error('Failed to update monitoring settings:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update monitoring settings' },
        { status: 500 }
      )
    }
  }),
  'general'
)

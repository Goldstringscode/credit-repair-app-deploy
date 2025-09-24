import { NextRequest, NextResponse } from 'next/server'
import { testStripeConnection, validateStripeConfig } from '@/lib/stripe/config'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      console.log('🔍 Testing Stripe connection...')
      
      // Validate configuration
      const configValidation = validateStripeConfig()
      
      if (!configValidation.valid) {
        return NextResponse.json({
          success: false,
          error: 'Stripe configuration invalid',
          message: configValidation.message,
          warnings: configValidation.warnings,
          config: {
            hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
            hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
            hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
            usingDemoKeys: stripeConfig.secretKey === 'sk_test_demo_key_for_testing'
          }
        }, { status: 400 })
      }

      // Test connection
      const connectionTest = await testStripeConnection()
      
      if (!connectionTest.success) {
        return NextResponse.json({
          success: false,
          error: 'Stripe connection failed',
          message: connectionTest.error
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Stripe connection successful',
        account: connectionTest.account
      })

    } catch (error: any) {
      console.error('❌ Stripe connection test failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Connection test failed',
        message: error.message
      }, { status: 500 })
    }
  }
)

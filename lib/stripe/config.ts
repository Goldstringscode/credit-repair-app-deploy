import Stripe from 'stripe'

const STRIPE_API_VERSION = '2025-08-27.basil' as const

// Stripe configuration
export const stripeConfig = {
  // Read keys from environment — no insecure fallbacks
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiVersion: STRIPE_API_VERSION,

  // App info for Stripe dashboard
  appInfo: {
    name: 'Credit Repair App',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL
  }
}

// Initialize Stripe instance (only if we have a valid key)
export const stripe = stripeConfig.secretKey
  ? new Stripe(stripeConfig.secretKey, {
      apiVersion: STRIPE_API_VERSION,
      appInfo: stripeConfig.appInfo,
      typescript: true
    })
  : null

// Client-side Stripe instance
export const getStripeClient = () => {
  if (typeof window === 'undefined') {
    return null
  }
  
  return require('@stripe/stripe-js').loadStripe(stripeConfig.publishableKey)
}

// Validate Stripe configuration
export const validateStripeConfig = () => {
  const errors: string[] = []
  
  if (!stripeConfig.secretKey) {
    errors.push('STRIPE_SECRET_KEY is not set')
  }
  
  if (!stripeConfig.publishableKey) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (or STRIPE_PUBLISHABLE_KEY) is not set')
  }
  
  if (!stripeConfig.webhookSecret) {
    errors.push('STRIPE_WEBHOOK_SECRET is not set')
  }
  
  if (errors.length > 0) {
    console.warn('Stripe configuration warnings:', errors.join(', '))
    return {
      valid: false,
      warnings: errors,
      message: 'Stripe keys are missing. Set STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and STRIPE_WEBHOOK_SECRET.'
    }
  }
  
  return { valid: true, warnings: [], message: 'Stripe configuration is valid' }
}

// Test Stripe connection
export const testStripeConnection = async () => {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.'
      }
    }

    const account = await stripe.accounts.retrieve()
    return {
      success: true,
      account: {
        id: account.id,
        country: account.country,
        type: account.type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}


import Stripe from 'stripe'

// Stripe configuration
export const stripeConfig = {
  // Use test keys in development, live keys in production
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key_for_testing',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key_for_testing',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo_secret_for_testing',
  
  // API version - use latest stable
  apiVersion: '2024-06-20' as const,
  
  // App info for Stripe dashboard
  appInfo: {
    name: 'Credit Repair App',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
}

// Initialize Stripe instance (only if we have a valid key)
export const stripe = stripeConfig.secretKey && stripeConfig.secretKey !== 'sk_test_demo_key_for_testing' 
  ? new Stripe(stripeConfig.secretKey, {
      apiVersion: stripeConfig.apiVersion,
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
  
  if (!stripeConfig.secretKey || stripeConfig.secretKey === 'sk_test_demo_key_for_testing') {
    errors.push('STRIPE_SECRET_KEY is required (using demo key for testing)')
  }
  
  if (!stripeConfig.publishableKey || stripeConfig.publishableKey === 'pk_test_demo_key_for_testing') {
    errors.push('STRIPE_PUBLISHABLE_KEY is required (using demo key for testing)')
  }
  
  if (!stripeConfig.webhookSecret || stripeConfig.webhookSecret === 'whsec_demo_secret_for_testing') {
    errors.push('STRIPE_WEBHOOK_SECRET is required (using demo secret for testing)')
  }
  
  // For testing, we'll return a warning instead of throwing an error
  if (errors.length > 0) {
    console.warn('Stripe configuration warnings:', errors.join(', '))
    return {
      valid: false,
      warnings: errors,
      message: 'Using demo keys for testing. Set up real Stripe keys for production.'
    }
  }
  
  return { valid: true, warnings: [], message: 'Stripe configuration is valid' }
}

// Test Stripe connection
export const testStripeConnection = async () => {
  try {
    // If using demo keys, return a mock response
    if (stripeConfig.secretKey === 'sk_test_demo_key_for_testing') {
      return {
        success: true,
        account: {
          id: 'acct_demo_testing',
          country: 'US',
          type: 'standard',
          charges_enabled: false,
          payouts_enabled: false
        },
        demo: true,
        message: 'Using demo keys - set up real Stripe keys for actual testing'
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

import Stripe from 'stripe'

/**
 * Stripe configuration that switches between test and live modes
 */
export function getStripeConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  const useLiveStripe = process.env.USE_LIVE_STRIPE === 'true'
  
  const secretKey = isProduction || useLiveStripe 
    ? process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY

  const publishableKey = isProduction || useLiveStripe
    ? process.env.STRIPE_PUBLISHABLE_KEY_LIVE || process.env.STRIPE_PUBLISHABLE_KEY
    : process.env.STRIPE_PUBLISHABLE_KEY_TEST || process.env.STRIPE_PUBLISHABLE_KEY

  const webhookSecret = isProduction || useLiveStripe
    ? process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey) {
    throw new Error('Stripe secret key is required. Please set STRIPE_SECRET_KEY environment variable.')
  }

  if (!publishableKey) {
    throw new Error('Stripe publishable key is required. Please set STRIPE_PUBLISHABLE_KEY environment variable.')
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
    maxNetworkRetries: 3,
    timeout: 30000,
  })

  console.log(`💳 Stripe: Using ${isProduction || useLiveStripe ? 'LIVE' : 'TEST'} mode`)

  return {
    stripe,
    secretKey,
    publishableKey,
    webhookSecret,
    isLive: isProduction || useLiveStripe
  }
}

export const stripeConfig = getStripeConfig()
export const stripe = stripeConfig.stripe
export const STRIPE_PUBLISHABLE_KEY = stripeConfig.publishableKey
export const STRIPE_WEBHOOK_SECRET = stripeConfig.webhookSecret

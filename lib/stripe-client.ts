import Stripe from 'stripe'

let _stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!_stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }
    _stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    })
  }
  return _stripeClient
}

// Mock Stripe service for testing when real Stripe keys are not available
export const mockStripeService = {
  async createPaymentIntent(data: any) {
    return {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret`,
      status: 'requires_payment_method',
      amount: Math.round(data.amount * 100),
      currency: data.currency,
      metadata: data.metadata || {}
    }
  },

  async createCustomer(data: any) {
    return {
      id: `cus_mock_${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone,
      address: data.address,
      created: Math.floor(Date.now() / 1000),
      metadata: data.metadata || {}
    }
  },

  async createPaymentMethod(data: any) {
    return {
      id: `pm_mock_${Date.now()}`,
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025
      },
      billing_details: data.billing_details
    }
  },

  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    return {
      id: paymentMethodId,
      customer: customerId,
      type: 'card'
    }
  },

  async getCustomerPaymentMethods(customerId: string) {
    return [{
      id: `pm_mock_${Date.now()}`,
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025
      }
    }]
  },

  async getPaymentIntent(paymentIntentId: string) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 2999,
      currency: 'usd'
    }
  },

  async cancelPaymentIntent(paymentIntentId: string) {
    return {
      id: paymentIntentId,
      status: 'canceled',
      amount: 2999,
      currency: 'usd'
    }
  }
}

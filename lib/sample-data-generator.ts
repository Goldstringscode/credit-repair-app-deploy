import { database } from './database-config'

export async function generateSamplePayments(userId: string) {
  const samplePayments = [
    {
      userId,
      amount: 2999, // $29.99
      currency: 'usd',
      status: 'succeeded',
      description: 'Basic Plan - Monthly Subscription',
      type: 'subscription',
      method: 'card',
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 5999, // $59.99
      currency: 'usd',
      status: 'succeeded',
      description: 'Premium Plan - Monthly Subscription',
      type: 'subscription',
      method: 'card',
      transactionId: `txn_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 15000, // $150.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Credit Repair Service - One-time Payment',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 2}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 5000, // $50.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Dispute Letter Service',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 3}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 2500, // $25.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Credit Monitoring Service',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 4}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 8000, // $80.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Priority Support Package',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 5}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 12000, // $120.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Advanced Credit Analysis',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 6}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 3500, // $35.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Credit Report Review',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 7}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 4500, // $45.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Dispute Follow-up Service',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 8}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 6000, // $60.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Credit Score Improvement Consultation',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 9}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 7500, // $75.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Identity Theft Protection Service',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 10}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 2000, // $20.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Credit Education Course',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 11}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 3000, // $30.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Credit Repair Consultation',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 12}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 4000, // $40.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Debt Validation Service',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 13}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    },
    {
      userId,
      amount: 10000, // $100.00
      currency: 'usd',
      status: 'succeeded',
      description: 'Comprehensive Credit Repair Package',
      type: 'one_time',
      method: 'card',
      transactionId: `txn_${Date.now() + 14}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {}
    }
  ]

  // Create all sample payments
  const createdPayments = []
  for (const paymentData of samplePayments) {
    const payment = await database.createPayment(paymentData)
    createdPayments.push(payment)
  }

  return createdPayments
}

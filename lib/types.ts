export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  subscriptionId?: string
  customerId?: string
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  customerId: string
  planId: string
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  trialStart?: string
  trialEnd?: string
  quantity: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Plan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  interval: 'day' | 'week' | 'month' | 'year'
  intervalCount: number
  trialPeriodDays?: number
  metadata: Record<string, any>
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  description: string
  type: 'subscription' | 'one_time' | 'refund'
  method: 'card' | 'bank' | 'mail'
  transactionId: string
  metadata: Record<string, any>
  createdAt: string
}

export interface PaymentCard {
  id: string
  userId: string
  last4: string
  brand: string
  expMonth: number
  expYear: number
  isDefault: boolean
  name: string
  zipCode: string
  metadata: Record<string, any>
  createdAt: string
}

export interface MailPayment {
  id: string
  userId: string
  type: 'certified' | 'priority'
  letterType: 'dispute' | 'verification' | 'follow_up' | 'other'
  amount: number
  status: 'pending' | 'sent' | 'delivered' | 'returned' | 'failed'
  trackingNumber: string
  sentDate: string
  expectedDelivery: string
  actualDelivery?: string
  recipient: string
  address: string
  description: string
  notes?: string
  metadata: Record<string, any>
  createdAt: string
}

export interface BillingStats {
  totalSpent: number
  nextPayment: number
  paymentMethod: string
  lastPayment: Payment | null
  upcomingPayments: Payment[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

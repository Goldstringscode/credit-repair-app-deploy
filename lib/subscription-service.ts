interface Subscription {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  planId: string
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused' | 'incomplete' | 'grace_period'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  amount: number
  currency: string
  nextBillingDate: string
  createdAt: string
  lastPaymentDate?: string
  lastPaymentAmount?: number
  paymentMethod: string
  billingCycle: 'month' | 'year'
  prorationEnabled: boolean
  dunningEnabled: boolean
  notes?: string
  isExecutiveAccount?: boolean
  gracePeriodEndDate?: string
  gracePeriodDaysRemaining?: number
}

interface SubscriptionFilters {
  status?: string
  plan?: string
  search?: string
  page?: number
  limit?: number
}

interface SubscriptionResponse {
  success: boolean
  data: {
    subscriptions: Subscription[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
    statusCounts: {
      all: number
      active: number
      trialing: number
      past_due: number
      cancelled: number
      paused: number
      grace_period: number
    }
    metrics: {
      monthlyRecurringRevenue: number
      activeSubscriptions: number
      averageRevenuePerUser: number
    }
  }
  error?: string
  details?: string
}

interface SubscriptionActionResponse {
  success: boolean
  data: {
    subscription: Subscription
    message: string
  }
  error?: string
  details?: string
}

class SubscriptionService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  async getSubscriptions(filters: SubscriptionFilters = {}): Promise<SubscriptionResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.plan) params.append('plan', filters.plan)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`${this.baseUrl}/api/admin/subscriptions?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      return {
        success: false,
        data: {
          subscriptions: [],
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          },
          statusCounts: {
            all: 0,
            active: 0,
            trialing: 0,
            past_due: 0,
            cancelled: 0,
            paused: 0
          },
          metrics: {
            monthlyRecurringRevenue: 0,
            activeSubscriptions: 0,
            averageRevenuePerUser: 0
          }
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async updateSubscription(
    subscriptionId: string, 
    action: 'cancel' | 'pause' | 'resume' | 'update', 
    data?: any
  ): Promise<SubscriptionActionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          subscriptionId,
          data
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error updating subscription:', error)
      return {
        success: false,
        data: {
          subscription: {} as Subscription,
          message: 'Failed to update subscription'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<SubscriptionActionResponse> {
    return this.updateSubscription(subscriptionId, 'cancel', { reason })
  }

  async pauseSubscription(subscriptionId: string, reason?: string): Promise<SubscriptionActionResponse> {
    return this.updateSubscription(subscriptionId, 'pause', { reason })
  }

  async resumeSubscription(subscriptionId: string, reason?: string): Promise<SubscriptionActionResponse> {
    return this.updateSubscription(subscriptionId, 'resume', { reason })
  }

  async updateSubscriptionData(subscriptionId: string, data: Partial<Subscription>): Promise<SubscriptionActionResponse> {
    return this.updateSubscription(subscriptionId, 'update', data)
  }

  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionActionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          subscriptionData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error creating subscription:', error)
      return {
        success: false,
        data: {
          subscription: {} as Subscription,
          message: 'Failed to create subscription'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const subscriptionService = new SubscriptionService()
export type { Subscription, SubscriptionFilters, SubscriptionResponse, SubscriptionActionResponse }

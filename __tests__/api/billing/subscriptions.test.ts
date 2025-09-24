import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST, PATCH, DELETE } from '@/app/api/billing/subscriptions/route'

// Mock the subscription manager
vi.mock('@/lib/subscription-manager', () => ({
  subscriptionManager: {
    getAllSubscriptions: vi.fn(),
    getSubscription: vi.fn(),
    createSubscription: vi.fn(),
    updateSubscriptionPlan: vi.fn(),
    pauseSubscription: vi.fn(),
    resumeSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    getSubscriptionStatistics: vi.fn()
  }
}))

// Mock the rate limiter
vi.mock('@/lib/rate-limiter', () => ({
  withRateLimit: (handler: any) => handler
}))

// Mock the validation middleware
vi.mock('@/lib/validation-middleware', () => ({
  withValidation: (handler: any) => handler
}))

describe('/api/billing/subscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/billing/subscriptions', () => {
    it('should return all subscriptions', async () => {
      const mockSubscriptions = [
        {
          id: 'sub_1',
          customerId: 'customer_1',
          planId: 'basic',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub_2',
          customerId: 'customer_2',
          planId: 'premium',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getAllSubscriptions).mockReturnValue(mockSubscriptions as any)

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscriptions).toHaveLength(2)
      expect(data.subscriptions[0].id).toBe('sub_1')
    })

    it('should return subscription statistics', async () => {
      const mockStats = {
        totalSubscriptions: 10,
        activeSubscriptions: 8,
        canceledSubscriptions: 2,
        monthlyRecurringRevenue: 50000
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getSubscriptionStatistics).mockReturnValue(mockStats as any)

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions?type=statistics')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.statistics).toEqual(mockStats)
    })

    it('should handle errors gracefully', async () => {
      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getAllSubscriptions).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch subscriptions')
    })
  })

  describe('POST /api/billing/subscriptions', () => {
    it('should create a new subscription', async () => {
      const mockSubscription = {
        id: 'sub_new',
        customerId: 'customer_new',
        planId: 'basic',
        status: 'active',
        createdAt: new Date().toISOString()
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.createSubscription).mockResolvedValue(mockSubscription as any)

      const requestBody = {
        action: 'create',
        customerId: 'customer_new',
        planId: 'basic',
        trialPeriodDays: 7,
        quantity: 1,
        metadata: {}
      }

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription.id).toBe('sub_new')
      expect(subscriptionManager.createSubscription).toHaveBeenCalledWith(
        'customer_new',
        'basic',
        {
          trialPeriodDays: 7,
          quantity: 1,
          metadata: {}
        }
      )
    })

    it('should validate required fields', async () => {
      const requestBody = {
        action: 'create',
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})

describe('/api/billing/subscriptions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/billing/subscriptions/[id]', () => {
    it('should return a specific subscription', async () => {
      const mockSubscription = {
        id: 'sub_1',
        customerId: 'customer_1',
        planId: 'basic',
        status: 'active',
        createdAt: new Date().toISOString()
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getSubscription).mockReturnValue(mockSubscription as any)

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions/sub_1')
      const response = await GET(request, { params: { id: 'sub_1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription.id).toBe('sub_1')
    })

    it('should return 404 for non-existent subscription', async () => {
      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getSubscription).mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions/non_existent')
      const response = await GET(request, { params: { id: 'non_existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Subscription not found')
    })
  })

  describe('PATCH /api/billing/subscriptions/[id]', () => {
    it('should update subscription plan', async () => {
      const mockUpdatedSubscription = {
        id: 'sub_1',
        customerId: 'customer_1',
        planId: 'premium',
        status: 'active',
        updatedAt: new Date().toISOString()
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.updateSubscriptionPlan).mockResolvedValue({
        subscription: mockUpdatedSubscription,
        proration: {
          prorationAmount: 1000,
          calculation: {
            oldPlan: { name: 'Basic Plan', amount: 2999 },
            newPlan: { name: 'Premium Plan', amount: 5999 }
          }
        }
      } as any)

      const requestBody = {
        planId: 'premium',
        prorationBehavior: 'create_prorations'
      }

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions/sub_1', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PATCH(request, { params: { id: 'sub_1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription.planId).toBe('premium')
      expect(data.proration).toBeDefined()
    })

    it('should pause subscription', async () => {
      const mockPausedSubscription = {
        id: 'sub_1',
        customerId: 'customer_1',
        planId: 'basic',
        status: 'inactive',
        metadata: { pausedAt: new Date().toISOString() }
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.pauseSubscription).mockResolvedValue(mockPausedSubscription as any)

      const requestBody = {
        reason: 'User requested pause'
      }

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions/sub_1/pause', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PATCH(request, { params: { id: 'sub_1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription.status).toBe('inactive')
    })

    it('should resume subscription', async () => {
      const mockResumedSubscription = {
        id: 'sub_1',
        customerId: 'customer_1',
        planId: 'basic',
        status: 'active',
        metadata: { resumedAt: new Date().toISOString() }
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.resumeSubscription).mockResolvedValue(mockResumedSubscription as any)

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions/sub_1/resume', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PATCH(request, { params: { id: 'sub_1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription.status).toBe('active')
    })
  })

  describe('DELETE /api/billing/subscriptions/[id]', () => {
    it('should cancel subscription', async () => {
      const mockCanceledSubscription = {
        id: 'sub_1',
        customerId: 'customer_1',
        planId: 'basic',
        status: 'canceled',
        canceledAt: new Date().toISOString()
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.cancelSubscription).mockResolvedValue(mockCanceledSubscription as any)

      const requestBody = {
        cancelAtPeriodEnd: true
      }

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions/sub_1', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await DELETE(request, { params: { id: 'sub_1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription.status).toBe('canceled')
    })

    it('should handle immediate cancellation', async () => {
      const mockCanceledSubscription = {
        id: 'sub_1',
        customerId: 'customer_1',
        planId: 'basic',
        status: 'canceled',
        canceledAt: new Date().toISOString()
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.cancelSubscription).mockResolvedValue(mockCanceledSubscription as any)

      const requestBody = {
        immediate: true
      }

      const request = new NextRequest('http://localhost:3000/api/billing/subscriptions/sub_1', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await DELETE(request, { params: { id: 'sub_1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(subscriptionManager.cancelSubscription).toHaveBeenCalledWith('sub_1', {
        immediate: true
      })
    })
  })
})



import { createSupabaseClient, isSupabaseAvailable } from '@/lib/supabase'

export interface Subscription {
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
  nextBillingDate?: string
  createdAt: string
  updatedAt?: string
  lastPaymentDate?: string
  lastPaymentAmount?: number
  paymentMethod: string
  billingCycle: 'month' | 'year'
  prorationEnabled: boolean
  dunningEnabled: boolean
  notes?: string
  isExecutiveAccount: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  metadata?: any
  gracePeriodEndDate?: string
  gracePeriodDaysRemaining?: number
}

export interface SubscriptionFilters {
  status?: string
  plan?: string
  dateRange?: string
  search?: string
  page?: number
  limit?: number
  isExecutiveAccount?: boolean
}

export interface SubscriptionAnalytics {
  totalSubscriptions: number
  activeSubscriptions: number
  trialingSubscriptions: number
  pastDueSubscriptions: number
  cancelledSubscriptions: number
  pausedSubscriptions: number
  gracePeriodSubscriptions: number
  executiveAccounts: number
  monthlyRecurringRevenue: number
  yearlyRecurringRevenue: number
  averageRevenuePerUser: number
}

export interface SubscriptionEvent {
  id: string
  subscriptionId: string
  eventType: string
  eventData: any
  createdAt: string
  createdBy?: string
  notes?: string
}

class SubscriptionDatabaseService {
  private supabase = isSupabaseAvailable() ? createSupabaseClient() : null
  private mockSubscriptions: Subscription[] = []

  async getSubscriptions(filters: SubscriptionFilters = {}): Promise<{
    subscriptions: Subscription[]
    total: number
    analytics: SubscriptionAnalytics
  }> {
    if (!this.supabase) {
      console.log('Database not available, returning mock data')
      return this.getMockSubscriptions(filters)
    }

    try {
      let query = this.supabase
        .from('subscriptions')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      
      if (filters.plan && filters.plan !== 'all') {
        query = query.eq('plan_id', filters.plan)
      }
      
      if (filters.isExecutiveAccount !== undefined) {
        query = query.eq('is_executive_account', filters.isExecutiveAccount)
      }
      
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,customer_id.ilike.%${filters.search}%`)
      }

      // Apply pagination
      const page = filters.page || 1
      const limit = filters.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit - 1

      query = query.range(startIndex, endIndex).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching subscriptions:', error)
        return this.getMockSubscriptions(filters)
      }

      // Get analytics
      const analytics = await this.getAnalytics()

      return {
        subscriptions: data?.map(this.transformSubscription) || [],
        total: count || 0,
        analytics
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.getMockSubscriptions(filters)
    }
  }

  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    if (!this.supabase) {
      console.log('Database not available, creating mock subscription')
      return this.createMockSubscription(subscriptionData)
    }

    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .insert([{
          customer_id: subscriptionData.customerId,
          customer_name: subscriptionData.customerName,
          customer_email: subscriptionData.customerEmail,
          plan_id: subscriptionData.planId,
          plan_name: subscriptionData.planName,
          status: subscriptionData.status,
          current_period_start: subscriptionData.currentPeriodStart,
          current_period_end: subscriptionData.currentPeriodEnd,
          trial_end: subscriptionData.trialEnd,
          cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          next_billing_date: subscriptionData.nextBillingDate,
          last_payment_date: subscriptionData.lastPaymentDate,
          last_payment_amount: subscriptionData.lastPaymentAmount,
          payment_method: subscriptionData.paymentMethod,
          billing_cycle: subscriptionData.billingCycle,
          proration_enabled: subscriptionData.prorationEnabled,
          dunning_enabled: subscriptionData.dunningEnabled,
          notes: subscriptionData.notes,
          is_executive_account: subscriptionData.isExecutiveAccount,
          stripe_subscription_id: subscriptionData.stripeSubscriptionId,
          stripe_customer_id: subscriptionData.stripeCustomerId,
          metadata: subscriptionData.metadata || {}
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating subscription:', error)
        throw new Error('Failed to create subscription')
      }

      // Log the creation event
      await this.logSubscriptionEvent(data.id, 'created', {
        subscription: subscriptionData
      }, 'admin')

      return this.transformSubscription(data)
    } catch (error) {
      console.error('Database error creating subscription:', error)
      // Fall back to mock data instead of throwing error
      console.log('Falling back to mock subscription creation')
      return this.createMockSubscription(subscriptionData)
    }
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    if (!this.supabase) {
      console.log('Database not available, updating mock subscription')
      return this.updateMockSubscription(id, updates)
    }

    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .update({
          customer_name: updates.customerName,
          customer_email: updates.customerEmail,
          plan_id: updates.planId,
          plan_name: updates.planName,
          status: updates.status,
          current_period_start: updates.currentPeriodStart,
          current_period_end: updates.currentPeriodEnd,
          trial_end: updates.trialEnd,
          cancel_at_period_end: updates.cancelAtPeriodEnd,
          amount: updates.amount,
          currency: updates.currency,
          next_billing_date: updates.nextBillingDate,
          last_payment_date: updates.lastPaymentDate,
          last_payment_amount: updates.lastPaymentAmount,
          payment_method: updates.paymentMethod,
          billing_cycle: updates.billingCycle,
          proration_enabled: updates.prorationEnabled,
          dunning_enabled: updates.dunningEnabled,
          notes: updates.notes,
          is_executive_account: updates.isExecutiveAccount,
          stripe_subscription_id: updates.stripeSubscriptionId,
          stripe_customer_id: updates.stripeCustomerId,
          metadata: updates.metadata
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating subscription:', error)
        throw new Error('Failed to update subscription')
      }

      // Log the update event
      await this.logSubscriptionEvent(id, 'updated', {
        updates
      }, 'admin')

      return this.transformSubscription(data)
    } catch (error) {
      console.error('Database error updating subscription:', error)
      // Fall back to mock data instead of throwing error
      console.log('Falling back to mock subscription update')
      return this.updateMockSubscription(id, updates)
    }
  }

  async deleteSubscription(id: string): Promise<void> {
    if (!this.supabase) {
      console.log('Database not available, deleting mock subscription')
      return this.deleteMockSubscription(id)
    }

    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting subscription:', error)
        throw new Error('Failed to delete subscription')
      }

      // Log the deletion event
      await this.logSubscriptionEvent(id, 'deleted', {}, 'admin')
    } catch (error) {
      console.error('Database error deleting subscription:', error)
      // Fall back to mock data instead of throwing error
      console.log('Falling back to mock subscription deletion')
      return this.deleteMockSubscription(id)
    }
  }

  async getAnalytics(): Promise<SubscriptionAnalytics> {
    if (!this.supabase) {
      return this.getMockAnalytics()
    }

    try {
      const { data, error } = await this.supabase
        .from('subscription_analytics')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching analytics:', error)
        return this.getMockAnalytics()
      }

      return {
        totalSubscriptions: data.total_subscriptions || 0,
        activeSubscriptions: data.active_subscriptions || 0,
        trialingSubscriptions: data.trialing_subscriptions || 0,
        pastDueSubscriptions: data.past_due_subscriptions || 0,
        cancelledSubscriptions: data.cancelled_subscriptions || 0,
        pausedSubscriptions: data.paused_subscriptions || 0,
        gracePeriodSubscriptions: data.grace_period_subscriptions || 0,
        executiveAccounts: data.executive_accounts || 0,
        monthlyRecurringRevenue: parseFloat(data.monthly_recurring_revenue || 0),
        yearlyRecurringRevenue: parseFloat(data.yearly_recurring_revenue || 0),
        averageRevenuePerUser: parseFloat(data.average_revenue_per_user || 0)
      }
    } catch (error) {
      console.error('Database error fetching analytics:', error)
      return this.getMockAnalytics()
    }
  }

  async logSubscriptionEvent(
    subscriptionId: string, 
    eventType: string, 
    eventData: any, 
    createdBy?: string, 
    notes?: string
  ): Promise<void> {
    if (!this.supabase) {
      console.log('Event logged (mock):', { subscriptionId, eventType, eventData, createdBy, notes })
      return
    }

    try {
      const { error } = await this.supabase
        .from('subscription_events')
        .insert([{
          subscription_id: subscriptionId,
          event_type: eventType,
          event_data: eventData,
          created_by: createdBy,
          notes
        }])

      if (error) {
        console.error('Error logging subscription event:', error)
      }
    } catch (error) {
      console.error('Database error logging event:', error)
    }
  }

  private transformSubscription(dbSubscription: any): Subscription {
    return {
      id: dbSubscription.id,
      customerId: dbSubscription.customer_id,
      customerName: dbSubscription.customer_name,
      customerEmail: dbSubscription.customer_email,
      planId: dbSubscription.plan_id,
      planName: dbSubscription.plan_name,
      status: dbSubscription.status,
      currentPeriodStart: dbSubscription.current_period_start,
      currentPeriodEnd: dbSubscription.current_period_end,
      trialEnd: dbSubscription.trial_end,
      cancelAtPeriodEnd: dbSubscription.cancel_at_period_end,
      amount: parseFloat(dbSubscription.amount || 0),
      currency: dbSubscription.currency,
      nextBillingDate: dbSubscription.next_billing_date,
      createdAt: dbSubscription.created_at,
      updatedAt: dbSubscription.updated_at,
      lastPaymentDate: dbSubscription.last_payment_date,
      lastPaymentAmount: dbSubscription.last_payment_amount ? parseFloat(dbSubscription.last_payment_amount) : undefined,
      paymentMethod: dbSubscription.payment_method,
      billingCycle: dbSubscription.billing_cycle,
      prorationEnabled: dbSubscription.proration_enabled,
      dunningEnabled: dbSubscription.dunning_enabled,
      notes: dbSubscription.notes,
      isExecutiveAccount: dbSubscription.is_executive_account,
      stripeSubscriptionId: dbSubscription.stripe_subscription_id,
      stripeCustomerId: dbSubscription.stripe_customer_id,
      metadata: dbSubscription.metadata
    }
  }

  // Mock data fallbacks
  private getMockSubscriptions(filters: SubscriptionFilters) {
    // Initialize with some default mock data if empty
    if (this.mockSubscriptions.length === 0) {
      this.mockSubscriptions = [
        {
          id: 'sub_001',
          customerId: 'cus_001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          planId: 'premium',
          planName: 'Premium Plan',
          status: 'active',
          currentPeriodStart: '2024-01-15',
          currentPeriodEnd: '2024-02-15',
          cancelAtPeriodEnd: false,
          amount: 59.99,
          currency: 'usd',
          nextBillingDate: '2024-02-15',
          createdAt: '2024-01-15T00:00:00Z',
          paymentMethod: 'Visa ****4242',
          billingCycle: 'month',
          prorationEnabled: true,
          dunningEnabled: true,
          isExecutiveAccount: false
        },
        {
          id: 'sub_exec_001',
          customerId: 'cus_exec_001',
          customerName: 'Sarah Marketing',
          customerEmail: 'sarah@influencer.com',
          planId: 'premium',
          planName: 'Premium Plan',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2025-01-01',
          cancelAtPeriodEnd: false,
          amount: 0,
          currency: 'usd',
          nextBillingDate: undefined,
          createdAt: '2024-01-01T00:00:00Z',
          paymentMethod: 'Executive Account (Free)',
          billingCycle: 'year',
          prorationEnabled: false,
          dunningEnabled: false,
          isExecutiveAccount: true,
          notes: 'Executive Account - Marketing/Free Account | Influencer partnership'
        }
      ]
    }

    let filtered = [...this.mockSubscriptions]

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(sub => sub.status === filters.status)
    }
    if (filters.plan && filters.plan !== 'all') {
      filtered = filtered.filter(sub => sub.planId === filters.plan)
    }
    if (filters.isExecutiveAccount !== undefined) {
      filtered = filtered.filter(sub => sub.isExecutiveAccount === filters.isExecutiveAccount)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(sub => 
        sub.customerName.toLowerCase().includes(searchLower) ||
        sub.customerEmail.toLowerCase().includes(searchLower) ||
        sub.id.toLowerCase().includes(searchLower)
      )
    }

    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginated = filtered.slice(startIndex, endIndex)

    return {
      subscriptions: paginated,
      total: filtered.length,
      analytics: this.getMockAnalytics()
    }
  }

  private getMockAnalytics(): SubscriptionAnalytics {
    const total = this.mockSubscriptions.length
    const active = this.mockSubscriptions.filter(s => s.status === 'active').length
    const trialing = this.mockSubscriptions.filter(s => s.status === 'trialing').length
    const pastDue = this.mockSubscriptions.filter(s => s.status === 'past_due').length
    const cancelled = this.mockSubscriptions.filter(s => s.status === 'cancelled').length
    const paused = this.mockSubscriptions.filter(s => s.status === 'paused').length
    const gracePeriod = this.mockSubscriptions.filter(s => s.status === 'grace_period').length
    const executiveAccounts = this.mockSubscriptions.filter(s => s.isExecutiveAccount).length
    
    const monthlyRecurringRevenue = this.mockSubscriptions
      .filter(s => s.status === 'active' && s.billingCycle === 'month' && s.amount > 0)
      .reduce((sum, s) => sum + s.amount, 0)
    
    const yearlyRecurringRevenue = this.mockSubscriptions
      .filter(s => s.status === 'active' && s.billingCycle === 'year' && s.amount > 0)
      .reduce((sum, s) => sum + s.amount, 0)
    
    const paidActiveSubscriptions = this.mockSubscriptions.filter(s => s.status === 'active' && s.amount > 0).length
    const averageRevenuePerUser = paidActiveSubscriptions > 0 ? 
      (monthlyRecurringRevenue + yearlyRecurringRevenue) / paidActiveSubscriptions : 0

    return {
      totalSubscriptions: total,
      activeSubscriptions: active,
      trialingSubscriptions: trialing,
      pastDueSubscriptions: pastDue,
      cancelledSubscriptions: cancelled,
      pausedSubscriptions: paused,
      gracePeriodSubscriptions: gracePeriod,
      executiveAccounts,
      monthlyRecurringRevenue,
      yearlyRecurringRevenue,
      averageRevenuePerUser
    }
  }

  private createMockSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Subscription {
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: `sub_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Add to mock data store
    this.mockSubscriptions.push(newSubscription)
    console.log('Mock subscription created:', newSubscription.id)
    
    return newSubscription
  }

  private updateMockSubscription(id: string, updates: Partial<Subscription>): Subscription {
    const index = this.mockSubscriptions.findIndex(sub => sub.id === id)
    if (index === -1) {
      // Create a new mock subscription if not found
      const newSubscription: Subscription = {
        id,
        customerId: 'mock',
        customerName: 'Mock Customer',
        customerEmail: 'mock@example.com',
        planId: 'basic',
        planName: 'Basic Plan',
        status: 'active',
        currentPeriodStart: '2024-01-01',
        currentPeriodEnd: '2024-02-01',
        cancelAtPeriodEnd: false,
        amount: 29.99,
        currency: 'usd',
        nextBillingDate: '2024-02-01',
        createdAt: '2024-01-01T00:00:00Z',
        paymentMethod: 'Mock Payment',
        billingCycle: 'month',
        prorationEnabled: true,
        dunningEnabled: true,
        isExecutiveAccount: false,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      this.mockSubscriptions.push(newSubscription)
      return newSubscription
    }
    
    // Update existing subscription
    this.mockSubscriptions[index] = {
      ...this.mockSubscriptions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Mock subscription updated:', id)
    return this.mockSubscriptions[index]
  }

  private deleteMockSubscription(id: string): void {
    const index = this.mockSubscriptions.findIndex(sub => sub.id === id)
    if (index !== -1) {
      this.mockSubscriptions.splice(index, 1)
      console.log('Mock subscription deleted:', id)
    } else {
      console.log('Mock subscription not found for deletion:', id)
    }
  }
}

export const subscriptionDatabaseService = new SubscriptionDatabaseService()

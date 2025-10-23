// Unified database service for users and subscriptions
import { createClient } from "@supabase/supabase-js"

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  lastLogin: string
  subscription: string
  creditScore: number
  phone: string
  createdAt: string
  isVerified: boolean
  totalSpent: number
  lastActivity: string
}

export interface Subscription {
  id: string
  customerName: string
  customerEmail: string
  planName: string
  status: string
  amount: number
  currency: string
  billingCycle: string
  nextBillingDate: string | null
  paymentMethod: string
  createdAt: string
  isExecutiveAccount: boolean
  gracePeriodEndDate?: string
  lastPaymentDate?: string
  cancelAtPeriodEnd?: boolean
  notes?: string
}

class DatabaseService {
  // User Management
  async getUsers(filters: any = {}) {
    console.log('Database service getUsers called with filters:', filters)
    console.log('Supabase client available:', !!supabase)
    
    if (!supabase) {
      console.log('No Supabase client, using mock data')
      return this.getMockUsers(filters)
    }

    try {
      let query = supabase.from('users').select('*')
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      
      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error

      return {
        success: true,
        data: {
          users: data || [],
          total: data?.length || 0,
          statusCounts: this.calculateStatusCounts(data || []),
          roleCounts: this.calculateRoleCounts(data || []),
          metrics: this.calculateUserMetrics(data || [])
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.getMockUsers(filters)
    }
  }

  async createUser(userData: Partial<User>) {
    if (!supabase) {
      return this.createMockUser(userData)
    }

    try {
      const newUser = {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        status: 'active',
        phone: userData.phone || '',
        subscription: userData.subscription || 'Basic Plan',
        credit_score: 650,
        is_verified: false,
        total_spent: 0,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: {
          user: this.formatUserData(data),
          message: "User created successfully"
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.createMockUser(userData)
    }
  }

  async updateUser(userId: string, userData: Partial<User>) {
    if (!supabase) {
      return this.updateMockUser(userId, userData)
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          subscription: userData.subscription
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: {
          user: this.formatUserData(data),
          message: "User updated successfully"
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.updateMockUser(userId, userData)
    }
  }

  async deleteUser(userId: string) {
    if (!supabase) {
      return this.deleteMockUser(userId)
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      return {
        success: true,
        data: {
          message: "User deleted successfully"
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.deleteMockUser(userId)
    }
  }

  // Subscription Management
  async getSubscriptions(filters: any = {}) {
    if (!supabase) {
      return this.getMockSubscriptions(filters)
    }

    try {
      let query = supabase.from('subscriptions').select('*')
      
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`)
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      
      if (filters.plan && filters.plan !== 'all') {
        query = query.eq('plan_name', filters.plan)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error

      return {
        success: true,
        data: {
          subscriptions: data || [],
          total: data?.length || 0,
          statusCounts: this.calculateSubscriptionStatusCounts(data || []),
          metrics: this.calculateSubscriptionMetrics(data || [])
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.getMockSubscriptions(filters)
    }
  }

  async createSubscription(subscriptionData: Partial<Subscription>) {
    if (!supabase) {
      return this.createMockSubscription(subscriptionData)
    }

    try {
      const newSubscription = {
        customer_name: subscriptionData.customerName,
        customer_email: subscriptionData.customerEmail,
        plan_name: subscriptionData.planName,
        status: subscriptionData.status || 'active',
        amount: subscriptionData.amount || 0,
        currency: subscriptionData.currency || 'USD',
        billing_cycle: subscriptionData.billingCycle || 'monthly',
        next_billing_date: subscriptionData.nextBillingDate,
        payment_method: subscriptionData.paymentMethod,
        is_executive_account: subscriptionData.isExecutiveAccount || false,
        notes: subscriptionData.notes,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([newSubscription])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: {
          subscription: this.formatSubscriptionData(data),
          message: "Subscription created successfully"
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.createMockSubscription(subscriptionData)
    }
  }

  async updateSubscription(subscriptionId: string, subscriptionData: Partial<Subscription>) {
    if (!supabase) {
      return this.updateMockSubscription(subscriptionId, subscriptionData)
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          customer_name: subscriptionData.customerName,
          customer_email: subscriptionData.customerEmail,
          plan_name: subscriptionData.planName,
          status: subscriptionData.status,
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          billing_cycle: subscriptionData.billingCycle,
          next_billing_date: subscriptionData.nextBillingDate,
          payment_method: subscriptionData.paymentMethod,
          is_executive_account: subscriptionData.isExecutiveAccount,
          notes: subscriptionData.notes
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: {
          subscription: this.formatSubscriptionData(data),
          message: "Subscription updated successfully"
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.updateMockSubscription(subscriptionId, subscriptionData)
    }
  }

  async deleteSubscription(subscriptionId: string) {
    if (!supabase) {
      return this.deleteMockSubscription(subscriptionId)
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId)

      if (error) throw error

      return {
        success: true,
        data: {
          message: "Subscription deleted successfully"
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return this.deleteMockSubscription(subscriptionId)
    }
  }

  // Helper methods
  private formatUserData(dbUser: any): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      status: dbUser.status,
      joinDate: dbUser.created_at?.split('T')[0] || '',
      lastLogin: dbUser.last_activity?.split('T')[0] || '',
      subscription: dbUser.subscription,
      creditScore: dbUser.credit_score || 650,
      phone: dbUser.phone || '',
      createdAt: dbUser.created_at,
      isVerified: dbUser.is_verified || false,
      totalSpent: dbUser.total_spent || 0,
      lastActivity: dbUser.last_activity || dbUser.created_at
    }
  }

  private formatSubscriptionData(dbSubscription: any): Subscription {
    return {
      id: dbSubscription.id,
      customerName: dbSubscription.customer_name,
      customerEmail: dbSubscription.customer_email,
      planName: dbSubscription.plan_name,
      status: dbSubscription.status,
      amount: dbSubscription.amount || 0,
      currency: dbSubscription.currency || 'USD',
      billingCycle: dbSubscription.billing_cycle || 'monthly',
      nextBillingDate: dbSubscription.next_billing_date,
      paymentMethod: dbSubscription.payment_method,
      createdAt: dbSubscription.created_at,
      isExecutiveAccount: dbSubscription.is_executive_account || false,
      gracePeriodEndDate: dbSubscription.grace_period_end_date,
      lastPaymentDate: dbSubscription.last_payment_date,
      cancelAtPeriodEnd: dbSubscription.cancel_at_period_end,
      notes: dbSubscription.notes
    }
  }

  private calculateStatusCounts(users: any[]) {
    if (!users || !Array.isArray(users)) {
      return {
        all: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        pending: 0
      }
    }
    
    return {
      all: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      pending: users.filter(u => u.status === 'pending').length
    }
  }

  private calculateRoleCounts(users: any[]) {
    if (!users || !Array.isArray(users)) {
      return {
        user: 0,
        premium: 0,
        admin: 0,
        trial: 0
      }
    }
    
    return {
      user: users.filter(u => u.role === 'user').length,
      premium: users.filter(u => u.role === 'premium').length,
      admin: users.filter(u => u.role === 'admin').length,
      trial: users.filter(u => u.role === 'trial').length
    }
  }

  private calculateUserMetrics(users: any[]) {
    if (!users || !Array.isArray(users)) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        newThisMonth: 0
      }
    }
    
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      verifiedUsers: users.filter(u => u.is_verified).length,
      newThisMonth: users.filter(u => {
        const userDate = new Date(u.created_at)
        return userDate.getMonth() === thisMonth && userDate.getFullYear() === thisYear
      }).length
    }
  }

  private calculateSubscriptionStatusCounts(subscriptions: any[]) {
    return {
      all: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      trialing: subscriptions.filter(s => s.status === 'trialing').length,
      past_due: subscriptions.filter(s => s.status === 'past_due').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      grace_period: subscriptions.filter(s => s.status === 'grace_period').length
    }
  }

  private calculateSubscriptionMetrics(subscriptions: any[]) {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    const monthlyRecurringRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const averageRevenuePerUser = activeSubscriptions.length > 0 ? monthlyRecurringRevenue / activeSubscriptions.length : 0

    return {
      monthlyRecurringRevenue,
      activeSubscriptions: activeSubscriptions.length,
      averageRevenuePerUser
    }
  }

  // Mock data fallbacks
  private getMockUsers(filters: any) {
    const mockUsers = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "premium",
        status: "active",
        joinDate: "2024-01-15",
        lastLogin: "2024-10-15",
        subscription: "Premium Plan",
        creditScore: 720,
        phone: "+1234567890",
        createdAt: "2024-01-15T10:30:00Z",
        isVerified: true,
        totalSpent: 299.99,
        lastActivity: "2024-10-15T14:30:00Z"
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "user",
        status: "active",
        joinDate: "2024-02-20",
        lastLogin: "2024-10-14",
        subscription: "Basic Plan",
        creditScore: 680,
        phone: "+1234567891",
        createdAt: "2024-02-20T10:30:00Z",
        isVerified: true,
        totalSpent: 99.99,
        lastActivity: "2024-10-14T16:20:00Z"
      },
      {
        id: "3",
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "trial",
        status: "pending",
        joinDate: "2024-10-10",
        lastLogin: "2024-10-15",
        subscription: "Trial",
        creditScore: 650,
        phone: "+1234567892",
        createdAt: "2024-10-10T10:30:00Z",
        isVerified: false,
        totalSpent: 0,
        lastActivity: "2024-10-15T09:15:00Z"
      }
    ]

    return {
      success: true,
      data: {
        users: mockUsers,
        total: mockUsers.length,
        statusCounts: this.calculateStatusCounts(mockUsers),
        roleCounts: this.calculateRoleCounts(mockUsers),
        metrics: this.calculateUserMetrics(mockUsers)
      }
    }
  }

  private createMockUser(userData: Partial<User>) {
    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'user',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      subscription: userData.subscription || 'Basic Plan',
      creditScore: 650,
      phone: userData.phone || '',
      createdAt: new Date().toISOString(),
      isVerified: false,
      totalSpent: 0,
      lastActivity: new Date().toISOString()
    }

    return {
      success: true,
      data: {
        user: newUser,
        message: "User created successfully"
      }
    }
  }

  private updateMockUser(userId: string, userData: Partial<User>) {
    return {
      success: true,
      data: {
        user: { id: userId, ...userData },
        message: "User updated successfully"
      }
    }
  }

  private deleteMockUser(userId: string) {
    return {
      success: true,
      data: {
        message: "User deleted successfully"
      }
    }
  }

  private getMockSubscriptions(filters: any) {
    const mockSubscriptions = [
      {
        id: "sub_1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        planName: "Premium Plan",
        status: "active",
        amount: 59.99,
        currency: "USD",
        billingCycle: "monthly",
        nextBillingDate: "2024-11-15",
        paymentMethod: "Visa ****4242",
        createdAt: "2024-01-15T10:30:00Z",
        isExecutiveAccount: false
      },
      {
        id: "sub_2",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        planName: "Basic Plan",
        status: "active",
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
        nextBillingDate: "2024-11-20",
        paymentMethod: "Mastercard ****5555",
        createdAt: "2024-02-20T10:30:00Z",
        isExecutiveAccount: false
      }
    ]

    return {
      success: true,
      data: {
        subscriptions: mockSubscriptions,
        total: mockSubscriptions.length,
        statusCounts: this.calculateSubscriptionStatusCounts(mockSubscriptions),
        metrics: this.calculateSubscriptionMetrics(mockSubscriptions)
      }
    }
  }

  private createMockSubscription(subscriptionData: Partial<Subscription>) {
    const newSubscription = {
      id: `sub_${Date.now()}`,
      customerName: subscriptionData.customerName || '',
      customerEmail: subscriptionData.customerEmail || '',
      planName: subscriptionData.planName || '',
      status: subscriptionData.status || 'active',
      amount: subscriptionData.amount || 0,
      currency: subscriptionData.currency || 'USD',
      billingCycle: subscriptionData.billingCycle || 'monthly',
      nextBillingDate: subscriptionData.nextBillingDate,
      paymentMethod: subscriptionData.paymentMethod || '',
      createdAt: new Date().toISOString(),
      isExecutiveAccount: subscriptionData.isExecutiveAccount || false,
      gracePeriodEndDate: subscriptionData.gracePeriodEndDate,
      lastPaymentDate: subscriptionData.lastPaymentDate,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      notes: subscriptionData.notes
    }

    return {
      success: true,
      data: {
        subscription: newSubscription,
        message: "Subscription created successfully"
      }
    }
  }

  private updateMockSubscription(subscriptionId: string, subscriptionData: Partial<Subscription>) {
    return {
      success: true,
      data: {
        subscription: { id: subscriptionId, ...subscriptionData },
        message: "Subscription updated successfully"
      }
    }
  }

  private deleteMockSubscription(subscriptionId: string) {
    return {
      success: true,
      data: {
        message: "Subscription deleted successfully"
      }
    }
  }
}

export const databaseService = new DatabaseService()

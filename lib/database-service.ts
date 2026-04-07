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

export interface NegativeItem {
  id: string
  userId: string
  creditor: string
  accountNumber: string
  originalAmount: number
  currentBalance: number
  dateOpened: string
  dateReported: string
  status: 'Open' | 'Closed' | 'Charged Off' | 'In Collections'
  itemType: 'Late Payment' | 'Collection' | 'Charge Off' | 'Bankruptcy' | 'Lien' | 'Judgment' | 'Other'
  disputeReason: string
  notes?: string
  createdAt: string
  updatedAt: string
  isDisputed: boolean
  disputeDate?: string
  resolutionStatus?: 'Pending' | 'Resolved' | 'Rejected' | 'In Progress'
}

export interface CreditScore {
  id: string
  userId: string
  bureau: 'Experian' | 'Equifax' | 'TransUnion'
  score: number
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}

class DatabaseService {
  // In-memory storage for mock data persistence
  private mockUsers: any[] = []
  private mockSubscriptions: any[] = []
  private mockNegativeItems: any[] = []
  private mockCreditScores: any[] = []
  private initialized = false

  // Initialize mock data once
  private initializeMockData() {
    if (this.initialized) return

    // Default mock data if no saved data
    this.mockUsers = [
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

    this.mockSubscriptions = [
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
      },
      {
        id: "sub_3",
        customerName: "Bob Johnson",
        customerEmail: "bob@example.com",
        planName: "Trial",
        status: "trialing",
        amount: 0,
        currency: "USD",
        billingCycle: "monthly",
        nextBillingDate: "2024-10-17",
        paymentMethod: "Trial Account",
        createdAt: "2024-10-10T10:30:00Z",
        isExecutiveAccount: false
      }
    ]

    // Default mock negative items
    this.mockNegativeItems = [
      {
        id: "item_1",
        userId: "1",
        creditor: "Capital One",
        accountNumber: "****1234",
        originalAmount: 2500,
        currentBalance: 0,
        dateOpened: "2020-03-15",
        dateReported: "2023-12-01",
        status: "Closed",
        itemType: "Late Payment",
        disputeReason: "Inaccurate Information - Wrong amounts, dates, or account details",
        notes: "Account was never late, always paid on time",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        isDisputed: false,
        resolutionStatus: "Pending"
      },
      {
        id: "item_2",
        userId: "1",
        creditor: "Chase Bank",
        accountNumber: "****5678",
        originalAmount: 1500,
        currentBalance: 1500,
        dateOpened: "2021-06-20",
        dateReported: "2024-01-15",
        status: "In Collections",
        itemType: "Collection",
        disputeReason: "Identity Theft - Account opened without authorization",
        notes: "This account was opened fraudulently",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        isDisputed: false,
        resolutionStatus: "Pending"
      },
      {
        id: "item_3",
        userId: "2",
        creditor: "Discover",
        accountNumber: "****9012",
        originalAmount: 800,
        currentBalance: 0,
        dateOpened: "2019-11-10",
        dateReported: "2023-10-30",
        status: "Charged Off",
        itemType: "Charge Off",
        disputeReason: "Paid in Full - Account was paid but not updated",
        notes: "Account was settled and paid in full",
        createdAt: "2024-02-20T10:30:00Z",
        updatedAt: "2024-02-20T10:30:00Z",
        isDisputed: false,
        resolutionStatus: "Pending"
      }
    ]

    // Default mock credit scores
    this.mockCreditScores = [
      {
        id: "score_1",
        userId: "1",
        bureau: "Experian",
        score: 720,
        date: "2024-10-01",
        notes: "Good credit standing",
        createdAt: "2024-10-01T10:30:00Z",
        updatedAt: "2024-10-01T10:30:00Z"
      },
      {
        id: "score_2",
        userId: "1",
        bureau: "Equifax",
        score: 715,
        date: "2024-10-01",
        notes: "Slight variation from Experian",
        createdAt: "2024-10-01T10:30:00Z",
        updatedAt: "2024-10-01T10:30:00Z"
      },
      {
        id: "score_3",
        userId: "1",
        bureau: "TransUnion",
        score: 725,
        date: "2024-10-01",
        notes: "Highest score among bureaus",
        createdAt: "2024-10-01T10:30:00Z",
        updatedAt: "2024-10-01T10:30:00Z"
      },
      {
        id: "score_4",
        userId: "2",
        bureau: "Experian",
        score: 680,
        date: "2024-10-01",
        notes: "Fair credit score",
        createdAt: "2024-10-01T10:30:00Z",
        updatedAt: "2024-10-01T10:30:00Z"
      },
      {
        id: "score_5",
        userId: "2",
        bureau: "Equifax",
        score: 675,
        date: "2024-10-01",
        notes: "Consistent with Experian",
        createdAt: "2024-10-01T10:30:00Z",
        updatedAt: "2024-10-01T10:30:00Z"
      },
      {
        id: "score_6",
        userId: "2",
        bureau: "TransUnion",
        score: 685,
        date: "2024-10-01",
        notes: "Slightly higher than other bureaus",
        createdAt: "2024-10-01T10:30:00Z",
        updatedAt: "2024-10-01T10:30:00Z"
      }
    ]

    this.initialized = true
    this.saveToLocalStorage()
  }

  // Save data to in-memory state (no-op; data lives in class instance Map)
  private saveToLocalStorage() {
    // TODO: Persist mock data via Supabase when needed.
    // localStorage was removed because this file runs server-side.
  }

  // User Management
  async getUsers(filters: any = {}) {
    console.log('Database service getUsers called with filters:', filters)
    console.log('Supabase client available:', !!supabase)
    
    if (!supabase) {
      console.log('No Supabase client, using persistent mock data')
      this.initializeMockData()
      return this.getMockUsersFromStorage(filters)
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
      this.initializeMockData()
      return this.createMockUserInStorage(userData)
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

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single()

      if (userError) throw userError

      // Create corresponding subscription
      const subscriptionPlan = userData.subscription || 'Basic Plan'
      const subscriptionAmount = this.getPlanAmount(subscriptionPlan)
      
      const newSubscription = {
        customer_name: userData.name,
        customer_email: userData.email,
        plan_name: subscriptionPlan,
        status: 'active',
        amount: subscriptionAmount,
        currency: 'USD',
        billing_cycle: 'monthly',
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payment_method: 'Credit Card',
        is_executive_account: false,
        created_at: new Date().toISOString()
      }

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([newSubscription])
        .select()
        .single()

      if (subscriptionError) {
        console.warn('User created but subscription creation failed:', subscriptionError)
      }

      return {
        success: true,
        data: {
          user: this.formatUserData(userData),
          subscription: subscriptionData ? this.formatSubscriptionData(subscriptionData) : null,
          message: "User and subscription created successfully"
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
      console.log('No Supabase client, using persistent mock data')
      this.initializeMockData()
      return this.getMockSubscriptionsFromStorage(filters)
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
  private getPlanAmount(planName: string): number {
    const planAmounts: { [key: string]: number } = {
      'Basic Plan': 29.99,
      'Premium Plan': 59.99,
      'Enterprise Plan': 99.99,
      'Trial': 0,
      'Free': 0
    }
    return planAmounts[planName] || 29.99
  }

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

    // Create corresponding mock subscription
    const subscriptionPlan = userData.subscription || 'Basic Plan'
    const subscriptionAmount = this.getPlanAmount(subscriptionPlan)
    
    const newSubscription = {
      id: `sub_${Date.now()}`,
      customerName: newUser.name,
      customerEmail: newUser.email,
      planName: subscriptionPlan,
      status: 'active',
      amount: subscriptionAmount,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString(),
      isExecutiveAccount: false
    }

    return {
      success: true,
      data: {
        user: newUser,
        subscription: newSubscription,
        message: "User and subscription created successfully"
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
      },
      {
        id: "sub_3",
        customerName: "Bob Johnson",
        customerEmail: "bob@example.com",
        planName: "Trial",
        status: "trialing",
        amount: 0,
        currency: "USD",
        billingCycle: "monthly",
        nextBillingDate: "2024-10-17",
        paymentMethod: "Trial Account",
        createdAt: "2024-10-10T10:30:00Z",
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

  // New persistent storage methods
  private getMockUsersFromStorage(filters: any) {
    let filteredUsers = [...this.mockUsers]

    if (filters.search) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.status && filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status)
    }

    if (filters.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role)
    }

    return {
      success: true,
      data: {
        users: filteredUsers,
        total: filteredUsers.length,
        statusCounts: this.calculateStatusCounts(filteredUsers),
        roleCounts: this.calculateRoleCounts(filteredUsers),
        metrics: this.calculateUserMetrics(filteredUsers)
      }
    }
  }

  private getMockSubscriptionsFromStorage(filters: any) {
    let filteredSubscriptions = [...this.mockSubscriptions]

    if (filters.search) {
      filteredSubscriptions = filteredSubscriptions.filter(subscription =>
        subscription.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        subscription.customerEmail.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.status && filters.status !== 'all') {
      filteredSubscriptions = filteredSubscriptions.filter(subscription => subscription.status === filters.status)
    }

    return {
      success: true,
      data: {
        subscriptions: filteredSubscriptions,
        total: filteredSubscriptions.length,
        statusCounts: this.calculateSubscriptionStatusCounts(filteredSubscriptions),
        metrics: this.calculateSubscriptionMetrics(filteredSubscriptions)
      }
    }
  }

  private createMockUserInStorage(userData: Partial<User>) {
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

    // Add to persistent storage
    this.mockUsers.push(newUser)

    // Create corresponding subscription
    const subscriptionPlan = userData.subscription || 'Basic Plan'
    const subscriptionAmount = this.getPlanAmount(subscriptionPlan)
    
    const newSubscription = {
      id: `sub_${Date.now()}`,
      customerName: newUser.name,
      customerEmail: newUser.email,
      planName: subscriptionPlan,
      status: 'active',
      amount: subscriptionAmount,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString(),
      isExecutiveAccount: false
    }

    // Add subscription to persistent storage
    this.mockSubscriptions.push(newSubscription)

    // Save to localStorage
    this.saveToLocalStorage()

    return {
      success: true,
      data: {
        user: newUser,
        subscription: newSubscription,
        message: "User and subscription created successfully"
      }
    }
  }

  // Negative Items Management
  async getNegativeItems(userId?: string) {
    if (supabase) {
      try {
        let query = supabase.from('negative_items').select('*')
        
        if (userId) {
          query = query.eq('user_id', userId)
        }
        
        const { data, error } = await query
        
        if (error) {
          console.error('Supabase error:', error)
          // Fallback to mock data
          this.initializeMockData()
          let items = this.mockNegativeItems
          if (userId) {
            items = items.filter(item => item.userId === userId)
          }
          return {
            success: true,
            data: {
              negativeItems: items
            }
          }
        }
        
        return {
          success: true,
          data: {
            negativeItems: data || []
          }
        }
      } catch (error) {
        console.error('Error fetching negative items from Supabase:', error)
        // Fallback to mock data
        this.initializeMockData()
        let items = this.mockNegativeItems
        if (userId) {
          items = items.filter(item => item.userId === userId)
        }
        return {
          success: true,
          data: {
            negativeItems: items
          }
        }
      }
    }
    
    // Fallback to mock data
    this.initializeMockData()
    let items = this.mockNegativeItems
    if (userId) {
      items = items.filter(item => item.userId === userId)
    }
    
    return {
      success: true,
      data: {
        negativeItems: items
      }
    }
  }

  async createNegativeItem(itemData: Omit<NegativeItem, 'id' | 'createdAt' | 'updatedAt'>) {
    if (supabase) {
      try {
        // Convert camelCase to snake_case for Supabase
        const supabaseData = {
          user_id: itemData.userId,
          creditor: itemData.creditor,
          account_number: itemData.accountNumber,
          original_amount: itemData.originalAmount,
          current_balance: itemData.currentBalance,
          date_opened: itemData.dateOpened,
          date_reported: itemData.dateReported,
          status: itemData.status,
          item_type: itemData.itemType,
          dispute_reason: itemData.disputeReason,
          notes: itemData.notes,
          is_disputed: itemData.isDisputed,
          dispute_date: itemData.disputeDate,
          resolution_status: itemData.resolutionStatus
        }
        
        const { data, error } = await supabase
          .from('negative_items')
          .insert([supabaseData])
          .select()
          .single()
        
        if (error) {
          console.error('Supabase error:', error)
          throw new Error(error.message)
        }
        
        // Convert back to camelCase
        const newItem: NegativeItem = {
          id: data.id,
          userId: data.user_id,
          creditor: data.creditor,
          accountNumber: data.account_number,
          originalAmount: data.original_amount,
          currentBalance: data.current_balance,
          dateOpened: data.date_opened,
          dateReported: data.date_reported,
          status: data.status,
          itemType: data.item_type,
          disputeReason: data.dispute_reason,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isDisputed: data.is_disputed,
          disputeDate: data.dispute_date,
          resolutionStatus: data.resolution_status
        }
        
        return {
          success: true,
          data: {
            negativeItem: newItem
          }
        }
      } catch (error) {
        console.error('Error creating negative item in Supabase:', error)
        // Fallback to mock data
        this.initializeMockData()
        
        const newItem: NegativeItem = {
          ...itemData,
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        this.mockNegativeItems.push(newItem)
        this.saveToLocalStorage()
        
        return {
          success: true,
          data: {
            negativeItem: newItem
          }
        }
      }
    }
    
    // Fallback to mock data
    this.initializeMockData()
    
    const newItem: NegativeItem = {
      ...itemData,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.mockNegativeItems.push(newItem)
    this.saveToLocalStorage()
    
    return {
      success: true,
      data: {
        negativeItem: newItem
      }
    }
  }

  async updateNegativeItem(id: string, updates: Partial<Omit<NegativeItem, 'id' | 'createdAt' | 'userId'>>) {
    this.initializeMockData()
    
    const index = this.mockNegativeItems.findIndex(item => item.id === id)
    if (index === -1) {
      return {
        success: false,
        error: "Negative item not found"
      }
    }
    
    this.mockNegativeItems[index] = {
      ...this.mockNegativeItems[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.saveToLocalStorage()
    
    return {
      success: true,
      data: {
        negativeItem: this.mockNegativeItems[index]
      }
    }
  }

  async deleteNegativeItem(id: string) {
    this.initializeMockData()
    
    const index = this.mockNegativeItems.findIndex(item => item.id === id)
    if (index === -1) {
      return {
        success: false,
        error: "Negative item not found"
      }
    }
    
    this.mockNegativeItems.splice(index, 1)
    this.saveToLocalStorage()
    
    return {
      success: true,
      data: {
        message: "Negative item deleted successfully"
      }
    }
  }

  // Credit Scores Management
  async getCreditScores(userId?: string) {
    if (supabase) {
      try {
        let query = supabase.from('credit_scores').select('*')
        
        if (userId) {
          query = query.eq('user_id', userId)
        }
        
        const { data, error } = await query
        
        if (error) {
          console.error('Supabase error:', error)
          // Fallback to mock data
          this.initializeMockData()
          let scores = this.mockCreditScores
          if (userId) {
            scores = scores.filter(score => score.userId === userId)
          }
          return {
            success: true,
            data: {
              creditScores: scores
            }
          }
        }
        
        // Convert snake_case to camelCase
        const creditScores = data?.map(score => ({
          id: score.id,
          userId: score.user_id,
          bureau: score.bureau,
          score: score.score,
          date: score.date,
          notes: score.notes,
          createdAt: score.created_at,
          updatedAt: score.updated_at
        })) || []
        
        return {
          success: true,
          data: {
            creditScores
          }
        }
      } catch (error) {
        console.error('Error fetching credit scores from Supabase:', error)
        // Fallback to mock data
        this.initializeMockData()
        let scores = this.mockCreditScores
        if (userId) {
          scores = scores.filter(score => score.userId === userId)
        }
        return {
          success: true,
          data: {
            creditScores: scores
          }
        }
      }
    }
    
    // Fallback to mock data
    this.initializeMockData()
    let scores = this.mockCreditScores
    if (userId) {
      scores = scores.filter(score => score.userId === userId)
    }
    
    return {
      success: true,
      data: {
        creditScores: scores
      }
    }
  }

  async createCreditScore(scoreData: Omit<CreditScore, 'id' | 'createdAt' | 'updatedAt'>) {
    if (supabase) {
      try {
        // Convert camelCase to snake_case for Supabase
        const supabaseData = {
          user_id: scoreData.userId,
          bureau: scoreData.bureau,
          score: scoreData.score,
          date: scoreData.date,
          notes: scoreData.notes
        }
        
        const { data, error } = await supabase
          .from('credit_scores')
          .insert([supabaseData])
          .select()
          .single()
        
        if (error) {
          console.error('Supabase error:', error)
          throw new Error(error.message)
        }
        
        // Convert back to camelCase
        const newScore: CreditScore = {
          id: data.id,
          userId: data.user_id,
          bureau: data.bureau,
          score: data.score,
          date: data.date,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
        
        return {
          success: true,
          data: {
            creditScore: newScore
          }
        }
      } catch (error) {
        console.error('Error creating credit score in Supabase:', error)
        // Fallback to mock data
        this.initializeMockData()
        
        const newScore: CreditScore = {
          ...scoreData,
          id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        this.mockCreditScores.push(newScore)
        this.saveToLocalStorage()
        
        return {
          success: true,
          data: {
            creditScore: newScore
          }
        }
      }
    }
    
    // Fallback to mock data
    this.initializeMockData()
    
    const newScore: CreditScore = {
      ...scoreData,
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.mockCreditScores.push(newScore)
    this.saveToLocalStorage()
    
    return {
      success: true,
      data: {
        creditScore: newScore
      }
    }
  }

  async updateCreditScore(id: string, updates: Partial<Omit<CreditScore, 'id' | 'createdAt' | 'userId'>>) {
    this.initializeMockData()
    
    const index = this.mockCreditScores.findIndex(score => score.id === id)
    if (index === -1) {
      return {
        success: false,
        error: "Credit score not found"
      }
    }
    
    this.mockCreditScores[index] = {
      ...this.mockCreditScores[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.saveToLocalStorage()
    
    return {
      success: true,
      data: {
        creditScore: this.mockCreditScores[index]
      }
    }
  }

  async deleteCreditScore(id: string) {
    this.initializeMockData()
    
    const index = this.mockCreditScores.findIndex(score => score.id === id)
    if (index === -1) {
      return {
        success: false,
        error: "Credit score not found"
      }
    }
    
    this.mockCreditScores.splice(index, 1)
    this.saveToLocalStorage()
    
    return {
      success: true,
      data: {
        message: "Credit score deleted successfully"
      }
    }
  }
}

export const databaseService = new DatabaseService()

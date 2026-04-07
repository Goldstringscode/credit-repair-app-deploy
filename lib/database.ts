import { User, Subscription, Plan, Payment, MailPayment, PaymentCard } from './types'

// Database interface - in production, this would connect to PostgreSQL, MongoDB, etc.
export interface DatabaseService {
  // User operations
  getUser(userId: string): Promise<User | null>
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  updateUser(userId: string, updates: Partial<User>): Promise<User>
  
  // Subscription operations
  getSubscription(subscriptionId: string): Promise<Subscription | null>
  getCustomerSubscriptions(customerId: string): Promise<Subscription[]>
  createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription>
  updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription>
  deleteSubscription(subscriptionId: string): Promise<boolean>
  
  // Plan operations
  getPlans(): Promise<Plan[]>
  getPlan(planId: string): Promise<Plan | null>
  
  // Payment operations
  getPayments(userId: string, filters?: PaymentFilters): Promise<Payment[]>
  createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment>
  updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment>
  
  // Card operations
  getCards(userId: string): Promise<PaymentCard[]>
  createCard(card: Omit<PaymentCard, 'id' | 'createdAt'>): Promise<PaymentCard>
  updateCard(cardId: string, updates: Partial<PaymentCard>): Promise<PaymentCard>
  deleteCard(cardId: string): Promise<boolean>
  setDefaultCard(userId: string, cardId: string): Promise<boolean>
  
  // Mail payment operations
  getMailPayments(userId: string, filters?: MailPaymentFilters): Promise<MailPayment[]>
  createMailPayment(mailPayment: Omit<MailPayment, 'id' | 'createdAt'>): Promise<MailPayment>
  updateMailPayment(mailPaymentId: string, updates: Partial<MailPayment>): Promise<MailPayment>
  deleteMailPayment(mailPaymentId: string): Promise<boolean>
}

export interface PaymentFilters {
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface MailPaymentFilters {
  type?: string
  status?: string
  search?: string
}

// Mock database implementation for development
class MockDatabaseService implements DatabaseService {
  private users = new Map<string, User>()
  private subscriptions = new Map<string, Subscription>()
  private plans = new Map<string, Plan>()
  private payments = new Map<string, Payment>()
  private cards = new Map<string, PaymentCard>()
  private mailPayments = new Map<string, MailPayment>()
  
  constructor() {
    this.initializeMockData()
  }
  
  private initializeMockData() {
    // Initialize default plans
    const defaultPlans: Plan[] = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Essential credit repair features',
        amount: 2999,
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 7,
        features: [
          'Credit report analysis',
          'Basic dispute letters',
          'Email support',
          'Monthly credit monitoring'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        description: 'Advanced credit repair with AI assistance',
        amount: 5999,
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 14,
        features: [
          'Everything in Basic',
          'Advanced dispute strategies',
          'Priority support',
          'Weekly credit monitoring',
          'Custom dispute letters',
          'Credit score tracking',
          'AI-powered recommendations'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Complete credit repair solution for businesses',
        amount: 9999,
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 30,
        features: [
          'Everything in Premium',
          'Unlimited disputes',
          '24/7 phone support',
          'Daily credit monitoring',
          'White-label options',
          'API access',
          'Custom integrations',
          'Dedicated account manager'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    defaultPlans.forEach(plan => {
      this.plans.set(plan.id, plan)
    })
  }
  
  // User operations
  async getUser(userId: string): Promise<User | null> {
    // First try to get by ID
    let user = this.users.get(userId)
    if (user) return user
    
    // If not found by ID, try to get by email
    for (const [id, u] of this.users.entries()) {
      if (u.email === userId) {
        return u
      }
    }
    
    return null
  }
  
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.users.set(newUser.id, newUser)
    return newUser
  }
  
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(userId)
    if (!user) throw new Error('User not found')
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() }
    this.users.set(userId, updatedUser)
    return updatedUser
  }
  
  // Subscription operations
  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return this.subscriptions.get(subscriptionId) || null
  }
  
  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(sub => sub.customerId === customerId)
  }
  
  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const newSubscription: Subscription = {
      ...subscription,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.subscriptions.set(newSubscription.id, newSubscription)
    return newSubscription
  }
  
  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) throw new Error('Subscription not found')
    
    const updatedSubscription = { ...subscription, ...updates, updatedAt: new Date().toISOString() }
    this.subscriptions.set(subscriptionId, updatedSubscription)
    return updatedSubscription
  }
  
  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    return this.subscriptions.delete(subscriptionId)
  }
  
  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter(plan => plan.isActive)
  }
  
  async getPlan(planId: string): Promise<Plan | null> {
    return this.plans.get(planId) || null
  }
  
  // Payment operations
  async getPayments(userId: string, filters?: PaymentFilters): Promise<Payment[]> {
    let payments = Array.from(this.payments.values()).filter(payment => payment.userId === userId)
    
    if (filters) {
      if (filters.status) {
        payments = payments.filter(p => p.status === filters.status)
      }
      if (filters.type) {
        payments = payments.filter(p => p.type === filters.type)
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        payments = payments.filter(p => 
          p.description.toLowerCase().includes(search) ||
          p.transactionId.toLowerCase().includes(search)
        )
      }
    }
    
    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    this.payments.set(newPayment.id, newPayment)
    return newPayment
  }
  
  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment> {
    const payment = this.payments.get(paymentId)
    if (!payment) throw new Error('Payment not found')
    
    const updatedPayment = { ...payment, ...updates }
    this.payments.set(paymentId, updatedPayment)
    return updatedPayment
  }
  
  // Card operations
  async getCards(userId: string): Promise<PaymentCard[]> {
    return Array.from(this.cards.values()).filter(card => card.userId === userId)
  }
  
  async createCard(card: Omit<PaymentCard, 'id' | 'createdAt'>): Promise<PaymentCard> {
    const newCard: PaymentCard = {
      ...card,
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    this.cards.set(newCard.id, newCard)
    return newCard
  }
  
  async updateCard(cardId: string, updates: Partial<PaymentCard>): Promise<PaymentCard> {
    const card = this.cards.get(cardId)
    if (!card) throw new Error('Card not found')
    
    const updatedCard = { ...card, ...updates }
    this.cards.set(cardId, updatedCard)
    return updatedCard
  }
  
  async deleteCard(cardId: string): Promise<boolean> {
    return this.cards.delete(cardId)
  }
  
  async setDefaultCard(userId: string, cardId: string): Promise<boolean> {
    // First, unset all other cards as default
    for (const [id, card] of this.cards.entries()) {
      if (card.userId === userId) {
        card.isDefault = id === cardId
        this.cards.set(id, card)
      }
    }
    return true
  }
  
  // Mail payment operations
  async getMailPayments(userId: string, filters?: MailPaymentFilters): Promise<MailPayment[]> {
    let mailPayments = Array.from(this.mailPayments.values()).filter(mp => mp.userId === userId)
    
    if (filters) {
      if (filters.type) {
        mailPayments = mailPayments.filter(mp => mp.type === filters.type)
      }
      if (filters.status) {
        mailPayments = mailPayments.filter(mp => mp.status === filters.status)
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        mailPayments = mailPayments.filter(mp => 
          mp.description.toLowerCase().includes(search) ||
          mp.recipient.toLowerCase().includes(search) ||
          mp.trackingNumber.toLowerCase().includes(search)
        )
      }
    }
    
    return mailPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  async createMailPayment(mailPayment: Omit<MailPayment, 'id' | 'createdAt'>): Promise<MailPayment> {
    const newMailPayment: MailPayment = {
      ...mailPayment,
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    this.mailPayments.set(newMailPayment.id, newMailPayment)
    return newMailPayment
  }
  
  async updateMailPayment(mailPaymentId: string, updates: Partial<MailPayment>): Promise<MailPayment> {
    const mailPayment = this.mailPayments.get(mailPaymentId)
    if (!mailPayment) throw new Error('Mail payment not found')
    
    const updatedMailPayment = { ...mailPayment, ...updates }
    this.mailPayments.set(mailPaymentId, updatedMailPayment)
    return updatedMailPayment
  }
  
  async deleteMailPayment(mailPaymentId: string): Promise<boolean> {
    return this.mailPayments.delete(mailPaymentId)
  }
}

// Export singleton — switches to PostgreSQL when USE_PRODUCTION_DB=true or DB_TYPE=postgres
function createDatabaseService(): DatabaseService {
  const useProductionDB = process.env.USE_PRODUCTION_DB === 'true'
  const dbType = process.env.DB_TYPE || 'mock'
  if (useProductionDB || dbType === 'postgres') {
    try {
      // Dynamically require to avoid loading pg in environments without it
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { postgresDatabase } = require('./database-postgres') as { postgresDatabase: { instance: DatabaseService } }
      return postgresDatabase.instance
    } catch (err) {
      console.warn('⚠️  PostgreSQL service unavailable, falling back to MockDatabaseService:', err)
    }
  }
  return new MockDatabaseService()
}

export const database = createDatabaseService()

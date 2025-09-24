import { Pool, PoolClient } from 'pg'
import { User, Subscription, Plan, Payment, PaymentCard, MailPayment, DatabaseService } from './types'

// Production PostgreSQL database service
class PostgreSQLDatabaseService implements DatabaseService {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'creditrepair',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.initializeTables()
  }

  private async initializeTables() {
    const client = await this.pool.connect()
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          subscription_id VARCHAR(255),
          customer_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create plans table
      await client.query(`
        CREATE TABLE IF NOT EXISTS plans (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          amount INTEGER NOT NULL,
          interval VARCHAR(50) NOT NULL,
          features JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create subscriptions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          plan_id VARCHAR(255) REFERENCES plans(id),
          status VARCHAR(50) NOT NULL,
          current_period_start TIMESTAMP,
          current_period_end TIMESTAMP,
          cancel_at_period_end BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create payments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          subscription_id VARCHAR(255) REFERENCES subscriptions(id),
          amount INTEGER NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          status VARCHAR(50) NOT NULL,
          payment_method VARCHAR(255),
          stripe_payment_intent_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create payment_cards table
      await client.query(`
        CREATE TABLE IF NOT EXISTS payment_cards (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          stripe_card_id VARCHAR(255) NOT NULL,
          last_four VARCHAR(4) NOT NULL,
          brand VARCHAR(50) NOT NULL,
          exp_month INTEGER NOT NULL,
          exp_year INTEGER NOT NULL,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create mail_payments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS mail_payments (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          type VARCHAR(50) NOT NULL,
          amount INTEGER NOT NULL,
          status VARCHAR(50) NOT NULL,
          tracking_number VARCHAR(255),
          sent_date TIMESTAMP,
          received_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payment_cards_user_id ON payment_cards(user_id);
        CREATE INDEX IF NOT EXISTS idx_mail_payments_user_id ON mail_payments(user_id);
      `)

      // Insert default plans if they don't exist
      await this.insertDefaultPlans(client)

    } finally {
      client.release()
    }
  }

  private async insertDefaultPlans(client: PoolClient) {
    const defaultPlans = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Essential credit repair features',
        amount: 2999,
        interval: 'month',
        features: ['Credit monitoring', 'Dispute letters', 'Basic support']
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        description: 'Advanced credit repair with priority support',
        amount: 5999,
        interval: 'month',
        features: ['Everything in Basic', 'Priority support', 'Advanced analytics', 'Custom letters']
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Complete credit repair solution for businesses',
        amount: 9999,
        interval: 'month',
        features: ['Everything in Premium', 'White-label solution', 'API access', 'Dedicated support']
      }
    ]

    for (const plan of defaultPlans) {
      await client.query(`
        INSERT INTO plans (id, name, description, amount, interval, features)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [plan.id, plan.name, plan.description, plan.amount, plan.interval, JSON.stringify(plan.features)])
    }
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1 OR email = $1',
        [userId]
      )
      
      if (result.rows.length === 0) return null
      
      const row = result.rows[0]
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        subscriptionId: row.subscription_id,
        customerId: row.customer_id,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }
    } finally {
      client.release()
    }
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const client = await this.pool.connect()
    try {
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()
      
      await client.query(`
        INSERT INTO users (id, email, name, role, subscription_id, customer_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [id, user.email, user.name, user.role, user.subscriptionId, user.customerId, now, now])

      return {
        id,
        ...user,
        createdAt: now,
        updatedAt: now
      }
    } finally {
      client.release()
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const client = await this.pool.connect()
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ')

      if (setClause === '') return null

      const values = [userId, ...Object.values(updates).filter((_, index) => 
        Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'createdAt'
      )]

      await client.query(`
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, values)

      return this.getUser(userId)
    } finally {
      client.release()
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    const client = await this.pool.connect()
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1', [userId])
      return result.rowCount > 0
    } finally {
      client.release()
    }
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    const client = await this.pool.connect()
    try {
      const result = await client.query('SELECT * FROM plans WHERE is_active = true ORDER BY amount')
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        amount: row.amount,
        interval: row.interval,
        features: row.features || [],
        isActive: row.is_active,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }))
    } finally {
      client.release()
    }
  }

  async getPlan(planId: string): Promise<Plan | null> {
    const client = await this.pool.connect()
    try {
      const result = await client.query('SELECT * FROM plans WHERE id = $1', [planId])
      
      if (result.rows.length === 0) return null
      
      const row = result.rows[0]
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        amount: row.amount,
        interval: row.interval,
        features: row.features || [],
        isActive: row.is_active,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }
    } finally {
      client.release()
    }
  }

  // Subscription operations
  async getSubscriptions(filters?: { userId?: string; status?: string }): Promise<Subscription[]> {
    const client = await this.pool.connect()
    try {
      let query = 'SELECT * FROM subscriptions'
      const conditions = []
      const values = []

      if (filters?.userId) {
        conditions.push(`user_id = $${values.length + 1}`)
        values.push(filters.userId)
      }

      if (filters?.status) {
        conditions.push(`status = $${values.length + 1}`)
        values.push(filters.status)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }

      query += ' ORDER BY created_at DESC'

      const result = await client.query(query, values)
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        planId: row.plan_id,
        status: row.status,
        currentPeriodStart: row.current_period_start?.toISOString(),
        currentPeriodEnd: row.current_period_end?.toISOString(),
        cancelAtPeriodEnd: row.cancel_at_period_end,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }))
    } finally {
      client.release()
    }
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    const client = await this.pool.connect()
    try {
      const result = await client.query('SELECT * FROM subscriptions WHERE id = $1', [subscriptionId])
      
      if (result.rows.length === 0) return null
      
      const row = result.rows[0]
      return {
        id: row.id,
        userId: row.user_id,
        planId: row.plan_id,
        status: row.status,
        currentPeriodStart: row.current_period_start?.toISOString(),
        currentPeriodEnd: row.current_period_end?.toISOString(),
        cancelAtPeriodEnd: row.cancel_at_period_end,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }
    } finally {
      client.release()
    }
  }

  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const client = await this.pool.connect()
    try {
      const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()
      
      await client.query(`
        INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        id,
        subscription.userId,
        subscription.planId,
        subscription.status,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd,
        subscription.cancelAtPeriodEnd,
        now,
        now
      ])

      return {
        id,
        ...subscription,
        createdAt: now,
        updatedAt: now
      }
    } finally {
      client.release()
    }
  }

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    const client = await this.pool.connect()
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ')

      if (setClause === '') return null

      const values = [subscriptionId, ...Object.values(updates).filter((_, index) => 
        Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'createdAt'
      )]

      await client.query(`
        UPDATE subscriptions 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, values)

      return this.getSubscription(subscriptionId)
    } finally {
      client.release()
    }
  }

  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    const client = await this.pool.connect()
    try {
      const result = await client.query('DELETE FROM subscriptions WHERE id = $1', [subscriptionId])
      return result.rowCount > 0
    } finally {
      client.release()
    }
  }

  // Payment operations
  async getPayments(filters?: { userId?: string; subscriptionId?: string; status?: string }): Promise<Payment[]> {
    const client = await this.pool.connect()
    try {
      let query = 'SELECT * FROM payments'
      const conditions = []
      const values = []

      if (filters?.userId) {
        conditions.push(`user_id = $${values.length + 1}`)
        values.push(filters.userId)
      }

      if (filters?.subscriptionId) {
        conditions.push(`subscription_id = $${values.length + 1}`)
        values.push(filters.subscriptionId)
      }

      if (filters?.status) {
        conditions.push(`status = $${values.length + 1}`)
        values.push(filters.status)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }

      query += ' ORDER BY created_at DESC'

      const result = await client.query(query, values)
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        subscriptionId: row.subscription_id,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        paymentMethod: row.payment_method,
        stripePaymentIntentId: row.stripe_payment_intent_id,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }))
    } finally {
      client.release()
    }
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const client = await this.pool.connect()
    try {
      const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()
      
      await client.query(`
        INSERT INTO payments (id, user_id, subscription_id, amount, currency, status, payment_method, stripe_payment_intent_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        id,
        payment.userId,
        payment.subscriptionId,
        payment.amount,
        payment.currency,
        payment.status,
        payment.paymentMethod,
        payment.stripePaymentIntentId,
        now,
        now
      ])

      return {
        id,
        ...payment,
        createdAt: now,
        updatedAt: now
      }
    } finally {
      client.release()
    }
  }

  // Payment card operations
  async getPaymentCards(userId: string): Promise<PaymentCard[]> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM payment_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [userId]
      )
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        stripeCardId: row.stripe_card_id,
        lastFour: row.last_four,
        brand: row.brand,
        expMonth: row.exp_month,
        expYear: row.exp_year,
        isDefault: row.is_default,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }))
    } finally {
      client.release()
    }
  }

  async createPaymentCard(card: Omit<PaymentCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentCard> {
    const client = await this.pool.connect()
    try {
      const id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()
      
      await client.query(`
        INSERT INTO payment_cards (id, user_id, stripe_card_id, last_four, brand, exp_month, exp_year, is_default, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        id,
        card.userId,
        card.stripeCardId,
        card.lastFour,
        card.brand,
        card.expMonth,
        card.expYear,
        card.isDefault,
        now,
        now
      ])

      return {
        id,
        ...card,
        createdAt: now,
        updatedAt: now
      }
    } finally {
      client.release()
    }
  }

  // Mail payment operations
  async getMailPayments(userId: string): Promise<MailPayment[]> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM mail_payments WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      )
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        amount: row.amount,
        status: row.status,
        trackingNumber: row.tracking_number,
        sentDate: row.sent_date?.toISOString(),
        receivedDate: row.received_date?.toISOString(),
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }))
    } finally {
      client.release()
    }
  }

  async createMailPayment(mailPayment: Omit<MailPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<MailPayment> {
    const client = await this.pool.connect()
    try {
      const id = `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()
      
      await client.query(`
        INSERT INTO mail_payments (id, user_id, type, amount, status, tracking_number, sent_date, received_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        id,
        mailPayment.userId,
        mailPayment.type,
        mailPayment.amount,
        mailPayment.status,
        mailPayment.trackingNumber,
        mailPayment.sentDate,
        mailPayment.receivedDate,
        now,
        now
      ])

      return {
        id,
        ...mailPayment,
        createdAt: now,
        updatedAt: now
      }
    } finally {
      client.release()
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    const client = await this.pool.connect()
    try {
      await client.query('SELECT 1')
      return {
        status: 'healthy',
        details: {
          type: 'PostgreSQL',
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'creditrepair',
          connected: true
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          type: 'PostgreSQL',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    } finally {
      client.release()
    }
  }

  // Close connection pool
  async close(): Promise<void> {
    await this.pool.end()
  }
}

export const postgresDatabase = new PostgreSQLDatabaseService()

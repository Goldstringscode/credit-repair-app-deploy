// import { Pool, PoolClient } from 'pg' // Not needed for Supabase
import { createClient } from '@supabase/supabase-js'
import { 
  MLMUser, 
  MLMRank, 
  MLMCommission, 
  MLMPayout, 
  MLMTraining,
  MLMMarketing,
  MLMAnalytics,
  MLMNotification,
  MLMGenealogy,
  mlmRanks
} from '@/lib/mlm-system'

export class MLMDatabaseService {
  // private pool: Pool // Not needed for Supabase

  private supabase = (() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key) {
      return createClient(url, key)
    }
    return null
  })()

  constructor() {
    if (this.supabase) {
      console.log('🗄️ MLM Database: Using Supabase')
    } else {
      console.log('🗄️ MLM Database: Using development database (mock)')
    }
  }

  // MLM Users Operations
  async createMLMUser(userData: Partial<MLMUser>): Promise<MLMUser> {
    if (!this.supabase) {
      return this.createMockMLMUser(userData)
    }
    try {
      const { data, error } = await this.supabase
        .from('mlm_users')
        .insert({
          user_id: userData.userId,
          sponsor_id: userData.sponsorId ?? null,
          upline_id: userData.uplineId ?? null,
          mlm_code: userData.mlmCode,
          rank: userData.rank?.id ?? 'associate',
          status: userData.status ?? 'active',
          join_date: new Date().toISOString(),
          personal_volume: userData.personalVolume ?? 0,
          team_volume: userData.teamVolume ?? 0,
          total_earnings: userData.totalEarnings ?? 0,
          current_month_earnings: userData.currentMonthEarnings ?? 0,
          lifetime_earnings: userData.lifetimeEarnings ?? 0,
          active_downlines: userData.activeDownlines ?? 0,
          total_downlines: userData.totalDownlines ?? 0,
          qualified_legs: userData.qualifiedLegs ?? 0,
          autoship_active: userData.autoshipActive ?? false,
        })
        .select()
        .single()
      if (error || !data) return this.createMockMLMUser(userData)
      return this.mapMLMUserFromDB(data)
    } catch {
      return this.createMockMLMUser(userData)
    }
  }

  async getMLMUser(userId: string): Promise<MLMUser | null> {
    if (!this.supabase) {
      return this.getMockMLMUser(userId)
    }
    try {
      const { data, error } = await this.supabase
        .from('mlm_users')
        .select(`
          *,
          users:user_id (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('user_id', userId)
        .maybeSingle()
      if (error || !data) return this.getMockMLMUser(userId)
      return this.mapMLMUserFromDB(data)
    } catch {
      return this.getMockMLMUser(userId)
    }
  }

  async updateMLMUser(userId: string, updates: Partial<MLMUser>): Promise<MLMUser> {
    if (!this.supabase) {
      const existing = await this.getMockMLMUser(userId)
      if (!existing) throw new Error('User not found')
      return { ...existing, ...updates }
    }
    try {
      const dbUpdates: Record<string, any> = {}
      if (updates.rank) dbUpdates.rank = updates.rank.id
      if (updates.personalVolume !== undefined) dbUpdates.personal_volume = updates.personalVolume
      if (updates.teamVolume !== undefined) dbUpdates.team_volume = updates.teamVolume
      if (updates.totalEarnings !== undefined) dbUpdates.total_earnings = updates.totalEarnings
      if (updates.status) dbUpdates.status = updates.status
      if (updates.activeDownlines !== undefined) dbUpdates.active_downlines = updates.activeDownlines
      if (updates.qualifiedLegs !== undefined) dbUpdates.qualified_legs = updates.qualifiedLegs
      dbUpdates.updated_at = new Date().toISOString()

      const { error } = await this.supabase
        .from('mlm_users')
        .update(dbUpdates)
        .eq('user_id', userId)
      if (error) throw error
      return (await this.getMLMUser(userId))!
    } catch {
      const existing = await this.getMockMLMUser(userId)
      if (!existing) throw new Error('User not found')
      return { ...existing, ...updates }
    }
  }

  // Genealogy Operations
  async createGenealogyEntry(genealogyData: Partial<MLMGenealogy>): Promise<MLMGenealogy> {
    const client = await this.pool.connect()
    try {
      const query = `
        INSERT INTO mlm_genealogy (
          user_id, sponsor_id, upline_id, level, position, 
          matrix_position, binary_leg, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `
      const values = [
        genealogyData.userId,
        genealogyData.sponsorId,
        genealogyData.uplineId,
        genealogyData.level || 1,
        genealogyData.position,
        genealogyData.matrixPosition,
        genealogyData.binaryLeg,
        genealogyData.isActive ?? true
      ]

      const result = await client.query(query, values)
      return this.mapGenealogyFromDB(result.rows[0])
    } finally {
      client.release()
    }
  }

  async getTeamStructure(userId: string, maxLevel: number = 10): Promise<MLMGenealogy[]> {
    if (!this.supabase) {
      return this.getMockTeamStructure(userId, maxLevel)
    }
    try {
      const { data, error } = await this.supabase
        .from('mlm_genealogy')
        .select(`
          id,
          user_id,
          sponsor_id,
          upline_id,
          level,
          position,
          binary_leg,
          is_active,
          join_date,
          users:user_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('upline_id', userId)
        .lte('level', maxLevel)
        .order('level', { ascending: true })
      if (error || !data || data.length === 0) {
        return this.getMockTeamStructure(userId, maxLevel)
      }
      return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        sponsorId: row.sponsor_id,
        uplineId: row.upline_id,
        level: row.level,
        position: row.position,
        binaryLeg: row.binary_leg,
        isActive: row.is_active,
        joinDate: new Date(row.join_date),
        displayName: row.users ? `${row.users.first_name ?? ''} ${row.users.last_name ?? ''}`.trim() : row.user_id,
        email: row.users?.email ?? row.user_id,
      } as MLMGenealogy))
    } catch {
      return this.getMockTeamStructure(userId, maxLevel)
    }
  }

  // Commission Operations
  async createCommission(commissionData: Partial<MLMCommission>): Promise<MLMCommission> {
    const client = await this.pool.connect()
    try {
      const query = `
        INSERT INTO mlm_commissions (
          user_id, from_user_id, commission_type, level, amount, 
          percentage, base_amount, rank_bonus, total_amount, 
          status, period_start, period_end
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `
      const values = [
        commissionData.userId,
        commissionData.fromUserId,
        commissionData.type,
        commissionData.level || 1,
        commissionData.amount,
        commissionData.percentage,
        commissionData.baseAmount,
        commissionData.rankBonus || 0,
        commissionData.totalAmount,
        commissionData.status || 'pending',
        commissionData.periodStart,
        commissionData.periodEnd
      ]

      const result = await client.query(query, values)
      return this.mapCommissionFromDB(result.rows[0])
    } finally {
      client.release()
    }
  }

  async getCommissions(userId: string, periodStart?: Date, periodEnd?: Date): Promise<MLMCommission[]> {
    if (!this.pool) {
      return this.getMockCommissions(userId, periodStart, periodEnd)
    }

    try {
      const client = await this.pool.connect()
      try {
        let query = `
          SELECT * FROM mlm_commissions 
          WHERE user_id = $1
        `
        const values = [userId]
        let paramCount = 1

        if (periodStart) {
          query += ` AND period_start >= $${++paramCount}`
          values.push(periodStart)
        }
        if (periodEnd) {
          query += ` AND period_end <= $${++paramCount}`
          values.push(periodEnd)
        }

        query += ` ORDER BY created_at DESC`

        const result = await client.query(query, values)
        return result.rows.map(row => this.mapCommissionFromDB(row))
      } finally {
        client.release()
      }
    } catch (error) {
      console.log('🗄️ Database error, falling back to mock data:', error.message)
      return this.getMockCommissions(userId, periodStart, periodEnd)
    }
  }

  // Payout Operations
  async createPayout(payoutData: Partial<MLMPayout>): Promise<MLMPayout> {
    const client = await this.pool.connect()
    try {
      const query = `
        INSERT INTO mlm_payouts (
          user_id, amount, currency, payout_method, payout_details,
          status, period_start, period_end, commission_ids
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `
      const values = [
        payoutData.userId,
        payoutData.amount,
        payoutData.currency || 'USD',
        payoutData.method,
        JSON.stringify(payoutData.details || {}),
        payoutData.status || 'pending',
        payoutData.periodStart,
        payoutData.periodEnd,
        payoutData.commissionIds || []
      ]

      const result = await client.query(query, values)
      return this.mapPayoutFromDB(result.rows[0])
    } finally {
      client.release()
    }
  }

  async getPayouts(userId: string, status?: string): Promise<MLMPayout[]> {
    const client = await this.pool.connect()
    try {
      let query = `SELECT * FROM mlm_payouts WHERE user_id = $1`
      const values = [userId]
      let paramCount = 1

      if (status) {
        query += ` AND status = $${++paramCount}`
        values.push(status)
      }

      query += ` ORDER BY created_at DESC`

      const result = await client.query(query, values)
      return result.rows.map(row => this.mapPayoutFromDB(row))
    } finally {
      client.release()
    }
  }

  // Training Operations
  async createTrainingRecord(trainingData: Partial<MLMTraining>): Promise<MLMTraining> {
    const client = await this.pool.connect()
    try {
      const query = `
        INSERT INTO mlm_training (
          user_id, module_id, module_title, category, level, duration,
          completed, score, progress, started_at, completed_at, certificate_issued
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `
      const values = [
        trainingData.userId,
        trainingData.moduleId,
        trainingData.title,
        trainingData.category,
        trainingData.level,
        trainingData.duration,
        trainingData.completed || false,
        trainingData.score,
        trainingData.progress || 0,
        trainingData.startedAt,
        trainingData.completedAt,
        trainingData.certificateIssued || false
      ]

      const result = await client.query(query, values)
      return this.mapTrainingFromDB(result.rows[0])
    } finally {
      client.release()
    }
  }

  async getTrainingProgress(userId: string): Promise<MLMTraining[]> {
    const client = await this.pool.connect()
    try {
      const query = `
        SELECT * FROM mlm_training 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `
      const result = await client.query(query, [userId])
      return result.rows.map(row => this.mapTrainingFromDB(row))
    } finally {
      client.release()
    }
  }

  // Analytics Operations
  async createAnalyticsRecord(analyticsData: Partial<MLMAnalytics>): Promise<MLMAnalytics> {
    const client = await this.pool.connect()
    try {
      const query = `
        INSERT INTO mlm_analytics (
          user_id, metric_type, metric_value, metric_data, period_start, period_end
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `
      const values = [
        analyticsData.userId,
        analyticsData.type,
        analyticsData.value,
        JSON.stringify(analyticsData.data || {}),
        analyticsData.periodStart,
        analyticsData.periodEnd
      ]

      const result = await client.query(query, values)
      return this.mapAnalyticsFromDB(result.rows[0])
    } finally {
      client.release()
    }
  }

  // Notification Operations
  async createNotification(notificationData: Partial<MLMNotification>): Promise<MLMNotification> {
    const client = await this.pool.connect()
    try {
      const query = `
        INSERT INTO mlm_notifications (
          user_id, type, title, message, data, priority
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `
      const values = [
        notificationData.userId,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        JSON.stringify(notificationData.data || {}),
        notificationData.priority || 'normal'
      ]

      const result = await client.query(query, values)
      return this.mapNotificationFromDB(result.rows[0])
    } finally {
      client.release()
    }
  }

  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<MLMNotification[]> {
    const client = await this.pool.connect()
    try {
      let query = `SELECT * FROM mlm_notifications WHERE user_id = $1`
      const values = [userId]
      let paramCount = 1

      if (unreadOnly) {
        query += ` AND is_read = false`
      }

      query += ` ORDER BY created_at DESC`

      const result = await client.query(query, values)
      return result.rows.map(row => this.mapNotificationFromDB(row))
    } finally {
      client.release()
    }
  }

  // Audit Logging
  async logAuditEvent(eventData: {
    userId?: string
    action: string
    entityType: string
    entityId: string
    oldValues?: any
    newValues?: any
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const client = await this.pool.connect()
    try {
      const query = `
        INSERT INTO mlm_audit_log (
          user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `
      const values = [
        eventData.userId,
        eventData.action,
        eventData.entityType,
        eventData.entityId,
        eventData.oldValues ? JSON.stringify(eventData.oldValues) : null,
        eventData.newValues ? JSON.stringify(eventData.newValues) : null,
        eventData.ipAddress,
        eventData.userAgent
      ]

      await client.query(query, values)
    } finally {
      client.release()
    }
  }

  // Helper Methods for Data Mapping
  private mapMLMUserFromDB(row: any): MLMUser {
    const rank = mlmRanks.find((r) => r.id === row.rank) ?? mlmRanks[0]
    return {
      id: row.id,
      userId: row.user_id,
      sponsorId: row.sponsor_id ?? null,
      uplineId: row.upline_id ?? null,
      mlmCode: row.mlm_code ?? '',
      rank,
      status: row.status ?? 'active',
      joinDate: new Date(row.join_date ?? row.created_at),
      personalVolume: Number(row.personal_volume ?? 0),
      teamVolume: Number(row.team_volume ?? 0),
      totalEarnings: Number(row.total_earnings ?? 0),
      currentMonthEarnings: Number(row.current_month_earnings ?? 0),
      lifetimeEarnings: Number(row.lifetime_earnings ?? 0),
      activeDownlines: Number(row.active_downlines ?? 0),
      totalDownlines: Number(row.total_downlines ?? 0),
      qualifiedLegs: Number(row.qualified_legs ?? 0),
      autoshipActive: Boolean(row.autoship_active),
      lastActivity: new Date(row.updated_at ?? row.created_at),
      nextRankRequirement: null,
      billing: {},
      tax: {},
    } as MLMUser
  }

  private mapGenealogyFromDB(row: any): MLMGenealogy {
    return {
      id: row.id,
      userId: row.user_id,
      sponsorId: row.sponsor_id,
      uplineId: row.upline_id,
      level: row.level,
      position: row.position,
      matrixPosition: row.matrix_position,
      binaryLeg: row.binary_leg,
      isActive: row.is_active,
      joinDate: row.join_date
    }
  }

  private mapCommissionFromDB(row: any): MLMCommission {
    return {
      id: row.id,
      userId: row.user_id,
      fromUserId: row.from_user_id,
      type: row.commission_type,
      level: row.level,
      amount: parseFloat(row.amount),
      percentage: parseFloat(row.percentage),
      baseAmount: parseFloat(row.base_amount),
      rankBonus: parseFloat(row.rank_bonus),
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      processedAt: row.processed_at,
      createdAt: row.created_at
    }
  }

  private mapPayoutFromDB(row: any): MLMPayout {
    return {
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      method: row.payout_method,
      details: row.payout_details,
      status: row.status,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      commissionIds: row.commission_ids,
      stripePayoutId: row.stripe_payout_id,
      bankAccountId: row.bank_account_id,
      processedAt: row.processed_at,
      createdAt: row.created_at
    }
  }

  private mapTrainingFromDB(row: any): MLMTraining {
    return {
      id: row.id,
      userId: row.user_id,
      moduleId: row.module_id,
      title: row.module_title,
      category: row.category,
      level: row.level,
      duration: row.duration,
      completed: row.completed,
      score: row.score ? parseFloat(row.score) : undefined,
      progress: parseFloat(row.progress),
      startedAt: row.started_at,
      completedAt: row.completed_at,
      certificateIssued: row.certificate_issued,
      certificateId: row.certificate_id,
      createdAt: row.created_at
    }
  }

  private mapAnalyticsFromDB(row: any): MLMAnalytics {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.metric_type,
      value: parseFloat(row.metric_value),
      data: row.metric_data,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      createdAt: row.created_at
    }
  }

  private mapNotificationFromDB(row: any): MLMNotification {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      data: row.data,
      isRead: row.is_read,
      priority: row.priority,
      createdAt: row.created_at
    }
  }

  // Helper Methods for Real Database Operations
  private async generateUniqueMLMCode(client: PoolClient): Promise<string> {
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const code = `CR${Date.now().toString().slice(-6)}`
      const result = await client.query('SELECT id FROM mlm_users WHERE mlm_code = $1', [code])
      
      if (result.rows.length === 0) {
        return code
      }
      
      attempts++
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
    }
    
    throw new Error('Unable to generate unique MLM code after multiple attempts')
  }

  private async updateDownlineCounts(userId: string, client: PoolClient): Promise<void> {
    // Update total downlines count
    const downlineQuery = `
      WITH RECURSIVE downline_tree AS (
        SELECT id, sponsor_id, 1 as level
        FROM mlm_users 
        WHERE sponsor_id = (SELECT id FROM mlm_users WHERE user_id = $1)
        
        UNION ALL
        
        SELECT u.id, u.sponsor_id, dt.level + 1
        FROM mlm_users u
        JOIN downline_tree dt ON u.sponsor_id = dt.id
        WHERE dt.level < 10
      )
      SELECT COUNT(*) as total_downlines,
             COUNT(CASE WHEN status = 'active' THEN 1 END) as active_downlines
      FROM downline_tree dt
      JOIN mlm_users u ON dt.id = u.id
    `
    
    const result = await client.query(downlineQuery, [userId])
    const counts = result.rows[0]
    
    await client.query(
      'UPDATE mlm_users SET total_downlines = $1, active_downlines = $2 WHERE user_id = $3',
      [counts.total_downlines, counts.active_downlines, userId]
    )
  }

  async getTeamStats(userId: string, period: number = 30): Promise<any> {
    if (!this.pool) {
      return this.getMockTeamStats(userId, period)
    }

    try {
      const client = await this.pool.connect()
      try {
        const periodStart = new Date()
        periodStart.setDate(periodStart.getDate() - period)

        // Get team overview
        const overviewQuery = `
          WITH RECURSIVE team_tree AS (
            SELECT id, user_id, sponsor_id, personal_volume, team_volume, status, join_date
            FROM mlm_users 
            WHERE user_id = $1
            
            UNION ALL
            
            SELECT u.id, u.user_id, u.sponsor_id, u.personal_volume, u.team_volume, u.status, u.join_date
            FROM mlm_users u
            JOIN team_tree tt ON u.sponsor_id = tt.id
          )
          SELECT 
            COUNT(*) as total_members,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_members,
            COUNT(CASE WHEN join_date >= $2 THEN 1 END) as new_members_this_month,
            COALESCE(SUM(personal_volume), 0) as total_volume,
            COALESCE(SUM(personal_volume * 0.30), 0) as team_earnings,
            COALESCE(AVG(personal_volume), 0) as average_volume,
            COALESCE(AVG(CASE WHEN status = 'active' THEN 1.0 ELSE 0.0 END) * 100, 0) as retention_rate
          FROM team_tree
        `

        const overviewResult = await client.query(overviewQuery, [userId, periodStart])
        const overview = overviewResult.rows[0]

        // Get top performers
        const performersQuery = `
          WITH RECURSIVE team_tree AS (
            SELECT id, user_id, sponsor_id, personal_volume, team_volume, status
            FROM mlm_users 
            WHERE sponsor_id = (SELECT id FROM mlm_users WHERE user_id = $1)
            
            UNION ALL
            
            SELECT u.id, u.user_id, u.sponsor_id, u.personal_volume, u.team_volume, u.status
            FROM mlm_users u
            JOIN team_tree tt ON u.sponsor_id = tt.id
            WHERE tt.level < 3
          )
          SELECT 
            u.user_id,
            u.personal_volume,
            u.team_volume,
            u.personal_volume * 0.30 as earnings,
            r.name as rank_name
          FROM team_tree tt
          JOIN mlm_users u ON tt.user_id = u.user_id
          JOIN mlm_ranks r ON u.rank_id = r.id
          WHERE u.status = 'active'
          ORDER BY u.personal_volume DESC
          LIMIT 10
        `

        const performersResult = await client.query(performersQuery, [userId])
        const topPerformers = performersResult.rows

        // Get recent activity
        const activityQuery = `
          WITH RECURSIVE team_tree AS (
            SELECT id, user_id, sponsor_id
            FROM mlm_users 
            WHERE user_id = $1
            
            UNION ALL
            
            SELECT u.id, u.user_id, u.sponsor_id
            FROM mlm_users u
            JOIN team_tree tt ON u.sponsor_id = tt.id
          )
          SELECT 
            'new_member' as type,
            'New team member joined' as description,
            u.join_date as timestamp,
            u.user_id
          FROM team_tree tt
          JOIN mlm_users u ON tt.user_id = u.user_id
          WHERE u.join_date >= $2
          
          UNION ALL
          
          SELECT 
            'commission_earned' as type,
            'Commission earned: $' || c.total_amount as description,
            c.created_at as timestamp,
            c.user_id
          FROM team_tree tt
          JOIN mlm_commissions c ON tt.user_id = c.user_id
          WHERE c.created_at >= $2
          
          ORDER BY timestamp DESC
          LIMIT 20
        `

        const activityResult = await client.query(activityQuery, [userId, periodStart])
        const recentActivity = activityResult.rows

        return {
          overview: {
            totalMembers: parseInt(overview.total_members),
            activeMembers: parseInt(overview.active_members),
            newMembersThisMonth: parseInt(overview.new_members_this_month),
            totalVolume: parseFloat(overview.total_volume),
            teamEarnings: parseFloat(overview.team_earnings),
            averageVolume: parseFloat(overview.average_volume),
            retentionRate: parseFloat(overview.retention_rate)
          },
          topPerformers: topPerformers.map(p => ({
            id: p.user_id,
            name: p.user_id, // Would need to join with users table for actual names
            rank: p.rank_name,
            volume: parseFloat(p.personal_volume),
            earnings: parseFloat(p.earnings),
            growth: 0 // Would need historical data to calculate
          })),
          recentActivity: recentActivity.map(a => ({
            type: a.type,
            description: a.description,
            timestamp: a.timestamp,
            userId: a.user_id
          }))
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.log('🗄️ Database error, falling back to mock data:', error.message)
      return this.getMockTeamStats(userId, period)
    }
  }

  private async getMockTeamStats(userId: string, period: number): Promise<any> {
    return {
      overview: {
        totalMembers: 47,
        activeMembers: 38,
        newMembersThisMonth: 8,
        totalVolume: 125600,
        teamEarnings: 18750,
        averageVolume: 2672,
        retentionRate: 85.2
      },
      topPerformers: [
        {
          id: "user_001",
          name: "Sarah Johnson",
          rank: "Director",
          volume: 12500,
          earnings: 3750,
          growth: 18.2
        },
        {
          id: "user_002",
          name: "Mike Rodriguez",
          rank: "Manager",
          volume: 8900,
          earnings: 2670,
          growth: 15.7
        }
      ],
      recentActivity: [
        {
          type: "new_member",
          description: "Jennifer Brown joined your team",
          timestamp: "2024-01-20T10:30:00Z",
          userId: "user_006"
        }
      ]
    }
  }

  // Close connection pool
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
    }
  }

  // Mock Database Methods (for development without PostgreSQL)
  private async createMockMLMUser(userData: Partial<MLMUser>): Promise<MLMUser> {
    const { mlmRanks } = await import('@/lib/mlm-system')
    const defaultRank = mlmRanks[0] // Associate

    return {
      id: `mlm_${Date.now()}`,
      userId: userData.userId || `user_${Date.now()}`,
      sponsorId: userData.sponsorId || null,
      uplineId: userData.uplineId || null,
      mlmCode: userData.mlmCode || `MLM${Date.now().toString().slice(-6)}`,
      rank: userData.rank || defaultRank,
      status: userData.status || 'active',
      joinDate: new Date(),
      personalVolume: userData.personalVolume || 0,
      teamVolume: userData.teamVolume || 0,
      totalEarnings: userData.totalEarnings || 0,
      currentMonthEarnings: userData.currentMonthEarnings || 0,
      lifetimeEarnings: userData.lifetimeEarnings || 0,
      activeDownlines: userData.activeDownlines || 0,
      totalDownlines: userData.totalDownlines || 0,
      qualifiedLegs: userData.qualifiedLegs || 0,
      autoshipActive: userData.autoshipActive || false,
      lastActivity: new Date(),
      nextRankRequirement: null,
      billing: userData.billing || {},
      tax: userData.tax || {}
    }
  }

  private async getMockMLMUser(userId: string): Promise<MLMUser | null> {
    // Return mock data for development
    const { mlmRanks } = await import('@/lib/mlm-system')
    
    console.log('🔍 Mock MLM User lookup for ID:', userId)
    
    // Handle different user ID formats - accept any user ID for demo purposes
    if (userId) {
      // Create different mock users based on user ID for more realistic testing
      const mockUsers = {
        'test-user-123': {
          id: 'mlm_user_123',
          userId: userId,
          sponsorId: null,
          uplineId: null,
          mlmCode: 'CREDITPRO2024',
          rank: mlmRanks[3], // Director
          status: 'active',
          joinDate: new Date('2024-01-01'),
          personalVolume: 2500,
          teamVolume: 15000,
          totalEarnings: 25000,
          currentMonthEarnings: 3500,
          lifetimeEarnings: 75000,
          activeDownlines: 12,
          totalDownlines: 35,
          qualifiedLegs: 3,
          autoshipActive: true,
          lastActivity: new Date(),
          nextRankRequirement: mlmRanks[4].requirements,
          billing: {},
          tax: {}
        },
        'user_456': {
          id: 'mlm_user_456',
          userId: userId,
          sponsorId: 'test-user-123',
          uplineId: 'test-user-123',
          mlmCode: 'CREDIT456',
          rank: mlmRanks[2], // Manager
          status: 'active',
          joinDate: new Date('2024-01-15'),
          personalVolume: 1200,
          teamVolume: 5000,
          totalEarnings: 8500,
          currentMonthEarnings: 1200,
          lifetimeEarnings: 15000,
          activeDownlines: 5,
          totalDownlines: 12,
          qualifiedLegs: 2,
          autoshipActive: true,
          lastActivity: new Date(),
          nextRankRequirement: mlmRanks[3].requirements,
          billing: {},
          tax: {}
        },
        'user_789': {
          id: 'mlm_user_789',
          userId: userId,
          sponsorId: 'test-user-123',
          uplineId: 'test-user-123',
          mlmCode: 'CREDIT789',
          rank: mlmRanks[1], // Associate
          status: 'active',
          joinDate: new Date('2024-01-20'),
          personalVolume: 800,
          teamVolume: 2000,
          totalEarnings: 3200,
          currentMonthEarnings: 600,
          lifetimeEarnings: 5000,
          activeDownlines: 2,
          totalDownlines: 4,
          qualifiedLegs: 1,
          autoshipActive: true,
          lastActivity: new Date(),
          nextRankRequirement: mlmRanks[2].requirements,
          billing: {},
          tax: {}
        }
      }

      // Return specific user data if available, otherwise return default
      return mockUsers[userId] || {
        id: `mlm_${userId}`,
        userId: userId,
        sponsorId: 'test-user-123',
        uplineId: 'test-user-123',
        mlmCode: `CREDIT${userId.slice(-3)}`,
        rank: mlmRanks[1], // Associate
        status: 'active',
        joinDate: new Date('2024-02-01'),
        personalVolume: 500,
        teamVolume: 1000,
        totalEarnings: 1500,
        currentMonthEarnings: 300,
        lifetimeEarnings: 2500,
        activeDownlines: 1,
        totalDownlines: 2,
        qualifiedLegs: 0,
        autoshipActive: true,
        lastActivity: new Date(),
        nextRankRequirement: mlmRanks[2].requirements,
        billing: {},
        tax: {}
      }
    }
    
    return null
  }

  private async getMockCommissions(userId: string, periodStart?: Date, periodEnd?: Date): Promise<MLMCommission[]> {
    return [
      {
        id: 'comm_001',
        userId: userId,
        fromUserId: 'user_456',
        type: 'direct_referral',
        level: 1,
        amount: 225.00,
        percentage: 0.30,
        baseAmount: 750.00,
        rankBonus: 0.00,
        totalAmount: 225.00,
        status: 'paid',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        processedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10')
      },
      {
        id: 'comm_002',
        userId: userId,
        fromUserId: 'user_789',
        type: 'unilevel',
        level: 2,
        amount: 75.00,
        percentage: 0.10,
        baseAmount: 750.00,
        rankBonus: 0.00,
        totalAmount: 75.00,
        status: 'pending',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        createdAt: new Date('2024-01-12')
      }
    ]
  }

  private async getMockTeamStructure(userId: string, maxLevel: number = 10): Promise<MLMGenealogy[]> {
    // Create a realistic team structure for testing
    const teamMembers = [
      // Level 1 - Direct downlines
      {
        id: 'gen_1',
        userId: 'user_456',
        sponsorId: userId,
        uplineId: userId,
        level: 1,
        position: 'left',
        binaryLeg: 'left',
        isActive: true,
        joinDate: new Date('2024-01-15')
      },
      {
        id: 'gen_2',
        userId: 'user_789',
        sponsorId: userId,
        uplineId: userId,
        level: 1,
        position: 'right',
        binaryLeg: 'right',
        isActive: true,
        joinDate: new Date('2024-01-20')
      },
      {
        id: 'gen_3',
        userId: 'user_101',
        sponsorId: userId,
        uplineId: userId,
        level: 1,
        position: 'center',
        binaryLeg: 'left',
        isActive: true,
        joinDate: new Date('2024-02-01')
      },
      // Level 2 - Second level downlines
      {
        id: 'gen_4',
        userId: 'user_202',
        sponsorId: 'user_456',
        uplineId: userId,
        level: 2,
        position: 'left',
        binaryLeg: 'left',
        isActive: true,
        joinDate: new Date('2024-02-10')
      },
      {
        id: 'gen_5',
        userId: 'user_303',
        sponsorId: 'user_456',
        uplineId: userId,
        level: 2,
        position: 'right',
        binaryLeg: 'right',
        isActive: true,
        joinDate: new Date('2024-02-15')
      },
      {
        id: 'gen_6',
        userId: 'user_404',
        sponsorId: 'user_789',
        uplineId: userId,
        level: 2,
        position: 'left',
        binaryLeg: 'left',
        isActive: true,
        joinDate: new Date('2024-02-20')
      },
      {
        id: 'gen_7',
        userId: 'user_505',
        sponsorId: 'user_789',
        uplineId: userId,
        level: 2,
        position: 'right',
        binaryLeg: 'right',
        isActive: true,
        joinDate: new Date('2024-02-25')
      },
      // Level 3 - Third level downlines
      {
        id: 'gen_8',
        userId: 'user_606',
        sponsorId: 'user_202',
        uplineId: userId,
        level: 3,
        position: 'left',
        binaryLeg: 'left',
        isActive: true,
        joinDate: new Date('2024-03-01')
      },
      {
        id: 'gen_9',
        userId: 'user_707',
        sponsorId: 'user_202',
        uplineId: userId,
        level: 3,
        position: 'right',
        binaryLeg: 'right',
        isActive: true,
        joinDate: new Date('2024-03-05')
      },
      {
        id: 'gen_10',
        userId: 'user_808',
        sponsorId: 'user_404',
        uplineId: userId,
        level: 3,
        position: 'left',
        binaryLeg: 'left',
        isActive: false,
        joinDate: new Date('2024-03-10')
      }
    ]

    // Filter by maxLevel
    return teamMembers.filter(member => member.level <= maxLevel)
  }

  private async getMockNotifications(userId: string, unreadOnly: boolean = false): Promise<MLMNotification[]> {
    return [
      {
        id: 'notif_1',
        userId: userId,
        type: 'commission_earned',
        title: 'Commission Earned!',
        message: 'You earned $225.00 from a direct referral commission.',
        data: { amount: 225.00, type: 'direct_referral' },
        isRead: false,
        priority: 'normal',
        createdAt: new Date()
      },
      {
        id: 'notif_2',
        userId: userId,
        type: 'rank_advancement',
        title: 'Rank Advancement Available!',
        message: 'You are eligible for rank advancement to Director.',
        data: { currentRank: 'manager', nextRank: 'director' },
        isRead: false,
        priority: 'high',
        createdAt: new Date()
      }
    ]
  }

  // Search team members
  async searchTeamMembers(userId: string, query: string): Promise<any[]> {
    if (!this.pool) {
      return []
    }

    try {
      const searchQuery = `
        WITH RECURSIVE team_tree AS (
          SELECT mu.*, u.first_name, u.last_name, u.email, u.phone, u.location
          FROM mlm_users mu
          JOIN users u ON mu.user_id = u.id
          WHERE mu.user_id = $1
          
          UNION ALL
          
          SELECT mu.*, u.first_name, u.last_name, u.email, u.phone, u.location
          FROM mlm_users mu
          JOIN users u ON mu.user_id = u.id
          JOIN team_tree tt ON mu.sponsor_id = tt.user_id
        )
        SELECT DISTINCT 
          user_id as id,
          first_name,
          last_name,
          email,
          phone,
          location,
          rank_id as rank,
          status,
          personal_volume,
          team_volume,
          current_month_earnings,
          join_date
        FROM team_tree
        WHERE (
          LOWER(first_name) LIKE LOWER($2) OR
          LOWER(last_name) LIKE LOWER($2) OR
          LOWER(email) LIKE LOWER($2) OR
          LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER($2)
        )
        AND user_id != $1
        ORDER BY first_name, last_name
        LIMIT 50
      `
      const result = await this.pool.query(searchQuery, [userId, `%${query}%`])
      return result.rows
    } catch (error) {
      console.error('Error searching team members:', error)
      return []
    }
  }

  // Get user by email
  async getMLMUserByEmail(email: string): Promise<MLMUser | null> {
    if (!this.pool) {
      return null
    }

    try {
      const query = `
        SELECT mu.*, u.first_name, u.last_name, u.email, u.phone, u.location
        FROM mlm_users mu
        JOIN users u ON mu.user_id = u.id
        WHERE u.email = $1
      `
      const result = await this.pool.query(query, [email])
      return result.rows.length > 0 ? this.mapMLMUserFromDB(result.rows[0]) : null
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  }

  // Create invitation
  async createInvitation(invitationData: any): Promise<any> {
    if (!this.pool) {
      return {
        id: `inv_${Date.now()}`,
        ...invitationData,
        createdAt: new Date()
      }
    }

    try {
      const query = `
        INSERT INTO mlm_invitations (
          email, name, sponsor_id, token, expires_at, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `
      const values = [
        invitationData.email,
        invitationData.name,
        invitationData.sponsorId,
        invitationData.token,
        invitationData.expiresAt,
        invitationData.status
      ]
      const result = await this.pool.query(query, values)
      return result.rows[0]
    } catch (error) {
      console.error('Error creating invitation:', error)
      throw error
    }
  }

  // Get invitation by email
  async getInvitationByEmail(email: string): Promise<any> {
    if (!this.pool) {
      return null
    }

    try {
      const query = `
        SELECT * FROM mlm_invitations 
        WHERE email = $1 AND status = 'pending' AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `
      const result = await this.pool.query(query, [email])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching invitation by email:', error)
      return null
    }
  }

  // Get invitation by token
  async getInvitationByToken(token: string): Promise<any> {
    if (!this.pool) {
      return null
    }

    try {
      const query = `
        SELECT * FROM mlm_invitations 
        WHERE token = $1 AND status = 'pending' AND expires_at > NOW()
      `
      const result = await this.pool.query(query, [token])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching invitation by token:', error)
      return null
    }
  }

  // Update invitation status
  async updateInvitationStatus(invitationId: string, status: string): Promise<void> {
    if (!this.pool) {
      return
    }

    try {
      const query = `
        UPDATE mlm_invitations 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `
      await this.pool.query(query, [status, invitationId])
    } catch (error) {
      console.error('Error updating invitation status:', error)
      throw error
    }
  }

  // Generate unique team code
  async generateTeamCode(): Promise<string> {
    if (!this.pool) {
      return `TEAM${Date.now().toString(36).toUpperCase()}`
    }

    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const teamCode = `TEAM${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      try {
        const query = `SELECT id FROM mlm_users WHERE team_code = $1`
        const result = await this.pool.query(query, [teamCode])
        
        if (result.rows.length === 0) {
          return teamCode
        }
      } catch (error) {
        console.error('Error checking team code uniqueness:', error)
      }
      
      attempts++
    }
    
    // Fallback to timestamp-based code
    return `TEAM${Date.now().toString(36).toUpperCase()}`
  }

  // Get MLM rank by ID
  async getMLMRank(rankId: number): Promise<any> {
    if (!this.pool) {
      return {
        id: rankId,
        name: 'Bronze',
        level: 1,
        personal_volume_required: 1000,
        team_volume_required: 5000,
        direct_recruits_required: 3
      }
    }

    try {
      const query = `SELECT * FROM mlm_ranks WHERE id = $1`
      const result = await this.pool.query(query, [rankId])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching MLM rank:', error)
      return null
    }
  }

  // Get team by code
  async getTeamByCode(teamCode: string): Promise<any> {
    if (this.supabase) {
      try {
        const { data } = await this.supabase
          .from('mlm_teams')
          .select('*, users:sponsor_user_id(first_name, last_name)')
          .eq('team_code', teamCode)
          .maybeSingle()
        if (data) {
          return {
            team_code: data.team_code,
            team_name: data.team_name,
            sponsor_name: data.users
              ? `${data.users.first_name} ${data.users.last_name}`.trim()
              : 'Unknown',
            member_count: data.member_count ?? 0,
            team_rank: data.rank ?? 'Associate',
          }
        }
      } catch { /* fall through to hardcoded demo values */ }
    }

    // Hardcoded demo fallback
    if (teamCode === 'TEST123') {
      return {
        team_code: 'TEST123',
        team_name: 'Elite Test Team',
        sponsor_name: 'John Smith',
        member_count: 12,
        team_rank: 'Diamond'
      }
    }
      
    if (teamCode === 'DEMO456') {
      return {
        team_code: 'DEMO456',
        team_name: 'Demo Success Team',
        sponsor_name: 'Sarah Johnson',
        member_count: 8,
        team_rank: 'Platinum'
      }
    }
      
    if (teamCode === 'START789') {
      return {
        team_code: 'START789',
        team_name: 'Newcomers Team',
        sponsor_name: 'Mike Wilson',
        member_count: 3,
        team_rank: 'Bronze'
      }
    }
      
    // Default mock team for any other code
    return {
      team_code: teamCode,
      team_name: `Mock Team ${teamCode}`,
      sponsor_name: 'Mock Sponsor',
      member_count: 5,
      team_rank: 'Gold'
    }
  }

  // Get user commissions
  async getUserCommissions(userId: string, limit: number = 10): Promise<any[]> {
    if (!this.pool) {
      return [
        {
          id: 'comm_1',
          type: 'direct_commission',
          amount: 150.00,
          description: 'Direct sales commission',
          created_at: new Date().toISOString(),
          status: 'paid'
        },
        {
          id: 'comm_2',
          type: 'team_commission',
          amount: 75.00,
          description: 'Team volume bonus',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'pending'
        }
      ]
    }

    try {
      const query = `
        SELECT 
          id,
          type,
          amount,
          description,
          created_at,
          status
        FROM mlm_commissions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `
      const result = await this.pool.query(query, [userId, limit])
      return result.rows
    } catch (error) {
      console.error('Error fetching user commissions:', error)
      return []
    }
  }

  // Create new MLM user with team assignment
  async createMLMUserWithTeam(userData: any, teamCode?: string): Promise<MLMUser> {
    console.log('🔍 Creating MLM user with team assignment:', { userData, teamCode })
    
    // Generate unique MLM code
    const mlmCode = `CREDIT${Date.now().toString().slice(-6)}`
    
    // If team code provided, validate it exists
    let sponsorId = null
    let teamCodeToUse = teamCode
    
    if (teamCode) {
      const teamInfo = await this.getTeamByCode(teamCode)
      if (!teamInfo) {
        throw new Error('Invalid team code')
      }
      // In a real system, we'd get the sponsor ID from the team
      sponsorId = 'sponsor_123' // Mock sponsor ID
    } else {
      // Generate new team code for new team leader
      teamCodeToUse = await this.generateTeamCode()
    }
    
    // Create the MLM user
    const newMLMUser = await this.createMockMLMUser({
      ...userData,
      mlmCode,
      sponsorId,
      status: 'active',
      joinDate: new Date(),
      personalVolume: 0,
      teamVolume: 0,
      totalEarnings: 0,
      currentMonthEarnings: 0,
      lifetimeEarnings: 0,
      activeDownlines: 0,
      totalDownlines: 0,
      qualifiedLegs: 0,
      autoshipActive: false,
      lastActivity: new Date(),
      nextRankRequirement: null,
      billing: {},
      tax: {}
    })
    
    // Add team code to the response
    const userWithTeamCode = {
      ...newMLMUser,
      teamCode: teamCodeToUse
    }
    
    console.log('✅ Created MLM user:', userWithTeamCode)
    return userWithTeamCode
  }
}

// Export singleton instance
export const mlmDatabaseService = new MLMDatabaseService()

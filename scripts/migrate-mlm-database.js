#!/usr/bin/env node

/**
 * MLM Database Migration Script
 * Creates all MLM tables and initial data
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function runMigration() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Starting MLM database migration...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'mlm-database-schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the schema
    console.log('📋 Creating MLM database schema...')
    await client.query(schemaSQL)
    
    console.log('✅ MLM database schema created successfully!')
    
    // Insert some sample data for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('🌱 Inserting sample data...')
      await insertSampleData(client)
    }
    
    console.log('🎉 MLM database migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

async function insertSampleData(client) {
  try {
    // Insert sample MLM users
    const sampleUsers = [
      {
        user_id: 'user_123',
        sponsor_id: null,
        upline_id: null,
        mlm_code: 'CREDITPRO2024',
        rank_id: 'manager',
        status: 'active',
        personal_volume: 1250,
        team_volume: 8500,
        total_earnings: 12450,
        current_month_earnings: 2100,
        lifetime_earnings: 45600,
        active_downlines: 8,
        total_downlines: 23,
        qualified_legs: 2,
        autoship_active: true
      },
      {
        user_id: 'user_456',
        sponsor_id: 'user_123',
        upline_id: 'user_123',
        mlm_code: 'SARAH2024',
        rank_id: 'consultant',
        status: 'active',
        personal_volume: 750,
        team_volume: 1200,
        total_earnings: 3200,
        current_month_earnings: 850,
        lifetime_earnings: 8500,
        active_downlines: 3,
        total_downlines: 5,
        qualified_legs: 1,
        autoship_active: true
      },
      {
        user_id: 'user_789',
        sponsor_id: 'user_123',
        upline_id: 'user_123',
        mlm_code: 'MIKE2024',
        rank_id: 'associate',
        status: 'active',
        personal_volume: 300,
        team_volume: 300,
        total_earnings: 900,
        current_month_earnings: 300,
        lifetime_earnings: 900,
        active_downlines: 0,
        total_downlines: 0,
        qualified_legs: 0,
        autoship_active: false
      }
    ]

    for (const user of sampleUsers) {
      await client.query(`
        INSERT INTO mlm_users (
          user_id, sponsor_id, upline_id, mlm_code, rank_id, status,
          personal_volume, team_volume, total_earnings, current_month_earnings,
          lifetime_earnings, active_downlines, total_downlines, qualified_legs,
          autoship_active, billing_info, tax_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        user.user_id, user.sponsor_id, user.upline_id, user.mlm_code, user.rank_id,
        user.status, user.personal_volume, user.team_volume, user.total_earnings,
        user.current_month_earnings, user.lifetime_earnings, user.active_downlines,
        user.total_downlines, user.qualified_legs, user.autoship_active,
        JSON.stringify({}), JSON.stringify({})
      ])
    }

    // Insert genealogy relationships
    const genealogyData = [
      {
        user_id: 'user_456',
        sponsor_id: 'user_123',
        upline_id: 'user_123',
        level: 1,
        position: 'left',
        binary_leg: 'left',
        is_active: true
      },
      {
        user_id: 'user_789',
        sponsor_id: 'user_123',
        upline_id: 'user_123',
        level: 1,
        position: 'right',
        binary_leg: 'right',
        is_active: true
      }
    ]

    for (const entry of genealogyData) {
      await client.query(`
        INSERT INTO mlm_genealogy (
          user_id, sponsor_id, upline_id, level, position, binary_leg, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, sponsor_id) DO NOTHING
      `, [
        entry.user_id, entry.sponsor_id, entry.upline_id, entry.level,
        entry.position, entry.binary_leg, entry.is_active
      ])
    }

    // Insert sample commissions
    const commissionData = [
      {
        user_id: 'user_123',
        from_user_id: 'user_456',
        commission_type: 'direct_referral',
        level: 1,
        amount: 225.00,
        percentage: 0.30,
        base_amount: 750.00,
        rank_bonus: 0.00,
        total_amount: 225.00,
        status: 'paid',
        period_start: new Date('2024-01-01'),
        period_end: new Date('2024-01-31')
      },
      {
        user_id: 'user_123',
        from_user_id: 'user_789',
        commission_type: 'unilevel',
        level: 1,
        amount: 30.00,
        percentage: 0.10,
        base_amount: 300.00,
        rank_bonus: 0.00,
        total_amount: 30.00,
        status: 'pending',
        period_start: new Date('2024-01-01'),
        period_end: new Date('2024-01-31')
      }
    ]

    for (const commission of commissionData) {
      await client.query(`
        INSERT INTO mlm_commissions (
          user_id, from_user_id, commission_type, level, amount, percentage,
          base_amount, rank_bonus, total_amount, status, period_start, period_end
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        commission.user_id, commission.from_user_id, commission.commission_type,
        commission.level, commission.amount, commission.percentage, commission.base_amount,
        commission.rank_bonus, commission.total_amount, commission.status,
        commission.period_start, commission.period_end
      ])
    }

    // Insert sample training records
    const trainingData = [
      {
        user_id: 'user_123',
        module_id: 'mlm_fundamentals',
        module_title: 'MLM Fundamentals',
        category: 'onboarding',
        level: 'beginner',
        duration: 120,
        completed: true,
        score: 95,
        progress: 100,
        started_at: new Date('2024-01-01'),
        completed_at: new Date('2024-01-02'),
        certificate_issued: true
      },
      {
        user_id: 'user_456',
        module_id: 'credit_repair_basics',
        module_title: 'Credit Repair Basics',
        category: 'product',
        level: 'beginner',
        duration: 90,
        completed: true,
        score: 88,
        progress: 100,
        started_at: new Date('2024-01-15'),
        completed_at: new Date('2024-01-16'),
        certificate_issued: true
      }
    ]

    for (const training of trainingData) {
      await client.query(`
        INSERT INTO mlm_training (
          user_id, module_id, module_title, category, level, duration,
          completed, score, progress, started_at, completed_at, certificate_issued
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        training.user_id, training.module_id, training.module_title, training.category,
        training.level, training.duration, training.completed, training.score,
        training.progress, training.started_at, training.completed_at, training.certificate_issued
      ])
    }

    // Insert sample notifications
    const notificationData = [
      {
        user_id: 'user_123',
        type: 'commission_earned',
        title: 'Commission Earned!',
        message: 'You earned $225.00 from a direct referral commission.',
        data: JSON.stringify({ amount: 225.00, type: 'direct_referral' }),
        priority: 'normal'
      },
      {
        user_id: 'user_456',
        type: 'rank_advancement',
        title: 'Rank Advancement Available!',
        message: 'You are eligible for rank advancement to Manager.',
        data: JSON.stringify({ currentRank: 'consultant', nextRank: 'manager' }),
        priority: 'high'
      }
    ]

    for (const notification of notificationData) {
      await client.query(`
        INSERT INTO mlm_notifications (
          user_id, type, title, message, data, priority
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        notification.user_id, notification.type, notification.title,
        notification.message, notification.data, notification.priority
      ])
    }

    console.log('✅ Sample data inserted successfully!')
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error)
    throw error
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().catch(console.error)
}

module.exports = { runMigration }

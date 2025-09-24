#!/usr/bin/env node

// Production Database Migration Script
// Migrates from mock database to production PostgreSQL

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Database configuration
const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'creditrepair',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}

const pool = new Pool(config)

async function runMigration() {
  console.log('🚀 Starting Production Database Migration')
  console.log('=========================================')
  console.log()

  try {
    // Test database connection
    console.log('1. 🔌 Testing database connection...')
    const client = await pool.connect()
    console.log('   ✅ Database connected successfully')
    client.release()

    // Read and execute schema
    console.log('2. 📋 Creating credit monitoring schema...')
    const schemaPath = path.join(__dirname, 'credit-monitoring-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    await pool.query(schema)
    console.log('   ✅ Credit monitoring schema created')

    // Create indexes
    console.log('3. 📊 Creating performance indexes...')
    const indexQueries = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_scores_user_bureau ON credit_scores(user_id, bureau)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_scores_created_at ON credit_scores(created_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_alerts_user_severity ON credit_alerts(user_id, severity)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_alerts_action_required ON credit_alerts(action_required) WHERE action_required = TRUE',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_bureau_api_logs_created_at ON credit_bureau_api_logs(created_at)'
    ]

    for (const query of indexQueries) {
      try {
        await pool.query(query)
        console.log(`   ✅ Index created: ${query.split(' ')[5]}`)
      } catch (error) {
        console.log(`   ⚠️  Index creation skipped: ${error.message}`)
      }
    }

    // Insert sample data for testing
    console.log('4. 📝 Inserting sample data...')
    await insertSampleData()
    console.log('   ✅ Sample data inserted')

    // Verify migration
    console.log('5. ✅ Verifying migration...')
    await verifyMigration()
    console.log('   ✅ Migration verified successfully')

    console.log()
    console.log('🎉 Migration completed successfully!')
    console.log('=====================================')
    console.log()
    console.log('📋 Next steps:')
    console.log('1. Configure credit bureau API keys in .env.local')
    console.log('2. Test API integrations with: npm run test:credit-monitoring')
    console.log('3. Deploy to production environment')
    console.log('4. Monitor API usage and performance')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

async function insertSampleData() {
  // Insert sample credit monitoring settings for demo user
  await pool.query(`
    INSERT INTO credit_monitoring_settings (
      user_id, enabled, score_alerts_enabled, score_alerts_threshold,
      score_alerts_direction, new_account_alerts, inquiry_alerts,
      payment_alerts, balance_alerts_enabled, balance_alerts_threshold,
      email_notifications, sms_notifications, push_notifications, frequency
    ) VALUES (
      'demo-user-123', true, true, 10, 'both', true, true, true, true, 1000,
      true, false, true, 'immediate'
    ) ON CONFLICT (user_id) DO NOTHING
  `)

  // Insert sample monitoring session
  await pool.query(`
    INSERT INTO credit_monitoring_sessions (
      user_id, is_active, last_check, next_check, settings_id
    ) VALUES (
      'demo-user-123', true, NOW(), NOW() + INTERVAL '5 minutes',
      (SELECT id FROM credit_monitoring_settings WHERE user_id = 'demo-user-123')
    ) ON CONFLICT (user_id) DO NOTHING
  `)

  // Insert sample credit scores
  const sampleScores = [
    {
      user_id: 'demo-user-123',
      bureau: 'experian',
      score: 720,
      score_type: 'fico',
      score_range_min: 300,
      score_range_max: 850,
      factors: JSON.stringify([
        { code: 'PAYMENT_HISTORY', description: 'Payment History', impact: 'positive', weight: 0.35 },
        { code: 'CREDIT_UTILIZATION', description: 'Credit Utilization', impact: 'negative', weight: 0.30 }
      ]),
      request_id: 'demo_exp_001'
    },
    {
      user_id: 'demo-user-123',
      bureau: 'equifax',
      score: 715,
      score_type: 'fico',
      score_range_min: 300,
      score_range_max: 850,
      factors: JSON.stringify([
        { code: 'PAYMENT_HISTORY', description: 'Payment History', impact: 'positive', weight: 0.35 },
        { code: 'CREDIT_UTILIZATION', description: 'Credit Utilization', impact: 'negative', weight: 0.30 }
      ]),
      request_id: 'demo_eq_001'
    },
    {
      user_id: 'demo-user-123',
      bureau: 'transunion',
      score: 730,
      score_type: 'fico',
      score_range_min: 300,
      score_range_max: 850,
      factors: JSON.stringify([
        { code: 'PAYMENT_HISTORY', description: 'Payment History', impact: 'positive', weight: 0.35 },
        { code: 'CREDIT_UTILIZATION', description: 'Credit Utilization', impact: 'negative', weight: 0.30 }
      ]),
      request_id: 'demo_tu_001'
    }
  ]

  for (const score of sampleScores) {
    await pool.query(`
      INSERT INTO credit_scores (
        user_id, bureau, score, score_type, score_range_min, score_range_max,
        factors, request_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (user_id, bureau, created_at::DATE) DO NOTHING
    `, [
      score.user_id, score.bureau, score.score, score.score_type,
      score.score_range_min, score.score_range_max, score.factors, score.request_id
    ])
  }

  // Insert sample alerts
  const sampleAlerts = [
    {
      user_id: 'demo-user-123',
      bureau: 'experian',
      alert_type: 'score_change',
      severity: 'medium',
      title: 'Credit Score Increased',
      description: 'Your Experian credit score increased by 15 points',
      alert_data: JSON.stringify({ change: 15, previous_score: 705 }),
      action_required: false
    },
    {
      user_id: 'demo-user-123',
      bureau: 'equifax',
      alert_type: 'new_account',
      severity: 'high',
      title: 'New Account Detected',
      description: 'A new credit card account was opened in your name',
      alert_data: JSON.stringify({ creditor: 'Chase Bank', account_type: 'Credit Card' }),
      action_required: true,
      action_url: '/dashboard/monitoring/alerts/new-account'
    }
  ]

  for (const alert of sampleAlerts) {
    await pool.query(`
      INSERT INTO credit_alerts (
        user_id, bureau, alert_type, severity, title, description,
        alert_data, action_required, action_url, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `, [
      alert.user_id, alert.bureau, alert.alert_type, alert.severity,
      alert.title, alert.description, alert.alert_data, alert.action_required, alert.action_url
    ])
  }
}

async function verifyMigration() {
  // Check if all tables exist
  const tables = [
    'credit_scores', 'credit_reports', 'credit_alerts',
    'credit_monitoring_settings', 'credit_monitoring_sessions',
    'credit_bureau_api_logs', 'credit_score_history',
    'credit_monitoring_notifications'
  ]

  for (const table of tables) {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [table])

    if (!result.rows[0].exists) {
      throw new Error(`Table ${table} does not exist`)
    }
  }

  // Check sample data
  const scoreCount = await pool.query('SELECT COUNT(*) FROM credit_scores WHERE user_id = $1', ['demo-user-123'])
  const alertCount = await pool.query('SELECT COUNT(*) FROM credit_alerts WHERE user_id = $1', ['demo-user-123'])
  const settingsCount = await pool.query('SELECT COUNT(*) FROM credit_monitoring_settings WHERE user_id = $1', ['demo-user-123'])

  console.log(`   📊 Sample data counts:`)
  console.log(`      - Credit Scores: ${scoreCount.rows[0].count}`)
  console.log(`      - Credit Alerts: ${alertCount.rows[0].count}`)
  console.log(`      - Settings: ${settingsCount.rows[0].count}`)
}

// Run migration
if (require.main === module) {
  runMigration().catch(console.error)
}

module.exports = { runMigration }

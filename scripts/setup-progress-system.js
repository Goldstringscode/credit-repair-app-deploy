const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function setupProgressTables() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Setting up progress tracking tables...')
    
    // Read the SQL file
    const fs = require('fs')
    const path = require('path')
    const sqlPath = path.join(__dirname, 'setup-progress-tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    await client.query(sql)
    
    console.log('✅ Progress tracking tables created successfully!')
    
    // Verify tables exist
    const tables = ['user_quiz_attempts', 'user_lesson_progress', 'user_course_progress', 'user_achievements']
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table])
      
      if (result.rows[0].exists) {
        console.log(`✅ Table ${table} exists`)
      } else {
        console.log(`❌ Table ${table} missing`)
      }
    }
    
    // Insert sample data for testing
    console.log('📝 Inserting sample data...')
    
    const sampleUserId = '550e8400-e29b-41d4-a716-446655440000'
    const sampleCourseId = '550e8400-e29b-41d4-a716-446655440002'
    
    // Sample course progress
    await client.query(`
      INSERT INTO user_course_progress (
        user_id, course_id, is_enrolled, overall_progress, 
        lessons_completed, total_lessons, time_spent, 
        enrolled_at, last_accessed_at
      ) VALUES ($1, $2, true, 20, 1, 5, 720, NOW(), NOW())
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        overall_progress = EXCLUDED.overall_progress,
        lessons_completed = EXCLUDED.lessons_completed,
        last_accessed_at = NOW()
    `, [sampleUserId, sampleCourseId])
    
    console.log('✅ Sample data inserted successfully!')
    
  } catch (error) {
    console.error('❌ Error setting up progress tables:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the setup
setupProgressTables().catch(console.error)


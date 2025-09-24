require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function createMissingTables() {
  try {
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ No database URL found');
      return;
    }

    console.log('🚀 Creating missing training tables...');
    const sql = neon(databaseUrl);

    // Create user course enrollments table (without foreign key constraints for now)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_course_enrollments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id INTEGER NOT NULL,
          course_id UUID NOT NULL,
          enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          progress_percentage INTEGER DEFAULT 0,
          last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, course_id)
        )
      `;
      console.log('✅ User course enrollments table created');
    } catch (error) {
      console.log('⚠️  Enrollments table error:', error.message);
    }

    // Create user lesson progress table (without foreign key constraints for now)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_lesson_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id INTEGER NOT NULL,
          lesson_id UUID NOT NULL,
          course_id UUID NOT NULL,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          watch_time_seconds INTEGER DEFAULT 0,
          is_completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, lesson_id)
        )
      `;
      console.log('✅ User lesson progress table created');
    } catch (error) {
      console.log('⚠️  Lesson progress table error:', error.message);
    }

    // Create user quiz attempts table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_quiz_attempts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id INTEGER NOT NULL,
          quiz_id UUID NOT NULL,
          course_id UUID NOT NULL,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          score INTEGER,
          max_score INTEGER,
          passed BOOLEAN,
          time_taken_seconds INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ User quiz attempts table created');
    } catch (error) {
      console.log('⚠️  Quiz attempts table error:', error.message);
    }

    // Create user quiz answers table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_quiz_answers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          attempt_id UUID NOT NULL,
          question_id UUID NOT NULL,
          selected_option_id UUID,
          answer_text TEXT,
          is_correct BOOLEAN,
          points_earned INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ User quiz answers table created');
    } catch (error) {
      console.log('⚠️  Quiz answers table error:', error.message);
    }

    // Create training certificates table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS training_certificates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id INTEGER NOT NULL,
          course_id UUID NOT NULL,
          certificate_number VARCHAR(100) UNIQUE NOT NULL,
          issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE,
          pdf_url VARCHAR(500),
          verification_url VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Training certificates table created');
    } catch (error) {
      console.log('⚠️  Certificates table error:', error.message);
    }

    // Create user achievements table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_achievements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id INTEGER NOT NULL,
          achievement_id UUID NOT NULL,
          earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, achievement_id)
        )
      `;
      console.log('✅ User achievements table created');
    } catch (error) {
      console.log('⚠️  User achievements table error:', error.message);
    }

    console.log('✅ Missing tables creation completed!');
    
    // Verify the setup
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'user_%' OR table_name LIKE 'training_%'
        ORDER BY table_name
      `;
      
      console.log('📊 All training-related tables:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
      
    } catch (error) {
      console.log('⚠️  Could not verify table creation:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating missing tables:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createMissingTables();
}

module.exports = { createMissingTables };

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function setupTrainingDatabaseSimple() {
  try {
    // Check if we have database URL
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ No database URL found. Please set NEON_DATABASE_URL or DATABASE_URL environment variable.');
      return;
    }

    console.log('🚀 Setting up Training System database tables (simplified)...');
    const sql = neon(databaseUrl);

    // Create users table if it doesn't exist
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Users table created/verified');
    } catch (error) {
      console.log('⚠️  Users table error:', error.message);
    }

    // Create training categories table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS training_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          icon VARCHAR(50),
          color VARCHAR(7),
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Training categories table created');
    } catch (error) {
      console.log('⚠️  Categories table error:', error.message);
    }

    // Create training courses table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS training_courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          short_description VARCHAR(500),
          category_id UUID REFERENCES training_categories(id),
          level VARCHAR(50) NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
          duration_minutes INTEGER NOT NULL,
          lessons_count INTEGER DEFAULT 0,
          enrolled_count INTEGER DEFAULT 0,
          rating DECIMAL(3,2) DEFAULT 0.0,
          rating_count INTEGER DEFAULT 0,
          instructor_name VARCHAR(255),
          instructor_bio TEXT,
          thumbnail_url VARCHAR(500),
          preview_video_url VARCHAR(500),
          is_published BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Training courses table created');
    } catch (error) {
      console.log('⚠️  Courses table error:', error.message);
    }

    // Create training lessons table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS training_lessons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'text', 'interactive', 'quiz')),
          content TEXT,
          video_url VARCHAR(500),
          duration_minutes INTEGER DEFAULT 0,
          sort_order INTEGER DEFAULT 0,
          is_free BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Training lessons table created');
    } catch (error) {
      console.log('⚠️  Lessons table error:', error.message);
    }

    // Create training quizzes table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS training_quizzes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
          lesson_id UUID REFERENCES training_lessons(id),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          passing_score INTEGER DEFAULT 70,
          time_limit_minutes INTEGER,
          is_required BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Training quizzes table created');
    } catch (error) {
      console.log('⚠️  Quizzes table error:', error.message);
    }

    // Create quiz questions table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS quiz_questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          quiz_id UUID REFERENCES training_quizzes(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay')),
          points INTEGER DEFAULT 1,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Quiz questions table created');
    } catch (error) {
      console.log('⚠️  Quiz questions table error:', error.message);
    }

    // Create quiz answer options table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS quiz_answer_options (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
          option_text TEXT NOT NULL,
          is_correct BOOLEAN DEFAULT false,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Quiz answer options table created');
    } catch (error) {
      console.log('⚠️  Quiz answer options table error:', error.message);
    }

    // Create user course enrollments table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_course_enrollments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
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

    // Create user lesson progress table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_lesson_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          lesson_id UUID REFERENCES training_lessons(id) ON DELETE CASCADE,
          course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
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

    // Create training achievements table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS training_achievements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(100),
          color VARCHAR(7),
          criteria_type VARCHAR(50) NOT NULL CHECK (criteria_type IN ('courses_completed', 'lessons_completed', 'perfect_scores', 'streak_days', 'custom')),
          criteria_value INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Training achievements table created');
    } catch (error) {
      console.log('⚠️  Achievements table error:', error.message);
    }

    // Insert default training categories
    try {
      await sql`
        INSERT INTO training_categories (name, description, icon, color, sort_order) VALUES
        ('Fundamentals', 'Basic credit repair concepts and principles', 'BookOpen', '#3B82F6', 1),
        ('Dispute Strategies', 'Advanced techniques for disputing negative items', 'Target', '#EF4444', 2),
        ('Legal Rights', 'Understanding consumer protection laws', 'Scale', '#8B5CF6', 3),
        ('Credit Building', 'Strategies to build and maintain good credit', 'TrendingUp', '#10B981', 4),
        ('Business Credit', 'Establishing and building business credit', 'Building', '#F59E0B', 5),
        ('Mortgage Preparation', 'Preparing credit for mortgage approval', 'Home', '#EC4899', 6)
        ON CONFLICT DO NOTHING
      `;
      console.log('✅ Default training categories inserted');
    } catch (error) {
      console.log('⚠️  Categories insert error:', error.message);
    }

    // Insert default training achievements
    try {
      await sql`
        INSERT INTO training_achievements (name, description, icon, color, criteria_type, criteria_value) VALUES
        ('First Steps', 'Complete your first lesson', 'Star', '#F59E0B', 'lessons_completed', 1),
        ('Course Master', 'Complete 5 courses', 'Award', '#8B5CF6', 'courses_completed', 5),
        ('Perfect Score', 'Get 100% on a quiz', 'Target', '#EF4444', 'perfect_scores', 1),
        ('Learning Streak', 'Learn for 7 consecutive days', 'TrendingUp', '#10B981', 'streak_days', 7),
        ('Knowledge Seeker', 'Complete 50 lessons', 'BookOpen', '#3B82F6', 'lessons_completed', 50),
        ('Certification Expert', 'Earn 10 certificates', 'GraduationCap', '#EC4899', 'courses_completed', 10)
        ON CONFLICT DO NOTHING
      `;
      console.log('✅ Default training achievements inserted');
    } catch (error) {
      console.log('⚠️  Achievements insert error:', error.message);
    }

    console.log('✅ Training System database setup completed!');
    
    // Verify the setup
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'training_%'
        ORDER BY table_name
      `;
      
      console.log('📊 Training tables created:');
      if (tables.length === 0) {
        console.log('   ⚠️  No training tables found!');
      } else {
        tables.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      }
      
    } catch (error) {
      console.log('⚠️  Could not verify table creation:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error setting up training database:', error);
  }
}

// Run if called directly
if (require.main === module) {
  setupTrainingDatabaseSimple();
}

module.exports = { setupTrainingDatabaseSimple };

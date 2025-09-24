require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function verifyTrainingDatabase() {
  try {
    // Check if we have database URL
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ No database URL found. Please set NEON_DATABASE_URL or DATABASE_URL environment variable.');
      return;
    }

    console.log('🔍 Verifying Training System database setup...');
    const sql = neon(databaseUrl);

    // Check if training tables exist
    const tables = await sql`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name LIKE 'training_%'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('❌ No training tables found. Please run setup-training-database.js first.');
      return;
    }

    console.log(`✅ Found ${tables.length} training tables:`);
    tables.forEach(table => {
      console.log(`   📊 ${table.table_name} (${table.column_count} columns)`);
    });

    // Check table contents
    console.log('\n📋 Checking table contents...');

    // Check categories
    const categories = await sql`SELECT COUNT(*) as count FROM training_categories`;
    console.log(`   🏷️  Training Categories: ${categories[0].count}`);

    // Check courses
    const courses = await sql`SELECT COUNT(*) as count FROM training_courses`;
    console.log(`   📚 Training Courses: ${courses[0].count}`);

    // Check lessons
    const lessons = await sql`SELECT COUNT(*) as count FROM training_lessons`;
    console.log(`   📖 Training Lessons: ${lessons[0].count}`);

    // Check quizzes
    const quizzes = await sql`SELECT COUNT(*) as count FROM training_quizzes`;
    console.log(`   ❓ Training Quizzes: ${quizzes[0].count}`);

    // Check users
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`   👤 Users: ${users[0].count}`);

    // Check enrollments
    const enrollments = await sql`SELECT COUNT(*) as count FROM user_course_enrollments`;
    console.log(`   🎓 Course Enrollments: ${enrollments[0].count}`);

    // Check achievements
    const achievements = await sql`SELECT COUNT(*) as count FROM training_achievements`;
    console.log(`   🏆 Training Achievements: ${achievements[0].count}`);

    // Show sample data
    console.log('\n📊 Sample Data Preview:');

    // Show a sample course
    const sampleCourse = await sql`
      SELECT tc.title, tc.level, tc.duration_minutes, tc.lessons_count, tc.name as category_name
      FROM training_courses tc
      LEFT JOIN training_categories tcat ON tc.category_id = tcat.id
      LIMIT 1
    `;

    if (sampleCourse.length > 0) {
      const course = sampleCourse[0];
      console.log(`   📚 Sample Course: ${course.title}`);
      console.log(`      Level: ${course.level}`);
      console.log(`      Duration: ${course.duration_minutes} minutes`);
      console.log(`      Lessons: ${course.lessons_count}`);
      console.log(`      Category: ${course.category_name || 'Uncategorized'}`);
    }

    // Show sample lessons
    const sampleLessons = await sql`
      SELECT title, content_type, duration_minutes
      FROM training_lessons
      LIMIT 3
    `;

    if (sampleLessons.length > 0) {
      console.log(`   📖 Sample Lessons:`);
      sampleLessons.forEach((lesson, index) => {
        console.log(`      ${index + 1}. ${lesson.title} (${lesson.content_type}, ${lesson.duration_minutes} min)`);
      });
    }

    // Show sample quiz questions
    const sampleQuestions = await sql`
      SELECT qq.question_text, qq.question_type, COUNT(qao.id) as option_count
      FROM quiz_questions qq
      LEFT JOIN quiz_answer_options qao ON qq.id = qao.question_id
      GROUP BY qq.id, qq.question_text, qq.question_type
      LIMIT 3
    `;

    if (sampleQuestions.length > 0) {
      console.log(`   ❓ Sample Quiz Questions:`);
      sampleQuestions.forEach((question, index) => {
        console.log(`      ${index + 1}. ${question.question_text.substring(0, 50)}... (${question.question_type}, ${question.option_count} options)`);
      });
    }

    console.log('\n✅ Training System database verification completed!');
    
    if (courses[0].count > 0 && lessons[0].count > 0) {
      console.log('🎉 Your training system is ready to use!');
      console.log('🌐 Visit /dashboard/training to explore the platform.');
    } else {
      console.log('⚠️  Database is set up but needs sample data. Run populate-training-data.js to add content.');
    }

  } catch (error) {
    console.error('❌ Error verifying training database:', error);
  }
}

// Run if called directly
if (require.main === module) {
  verifyTrainingDatabase();
}

module.exports = { verifyTrainingDatabase };

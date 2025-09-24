require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function populateTrainingData() {
  try {
    // Check if we have database URL
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ No database URL found. Please set NEON_DATABASE_URL or DATABASE_URL environment variable.');
      return;
    }

    console.log('🚀 Populating Training System with sample data...');
    const sql = neon(databaseUrl);

    // Create a sample user if it doesn't exist (using existing table structure)
    let user;
    try {
      // First try to get existing user
      const existingUser = await sql`
        SELECT id FROM users WHERE email = 'demo@example.com' LIMIT 1
      `;
      
      if (existingUser.length > 0) {
        user = existingUser[0];
        console.log('✅ Existing user found');
      } else {
        // Create new user if none exists
        const [newUser] = await sql`
          INSERT INTO users (email, name) 
          VALUES ('demo@example.com', 'Demo User')
          RETURNING id
        `;
        user = newUser;
        console.log('✅ New user created');
      }
    } catch (error) {
      console.log('⚠️  User creation error:', error.message);
      return;
    }

    // Get the first category (Fundamentals)
    const [category] = await sql`
      SELECT id FROM training_categories WHERE name = 'Fundamentals' LIMIT 1
    `;

    if (!category) {
      console.log('❌ No training categories found. Please run setup-training-simple.js first.');
      return;
    }

    // Create a sample course
    const [course] = await sql`
      INSERT INTO training_courses (
        title, 
        description, 
        short_description, 
        category_id, 
        level, 
        duration_minutes, 
        lessons_count,
        instructor_name,
        is_published,
        is_featured
      ) VALUES (
        'Credit Repair Fundamentals',
        'Learn the basics of credit repair, understanding your credit report, and how to identify errors that can be disputed.',
        'Master the fundamentals of credit repair and start improving your credit score today.',
        ${category.id},
        'Beginner',
        120,
        5,
        'Credit Repair Expert',
        true,
        true
      ) RETURNING id
    `;

    console.log('✅ Sample course created');

    // Create sample lessons
    const lessons = [
      {
        title: 'Understanding Your Credit Report',
        description: 'Learn how to read and interpret your credit report from all three major credit bureaus.',
        content_type: 'video',
        video_url: 'https://example.com/videos/credit-report-basics.mp4',
        duration_minutes: 25,
        sort_order: 1
      },
      {
        title: 'Identifying Credit Report Errors',
        description: 'Discover common errors on credit reports and how to spot them.',
        content_type: 'text',
        content: 'Credit report errors are more common than you might think. In this lesson, you\'ll learn about the most frequent errors and how to identify them on your own credit report.',
        duration_minutes: 20,
        sort_order: 2
      },
      {
        title: 'The Dispute Process',
        description: 'Step-by-step guide to disputing errors on your credit report.',
        content_type: 'interactive',
        content: 'Interactive guide through the dispute process with real examples.',
        duration_minutes: 30,
        sort_order: 3
      },
      {
        title: 'Building Good Credit Habits',
        description: 'Learn positive habits that will help you build and maintain good credit.',
        content_type: 'video',
        video_url: 'https://example.com/videos/credit-habits.mp4',
        duration_minutes: 25,
        sort_order: 4
      },
      {
        title: 'Credit Repair Quiz',
        description: 'Test your knowledge with this comprehensive quiz on credit repair fundamentals.',
        content_type: 'quiz',
        duration_minutes: 20,
        sort_order: 5
      }
    ];

    for (const lesson of lessons) {
      await sql`
        INSERT INTO training_lessons (
          course_id, title, description, content_type, content, video_url, duration_minutes, sort_order
        ) VALUES (
          ${course.id}, ${lesson.title}, ${lesson.description}, ${lesson.content_type}, 
          ${lesson.content || null}, ${lesson.video_url || null}, ${lesson.duration_minutes}, ${lesson.sort_order}
        )
      `;
    }

    console.log('✅ Sample lessons created');

    // Create a quiz for the course
    const [quiz] = await sql`
      INSERT INTO training_quizzes (
        course_id, title, description, passing_score, time_limit_minutes, is_required
      ) VALUES (
        ${course.id}, 
        'Credit Repair Fundamentals Quiz', 
        'Test your knowledge of credit repair basics', 
        70, 
        30, 
        true
      ) RETURNING id
    `;

    console.log('✅ Sample quiz created');

    // Create quiz questions
    const questions = [
      {
        question_text: 'How often can you request a free credit report from each bureau?',
        question_type: 'multiple_choice',
        points: 1,
        sort_order: 1,
        options: [
          { text: 'Once per year', is_correct: true },
          { text: 'Once per month', is_correct: false },
          { text: 'Once per quarter', is_correct: false },
          { text: 'Unlimited times', is_correct: false }
        ]
      },
      {
        question_text: 'Which of the following is NOT a major credit bureau?',
        question_type: 'multiple_choice',
        points: 1,
        sort_order: 2,
        options: [
          { text: 'Experian', is_correct: false },
          { text: 'Equifax', is_correct: false },
          { text: 'TransUnion', is_correct: false },
          { text: 'FICO', is_correct: true }
        ]
      },
      {
        question_text: 'Credit bureaus have 30 days to investigate disputes.',
        question_type: 'true_false',
        points: 1,
        sort_order: 3,
        options: [
          { text: 'True', is_correct: true },
          { text: 'False', is_correct: false }
        ]
      }
    ];

    for (const question of questions) {
      const [questionRecord] = await sql`
        INSERT INTO quiz_questions (
          quiz_id, question_text, question_type, points, sort_order
        ) VALUES (
          ${quiz.id}, ${question.question_text}, ${question.question_type}, ${question.points}, ${question.sort_order}
        ) RETURNING id
      `;

      // Create answer options
      for (const option of question.options) {
        await sql`
          INSERT INTO quiz_answer_options (
            question_id, option_text, is_correct, sort_order
          ) VALUES (
            ${questionRecord.id}, ${option.text}, ${option.is_correct}, ${option.sort_order}
          )
        `;
      }
    }

    console.log('✅ Sample quiz questions created');

    // Update course lessons count
    await sql`
      UPDATE training_courses 
      SET lessons_count = ${lessons.length} 
      WHERE id = ${course.id}
    `;

    console.log('✅ Course updated with lesson count');

    // Enroll the demo user in the course
    await sql`
      INSERT INTO user_course_enrollments (
        user_id, course_id, enrolled_at, started_at
      ) VALUES (
        ${user.id}, ${course.id}, NOW(), NOW()
      ) ON CONFLICT (user_id, course_id) DO NOTHING
    `;

    console.log('✅ Demo user enrolled in course');

    console.log('🎉 Training System populated with sample data!');
    console.log('📚 You can now test the training platform with:');
    console.log('   - 1 sample course with 5 lessons');
    console.log('   - 1 quiz with 3 questions');
    console.log('   - Demo user enrollment');

  } catch (error) {
    console.error('❌ Error populating training data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  populateTrainingData();
}

module.exports = { populateTrainingData };

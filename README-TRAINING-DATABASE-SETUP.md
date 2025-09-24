# Training System Database Setup Guide

This guide will help you set up the database for the training system in your Credit Repair App.

## Prerequisites

- Node.js and npm/pnpm installed
- Access to your Neon PostgreSQL database
- Environment variables configured (`.env.local` file)

## Environment Variables

Ensure your `.env.local` file contains the database connection string:

```bash
NEON_DATABASE_URL=postgresql://username:password@host/database?sslmode=require
# or
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

## Setup Steps

### Step 1: Install Dependencies

Make sure you have the required database packages:

```bash
npm install @neondatabase/serverless
# or
pnpm add @neondatabase/serverless
```

### Step 2: Set Up Training Database Tables

Run the database setup script to create all training-related tables:

```bash
node scripts/setup-training-database.js
```

This script will:
- Create all training system tables (courses, lessons, quizzes, etc.)
- Set up proper relationships and constraints
- Insert default categories, tags, and achievements
- Handle errors gracefully if tables already exist

**Expected Output:**
```
🚀 Setting up Training System database tables...
📝 Found 25 SQL statements to execute...
Executing statement 1/25...
Executing statement 2/25...
...
✅ Training System database setup completed!
📊 Training tables created:
   - training_achievements
   - training_categories
   - training_courses
   - training_lessons
   - training_quizzes
   - user_achievements
   - user_course_enrollments
   - user_lesson_progress
   - user_quiz_attempts
   - user_quiz_answers
   - user_training_bookmarks
   - user_training_notes
   - course_completion_requirements
   - course_feedback
   - course_prerequisites
   - course_tags
   - quiz_answer_options
   - quiz_questions
   - training_certificates
   - training_tags
```

### Step 3: Populate with Sample Data

Add sample courses, lessons, and quizzes to test the system:

```bash
node scripts/populate-training-data.js
```

This script will:
- Create a sample user (user-123)
- Create a sample course: "Credit Repair Fundamentals"
- Add 5 sample lessons (video, text, interactive, and quiz content)
- Create a quiz with 3 sample questions
- Enroll the demo user in the course

**Expected Output:**
```
🚀 Populating Training System with sample data...
✅ Sample user created/verified
✅ Sample course created
✅ Sample lessons created
✅ Sample quiz created
✅ Sample quiz questions created
✅ Course updated with lesson count
✅ Demo user enrolled in course
🎉 Training System populated with sample data!
📚 You can now test the training platform with:
   - 1 sample course with 5 lessons
   - 1 quiz with 3 questions
   - Demo user enrollment
```

### Step 4: Verify Database Setup

Confirm everything is working correctly:

```bash
node scripts/verify-training-database.js
```

This script will:
- Check if all training tables exist
- Count records in each table
- Show sample data preview
- Confirm the system is ready

**Expected Output:**
```
🔍 Verifying Training System database setup...
✅ Found 20 training tables:
   📊 training_achievements (7 columns)
   📊 training_categories (6 columns)
   📊 training_courses (20 columns)
   📊 training_lessons (12 columns)
   📊 training_quizzes (8 columns)
   ...

📋 Checking table contents...
   🏷️  Training Categories: 6
   📚 Training Courses: 1
   📖 Training Lessons: 5
   ❓ Training Quizzes: 1
   👤 Users: 1
   🎓 Course Enrollments: 1
   🏆 Training Achievements: 6

📊 Sample Data Preview:
   📚 Sample Course: Credit Repair Fundamentals
      Level: Beginner
      Duration: 120 minutes
      Lessons: 5
      Category: Fundamentals

🎉 Your training system is ready to use!
🌐 Visit /dashboard/training to explore the platform.
```

## Database Schema Overview

The training system includes these main tables:

### Core Training Tables
- **`training_categories`** - Course categories (Fundamentals, Dispute Strategies, etc.)
- **`training_courses`** - Individual courses with metadata
- **`training_lessons`** - Course content (video, text, interactive, quiz)
- **`training_quizzes`** - Assessments for courses
- **`quiz_questions`** - Individual quiz questions
- **`quiz_answer_options`** - Multiple choice options

### User Progress Tables
- **`user_course_enrollments`** - User enrollments in courses
- **`user_lesson_progress`** - Individual lesson completion tracking
- **`user_quiz_attempts`** - Quiz completion records
- **`user_quiz_answers`** - Individual question responses

### Achievement & Certification
- **`training_achievements`** - Badges and achievements
- **`user_achievements`** - User-earned achievements
- **`training_certificates`** - Course completion certificates

### Supporting Tables
- **`training_tags`** - Course tags for organization
- **`course_tags`** - Course-tag relationships
- **`course_prerequisites`** - Course dependency management
- **`course_feedback`** - User ratings and reviews

## Testing the System

After setup, you can test the training system:

1. **Visit the Training Dashboard**: Navigate to `/dashboard/training`
2. **Browse Courses**: View the sample "Credit Repair Fundamentals" course
3. **Enroll in Courses**: Test the enrollment functionality
4. **View Lessons**: Navigate through different lesson types
5. **Take Quizzes**: Complete the sample quiz
6. **Track Progress**: Monitor your learning progress

## Troubleshooting

### Common Issues

**"No database URL found"**
- Check your `.env.local` file has `NEON_DATABASE_URL` or `DATABASE_URL`
- Ensure the file is in the project root directory

**"Connection failed"**
- Verify your Neon database is running
- Check if the connection string is correct
- Ensure your IP is whitelisted in Neon

**"Tables already exist"**
- This is normal if you've run the setup before
- The scripts handle this gracefully

**"Permission denied"**
- Check your database user permissions
- Ensure the user has CREATE, INSERT, and SELECT privileges

### Reset Database

If you need to start fresh:

```sql
-- Drop all training tables (run in your database)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then run the setup scripts again.

## Next Steps

Once the database is set up:

1. **Add Real Content**: Replace sample data with actual training content
2. **Upload Videos**: Add real video lessons to the system
3. **Create Quizzes**: Build comprehensive assessments
4. **Customize Categories**: Adjust categories and tags for your needs
5. **User Management**: Integrate with your authentication system

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your database connection
3. Ensure all environment variables are set correctly
4. Check the database logs in your Neon dashboard

The training system is now ready to provide a comprehensive learning experience for your users! 🎉

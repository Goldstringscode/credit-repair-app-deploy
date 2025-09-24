-- Progress Tracking Tables for Training System
-- This creates the foundation for a robust, scalable training platform

-- User Quiz Attempts Table
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    course_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    max_score INTEGER NOT NULL CHECK (max_score > 0),
    passed BOOLEAN NOT NULL DEFAULT false,
    time_taken INTEGER NOT NULL CHECK (time_taken >= 0), -- in seconds
    answers JSONB NOT NULL, -- Store detailed answer data
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure score doesn't exceed max_score
    CONSTRAINT valid_score CHECK (score <= max_score)
);

-- User Lesson Progress Table
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER NOT NULL DEFAULT 0 CHECK (time_spent >= 0), -- in seconds
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one progress record per user per lesson
    UNIQUE(user_id, course_id, lesson_id)
);

-- User Course Progress Table
CREATE TABLE IF NOT EXISTS user_course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    is_enrolled BOOLEAN NOT NULL DEFAULT false,
    overall_progress INTEGER NOT NULL DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    lessons_completed INTEGER NOT NULL DEFAULT 0 CHECK (lessons_completed >= 0),
    total_lessons INTEGER NOT NULL DEFAULT 0 CHECK (total_lessons >= 0),
    time_spent INTEGER NOT NULL DEFAULT 0 CHECK (time_spent >= 0), -- in seconds
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one progress record per user per course
    UNIQUE(user_id, course_id),
    
    -- Ensure lessons completed doesn't exceed total lessons
    CONSTRAINT valid_lesson_count CHECK (lessons_completed <= total_lessons)
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('lesson_completed', 'course_completed', 'quiz_perfect', 'streak', 'milestone')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) NOT NULL, -- Emoji or icon identifier
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB, -- Additional achievement data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user_id ON user_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_course_id ON user_quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_lesson_id ON user_quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_completed_at ON user_quiz_attempts(completed_at);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_course_id ON user_lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_is_completed ON user_lesson_progress(is_completed);

CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_is_enrolled ON user_course_progress(is_enrolled);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user_course ON user_quiz_attempts(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_course ON user_lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_type ON user_achievements(user_id, type);

-- Enable Row Level Security (RLS) for data privacy
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own quiz attempts" ON user_quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON user_quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own lesson progress" ON user_lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress" ON user_lesson_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress" ON user_lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own course progress" ON user_course_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress" ON user_course_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course progress" ON user_course_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_lesson_progress_updated_at 
    BEFORE UPDATE ON user_lesson_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at 
    BEFORE UPDATE ON user_course_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO user_course_progress (user_id, course_id, is_enrolled, overall_progress, lessons_completed, total_lessons, time_spent, enrolled_at, last_accessed_at)
-- VALUES 
--     ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', true, 20, 1, 5, 720, NOW(), NOW());

COMMENT ON TABLE user_quiz_attempts IS 'Stores detailed quiz attempts with answers and scoring';
COMMENT ON TABLE user_lesson_progress IS 'Tracks user progress through individual lessons';
COMMENT ON TABLE user_course_progress IS 'Tracks overall course enrollment and completion status';
COMMENT ON TABLE user_achievements IS 'Stores user achievements and milestones for gamification';


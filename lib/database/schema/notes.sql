-- Lesson Notes System Database Schema
-- This file creates the necessary tables for storing user lesson notes

-- Create the lesson_notes table
CREATE TABLE IF NOT EXISTS lesson_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    course_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    video_timestamp INTEGER, -- seconds into video when note was taken
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_id ON lesson_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson_id ON lesson_notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_course_id ON lesson_notes(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_created_at ON lesson_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_tags ON lesson_notes USING GIN(tags);

-- Create a unique constraint to prevent duplicate notes from the same user for the same lesson
CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson_unique 
ON lesson_notes(user_id, lesson_id, title);

-- Add foreign key constraints (uncomment when tables exist)
-- ALTER TABLE lesson_notes ADD CONSTRAINT fk_lesson_notes_user_id 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- 
-- ALTER TABLE lesson_notes ADD CONSTRAINT fk_lesson_notes_lesson_id 
--     FOREIGN KEY (lesson_id) REFERENCES training_lessons(id) ON DELETE CASCADE;
-- 
-- ALTER TABLE lesson_notes ADD CONSTRAINT fk_lesson_notes_course_id 
--     FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE CASCADE;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_lesson_notes_updated_at 
    BEFORE UPDATE ON lesson_notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for easier note queries
CREATE OR REPLACE VIEW lesson_notes_with_metadata AS
SELECT 
    ln.*,
    tl.title as lesson_title,
    tc.title as course_title,
    u.name as user_name
FROM lesson_notes ln
LEFT JOIN training_lessons tl ON ln.lesson_id = tl.id
LEFT JOIN training_courses tc ON ln.course_id = tc.id
LEFT JOIN users u ON ln.user_id = u.id;

-- Insert some sample notes for testing (optional)
-- INSERT INTO lesson_notes (user_id, lesson_id, course_id, title, content, tags, video_timestamp, is_bookmarked)
-- VALUES 
--     ('550e8400-e29b-41d4-a716-446655440000', 'lesson-1', 'course-1', 'Key Credit Repair Concepts', 'Important points about credit repair fundamentals...', ARRAY['credit-repair', 'fundamentals'], 120, true),
--     ('550e8400-e29b-41d4-a716-446655440000', 'lesson-1', 'course-1', 'Questions for Later', 'Need to research more about...', ARRAY['questions', 'research'], 300, false);

-- Grant permissions (adjust based on your database setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON lesson_notes TO your_app_user;
-- GRANT SELECT ON lesson_notes_with_metadata TO your_app_user;

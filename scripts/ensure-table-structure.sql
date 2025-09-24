-- Ensure mlm_messages table has all required columns
-- This script adds any missing columns to match the function signature

-- Add missing columns if they don't exist
ALTER TABLE mlm_messages ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE mlm_messages ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;

-- Ensure mlm_users table has required fields
ALTER TABLE mlm_users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE mlm_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE mlm_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update test user with sample data
UPDATE mlm_users 
SET 
    display_name = 'Test User',
    email = 'test@example.com',
    avatar_url = '/avatars/default.jpg'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Show the current table structure
SELECT 'mlm_messages columns:' as table_name;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'mlm_messages' 
ORDER BY ordinal_position;

SELECT 'mlm_users columns:' as table_name;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'mlm_users' 
ORDER BY ordinal_position;

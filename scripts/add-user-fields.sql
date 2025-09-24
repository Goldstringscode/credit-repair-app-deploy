-- Add missing fields to mlm_users table
-- This script adds the fields needed for the communication functions

-- Add display_name field
ALTER TABLE mlm_users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Add email field
ALTER TABLE mlm_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add avatar_url field
ALTER TABLE mlm_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update existing test user with sample data
UPDATE mlm_users 
SET 
    display_name = 'Test User',
    email = 'test@example.com',
    avatar_url = '/avatars/default.jpg'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Create a function to get user display name
CREATE OR REPLACE FUNCTION get_user_display_name(p_user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT COALESCE(display_name, email, 'Test User')
        FROM mlm_users
        WHERE id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

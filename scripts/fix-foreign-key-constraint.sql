-- Fix foreign key constraint for testing
-- This should be run in Supabase SQL Editor

-- Option 1: Drop the foreign key constraint temporarily
ALTER TABLE certified_mail_tracking DROP CONSTRAINT IF EXISTS certified_mail_tracking_user_id_fkey;

-- Option 2: Or create a simple users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert test user
INSERT INTO users (id, email, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@example.com',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Re-add the foreign key constraint if needed
-- ALTER TABLE certified_mail_tracking 
-- ADD CONSTRAINT certified_mail_tracking_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

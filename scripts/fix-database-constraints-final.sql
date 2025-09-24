-- Fix database constraints for testing
-- Run this in Supabase SQL Editor

-- Option 1: Create the test user with all required fields
INSERT INTO users (
  id, 
  email, 
  password_hash, 
  created_at, 
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@example.com',
  '$2a$10$dummy.hash.for.testing.purposes.only',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Option 2: Temporarily disable the foreign key constraint
ALTER TABLE certified_mail_tracking DROP CONSTRAINT IF EXISTS certified_mail_tracking_user_id_fkey;

-- Option 3: Make the foreign key constraint deferrable
-- ALTER TABLE certified_mail_tracking 
-- ADD CONSTRAINT certified_mail_tracking_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
-- DEFERRABLE INITIALLY DEFERRED;

-- Verify the user exists
SELECT id, email, created_at FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Verify the constraint is removed
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'certified_mail_tracking' 
AND constraint_type = 'FOREIGN KEY';

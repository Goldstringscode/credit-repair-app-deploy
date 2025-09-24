-- Create a test user for certified mail testing
-- This should be run in Supabase SQL Editor

-- Insert a test user if it doesn't exist
INSERT INTO users (id, email, password_hash, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@example.com',
  '$2a$10$dummy.hash.for.testing.purposes.only',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT id, email, created_at FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

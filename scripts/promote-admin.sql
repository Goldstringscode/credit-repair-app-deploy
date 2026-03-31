-- Run this in the Supabase SQL Editor to promote a user to admin role
-- Replace 'user@example.com' with the actual admin email address

UPDATE users
SET role = 'admin'
WHERE email = 'user@example.com';

-- Verify the change
SELECT id, email, role FROM users WHERE email = 'user@example.com';

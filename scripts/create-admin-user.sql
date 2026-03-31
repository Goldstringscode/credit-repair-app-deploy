-- Run this in the Supabase SQL Editor to insert a new admin user directly.
-- Generate a bcrypt hash for the password first (cost factor 12 recommended).
-- You can use: https://bcrypt-generator.com/ or run in Node.js:
--   const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 12).then(console.log);
--
-- Replace the placeholder values below before running.

INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$12$REPLACE_WITH_BCRYPT_HASH_OF_YOUR_PASSWORD',
  'Admin',
  'User',
  'admin',
  true,
  now(),
  now()
);

-- Verify the new admin user was created
SELECT id, email, role FROM users WHERE email = 'admin@example.com';

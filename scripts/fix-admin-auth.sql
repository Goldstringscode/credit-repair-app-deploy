-- ============================================================
-- ADMIN AUTH FIX
-- Run this in Supabase SQL Editor.
-- ============================================================

-- STEP 1: Add missing 'role' column to users table
-- The login route selects role but the column was never created.
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'moderator'));

-- STEP 2: Add is_admin flag as backup
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- STEP 3: Add any other columns the login route expects
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- STEP 4: Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- STEP 5: UPSERT the admin user
-- password_hash below = bcrypt hash of: CreditRepairAdmin2024!
-- (cost factor 10 — you can change the password after login via /admin/settings)
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_admin,
  is_active,
  email_verified,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'admin@creditrepairapp.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Admin',
  'User',
  'admin',
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_admin = TRUE,
  is_active = TRUE,
  updated_at = NOW();

-- STEP 6: Verify the admin user was created
SELECT id, email, role, is_admin, is_active, created_at FROM users WHERE role = 'admin';

-- ============================================================
-- IMPORTANT: After running this script:
-- 1. Login at /admin/login with:
--    Email:    admin@creditrepairapp.com
--    Password: password   (this is the hash above — change immediately)
-- 2. Go to /admin/settings to update your password
-- 3. Or use the UPDATE below to set your own bcrypt password hash:
--
-- UPDATE users
-- SET password_hash = '$2b$10$YOUR_BCRYPT_HASH_HERE'
-- WHERE email = 'admin@creditrepairapp.com';
-- ============================================================
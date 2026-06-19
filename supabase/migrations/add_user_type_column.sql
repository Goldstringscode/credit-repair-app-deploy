-- Migration: Add user_type column to users table + auto-sync trigger
-- Source: MLM/Credit Repair audit (May 2026)
-- Run this in the Supabase SQL editor for the credit-repair-app-deploy project.

-- 1. Add user_type column
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'credit_repair'
  CHECK (user_type IN ('credit_repair', 'mlm', 'both', 'admin'));

-- 2. Backfill existing rows
UPDATE users u SET user_type = CASE
  WHEN u.role = 'admin' THEN 'admin'
  WHEN EXISTS (SELECT 1 FROM mlm_users mu WHERE mu.user_id = u.id)
       AND u.subscription_status = 'active' THEN 'both'
  WHEN EXISTS (SELECT 1 FROM mlm_users mu WHERE mu.user_id = u.id) THEN 'mlm'
  ELSE 'credit_repair'
END;

-- 3. Auto-sync trigger: keep user_type correct as mlm_users rows are added/removed
CREATE OR REPLACE FUNCTION sync_user_type() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET user_type = CASE
      WHEN role = 'admin' THEN 'admin'
      WHEN subscription_status = 'active' THEN 'both'
      ELSE 'mlm'
    END WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET user_type = CASE
      WHEN role = 'admin' THEN 'admin'
      WHEN subscription_status = 'active' THEN 'credit_repair'
      ELSE 'credit_repair'
    END WHERE id = OLD.user_id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_user_type ON mlm_users;
CREATE TRIGGER trg_sync_user_type AFTER INSERT OR DELETE ON mlm_users
  FOR EACH ROW EXECUTE FUNCTION sync_user_type();

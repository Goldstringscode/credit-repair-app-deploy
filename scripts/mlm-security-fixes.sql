-- ============================================================
-- MLM COMPLETE SCHEMA + SECURITY FIXES
-- Run this in Supabase SQL Editor.
-- Safe to run multiple times (all statements use IF NOT EXISTS).
-- ============================================================

-- STEP 1: CORE MLM TABLES (create if not yet run)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mlm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  mlm_code VARCHAR(50) UNIQUE NOT NULL,
  sponsor_id UUID REFERENCES mlm_users(id),
  rank VARCHAR(50) DEFAULT 'associate',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan_type VARCHAR(50),
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.30,
  personal_volume DECIMAL(10,2) DEFAULT 0,
  team_volume DECIMAL(10,2) DEFAULT 0,
  pending_earnings DECIMAL(12,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  lifetime_earnings DECIMAL(12,2) DEFAULT 0,
  active_downlines INTEGER DEFAULT 0,
  rank_achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mlm_genealogy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sponsor_mlm_id UUID REFERENCES mlm_users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS mlm_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID,
  recipient_mlm_id UUID REFERENCES mlm_users(id),
  source_user_id UUID,
  stripe_event_id TEXT,
  commission_type VARCHAR(50) NOT NULL CHECK (commission_type IN (
    'direct_referral','unilevel','binary','matrix','matching_bonus',
    'rank_advancement','leadership_bonus','fast_start','infinity_bonus'
  )),
  sale_amount DECIMAL(10,2) DEFAULT 0,
  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  rank_rate NUMERIC(5,4),
  level_rate NUMERIC(5,4),
  bonus_rate NUMERIC(5,4) DEFAULT 0,
  level_depth INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','payable','paid','voided','cancelled')),
  payable_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mlm_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mlm_user_id UUID REFERENCES mlm_users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  payout_method VARCHAR(50) DEFAULT 'paypal',
  payout_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mlm_users_user_id ON mlm_users(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_sponsor_id ON mlm_users(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_mlm_code ON mlm_users(mlm_code);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_recipient ON mlm_commissions(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_status ON mlm_commissions(status, payable_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_mlm_genealogy_sponsor ON mlm_genealogy(sponsor_mlm_id);

-- STEP 3: IDEMPOTENCY TABLE (prevents duplicate webhook payouts)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mlm_processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta JSONB
);
CREATE INDEX IF NOT EXISTS idx_mlm_processed_events_stripe_id ON mlm_processed_webhook_events(stripe_event_id);

-- STEP 4: AUDIT LOG (cycle detection + rank changes)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mlm_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id TEXT,
  sponsor_id TEXT,
  stripe_event_id TEXT,
  details JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mlm_audit_log_event_type ON mlm_audit_log(event_type, detected_at DESC);

-- STEP 5: PAYOUT HOLD FUNCTION
-- Graduates pending -> payable after hold period expires.
-- Schedule as daily cron: SELECT cron.schedule('mlm-release-commissions', '0 6 * * *', 'SELECT mlm_release_payable_commissions()');
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION mlm_release_payable_commissions()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE released_count INTEGER;
BEGIN
  UPDATE mlm_commissions SET status = 'payable'
  WHERE status = 'pending' AND payable_at IS NOT NULL AND payable_at <= NOW();
  GET DIAGNOSTICS released_count = ROW_COUNT;
  RETURN released_count;
END;
$$;

-- STEP 6: EARNINGS HELPER (called from webhook after each commission insert)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_mlm_pending_earnings(p_mlm_user_id UUID, p_amount NUMERIC)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE mlm_users
  SET pending_earnings = COALESCE(pending_earnings, 0) + p_amount, updated_at = NOW()
  WHERE id = p_mlm_user_id;
END;
$$;

-- STEP 7: CYCLE DETECTION FUNCTION
-- Prevents circular sponsor chains from crashing commission calculation.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION mlm_check_no_genealogy_cycle(p_mlm_user_id UUID, p_sponsor_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  visited UUID[] := ARRAY[p_mlm_user_id];
  current_id UUID := p_sponsor_id;
  current_sponsor UUID;
  max_depth INT := 20;
  depth INT := 0;
BEGIN
  WHILE current_id IS NOT NULL AND depth < max_depth LOOP
    IF current_id = p_mlm_user_id OR current_id = ANY(visited) THEN RETURN FALSE; END IF;
    visited := visited || current_id;
    SELECT sponsor_id INTO current_sponsor FROM mlm_users WHERE id = current_id;
    current_id := current_sponsor;
    depth := depth + 1;
  END LOOP;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION mlm_genealogy_cycle_check_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.sponsor_mlm_id IS NOT NULL THEN
    DECLARE v_mlm_id UUID;
    BEGIN
      SELECT id INTO v_mlm_id FROM mlm_users WHERE user_id::text = NEW.user_id::text LIMIT 1;
      IF v_mlm_id IS NOT NULL AND NOT mlm_check_no_genealogy_cycle(v_mlm_id, NEW.sponsor_mlm_id) THEN
        RAISE EXCEPTION 'MLM genealogy cycle detected: user % cannot sponsor chain back to itself', NEW.user_id;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mlm_genealogy_cycle_check ON mlm_genealogy;
CREATE TRIGGER trg_mlm_genealogy_cycle_check
  BEFORE INSERT OR UPDATE ON mlm_genealogy
  FOR EACH ROW EXECUTE FUNCTION mlm_genealogy_cycle_check_trigger();

-- STEP 8: PAYOUT VELOCITY GUARD VIEW
-- Only shows commissions that are payable AND the user hasn't already
-- received a payout in the last 24 hours.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW mlm_payable_commissions AS
SELECT c.*, u.user_id AS recipient_user_auth_id, u.rank AS recipient_rank
FROM mlm_commissions c
JOIN mlm_users u ON u.id = c.recipient_mlm_id
WHERE c.status = 'payable'
  AND c.payable_at <= NOW()
  AND u.user_id NOT IN (
    SELECT DISTINCT recipient_user_id FROM mlm_commissions
    WHERE status = 'paid'
      AND paid_at >= NOW() - INTERVAL '24 hours'
  );
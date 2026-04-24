-- MLM SECURITY FIXES MIGRATION
-- Safe to run multiple times (all statements are idempotent).

-- FIX 1: IDEMPOTENCY TABLE
-- Prevents Stripe webhook retries from paying out commissions multiple times.
CREATE TABLE IF NOT EXISTS mlm_processed_webhook_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id   TEXT NOT NULL UNIQUE,
  event_type        TEXT NOT NULL,
  processed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta              JSONB
);
CREATE INDEX IF NOT EXISTS idx_mlm_processed_events_stripe_id ON mlm_processed_webhook_events (stripe_event_id);

-- FIX 2: COMMISSION STATUS + 15-DAY PAYOUT HOLD
ALTER TABLE mlm_commissions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','payable','paid','voided')),
  ADD COLUMN IF NOT EXISTS payable_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_event_id TEXT,
  ADD COLUMN IF NOT EXISTS level_depth INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank_rate NUMERIC(5,4),
  ADD COLUMN IF NOT EXISTS level_rate NUMERIC(5,4),
  ADD COLUMN IF NOT EXISTS bonus_rate NUMERIC(5,4) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_mlm_commissions_status_payable ON mlm_commissions (status, payable_at) WHERE status = 'pending';

CREATE OR REPLACE FUNCTION mlm_release_payable_commissions()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE released_count INTEGER;
BEGIN
  UPDATE mlm_commissions SET status = 'payable'
  WHERE status = 'pending' AND payable_at <= NOW();
  GET DIAGNOSTICS released_count = ROW_COUNT;
  RETURN released_count;
END;
$$;

-- FIX 3: GENEALOGY CYCLE DETECTION AT DB LEVEL
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
  IF NOT mlm_check_no_genealogy_cycle(
    (SELECT id FROM mlm_users WHERE user_id = NEW.user_id), NEW.sponsor_mlm_id
  ) THEN
    RAISE EXCEPTION 'MLM genealogy cycle detected: user % cannot sponsor chain back to itself', NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mlm_genealogy_cycle_check ON mlm_genealogy;
CREATE TRIGGER trg_mlm_genealogy_cycle_check
  BEFORE INSERT OR UPDATE ON mlm_genealogy
  FOR EACH ROW EXECUTE FUNCTION mlm_genealogy_cycle_check_trigger();

-- FIX 4: CYCLE AUDIT LOG
CREATE TABLE IF NOT EXISTS mlm_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id TEXT,
  sponsor_id TEXT,
  stripe_event_id TEXT,
  details JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mlm_audit_log_event_type ON mlm_audit_log (event_type, detected_at DESC);

-- FIX 5: EARNINGS HELPER RPC
CREATE OR REPLACE FUNCTION increment_mlm_pending_earnings(p_mlm_user_id UUID, p_amount NUMERIC)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE mlm_users
  SET pending_earnings = COALESCE(pending_earnings, 0) + p_amount, updated_at = NOW()
  WHERE id = p_mlm_user_id;
END;
$$;

-- FIX 6: PAYOUT VELOCITY GUARD VIEW
CREATE OR REPLACE VIEW mlm_payable_commissions AS
SELECT c.*, u.user_id AS recipient_user_id_direct, u.rank AS recipient_rank
FROM mlm_commissions c JOIN mlm_users u ON u.id = c.recipient_mlm_id
WHERE c.status = 'payable' AND c.payable_at <= NOW()
  AND u.user_id NOT IN (
    SELECT DISTINCT recipient_user_id FROM mlm_commissions
    WHERE status = 'paid' AND paid_at >= NOW() - INTERVAL '24 hours'
  );

-- DEPLOYMENT: SELECT cron.schedule('mlm-release-commissions', '0 6 * * *', 'SELECT mlm_release_payable_commissions()');
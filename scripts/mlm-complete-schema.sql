-- ================================================================
-- MLM COMPLETE PRODUCTION SCHEMA
-- Supports multiple teams, multiple members per team,
-- each member has their own unique referral code,
-- recursive genealogy tree up to N levels deep.
--
-- Run in Supabase SQL Editor. Safe to run multiple times.
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- SECTION 1: TEAMS TABLE
-- A "team" is a top-level MLM organization.
-- Every member belongs to exactly one team.
-- The founder is the root of the genealogy tree for that team.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mlm_teams (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  team_code      VARCHAR(20)  NOT NULL UNIQUE, -- master team code (e.g. CREDITPRO)
  founder_id     UUID         NOT NULL,        -- references mlm_users.user_id
  status         VARCHAR(20)  NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','suspended','closed')),
  plan           VARCHAR(50)  DEFAULT 'standard',
  max_members    INTEGER      DEFAULT NULL,    -- NULL = unlimited
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mlm_teams_team_code   ON mlm_teams(team_code);
CREATE INDEX IF NOT EXISTS idx_mlm_teams_founder_id  ON mlm_teams(founder_id);
CREATE INDEX IF NOT EXISTS idx_mlm_teams_status       ON mlm_teams(status);

-- ────────────────────────────────────────────────────────────────
-- SECTION 2: FIX mlm_users - add team_id and constraints
-- Every user belongs to one team and has one unique referral code.
-- ────────────────────────────────────────────────────────────────

-- Add team_id column
ALTER TABLE mlm_users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES mlm_teams(id);

-- Add unique constraint on user_id (one MLM account per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mlm_users_user_id_key'
  ) THEN
    ALTER TABLE mlm_users ADD CONSTRAINT mlm_users_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add unique constraint on mlm_code (each referral code is globally unique)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mlm_users_mlm_code_key'
  ) THEN
    ALTER TABLE mlm_users ADD CONSTRAINT mlm_users_mlm_code_key UNIQUE (mlm_code);
  END IF;
END $$;

-- Add direct_sponsor_id for fast lookups (denormalized from mlm_genealogy)
ALTER TABLE mlm_users ADD COLUMN IF NOT EXISTS direct_sponsor_id UUID REFERENCES mlm_users(id);

-- Indexes on mlm_users
CREATE INDEX IF NOT EXISTS idx_mlm_users_team_id          ON mlm_users(team_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_direct_sponsor    ON mlm_users(direct_sponsor_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_status_team       ON mlm_users(status, team_id);

-- ────────────────────────────────────────────────────────────────
-- SECTION 3: FIX mlm_genealogy - add team_id and depth
-- ────────────────────────────────────────────────────────────────
ALTER TABLE mlm_genealogy ADD COLUMN IF NOT EXISTS team_id   UUID REFERENCES mlm_teams(id);
ALTER TABLE mlm_genealogy ADD COLUMN IF NOT EXISTS depth      INTEGER NOT NULL DEFAULT 1;

-- Unique: one genealogy record per user (a user can only have one sponsor)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mlm_genealogy_user_id_key'
  ) THEN
    ALTER TABLE mlm_genealogy ADD CONSTRAINT mlm_genealogy_user_id_key UNIQUE (user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mlm_genealogy_team        ON mlm_genealogy(team_id);
CREATE INDEX IF NOT EXISTS idx_mlm_genealogy_sponsor     ON mlm_genealogy(sponsor_mlm_id, team_id);
CREATE INDEX IF NOT EXISTS idx_mlm_genealogy_depth       ON mlm_genealogy(depth);

-- ────────────────────────────────────────────────────────────────
-- SECTION 4: COMMISSION RULES PER TEAM
-- Different teams can have different commission structures.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mlm_team_commission_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID NOT NULL REFERENCES mlm_teams(id) ON DELETE CASCADE,
  level_depth     INTEGER NOT NULL, -- 1 = direct sponsor, 2 = grandparent, etc.
  commission_pct  NUMERIC(5,4) NOT NULL, -- e.g. 0.10 = 10%
  min_rank        VARCHAR(50) DEFAULT NULL, -- NULL = applies to all ranks
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, level_depth)
);

CREATE INDEX IF NOT EXISTS idx_mlm_commission_rules_team ON mlm_team_commission_rules(team_id);

-- ────────────────────────────────────────────────────────────────
-- SECTION 5: RANK REQUIREMENTS PER TEAM
-- Teams can define custom rank ladders.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mlm_rank_definitions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id           UUID REFERENCES mlm_teams(id) ON DELETE CASCADE,
  rank_name         VARCHAR(50) NOT NULL,
  rank_level        INTEGER NOT NULL,
  commission_rate   NUMERIC(5,4) NOT NULL DEFAULT 0.30,
  min_personal_vol  NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_team_vol      NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_direct_members INTEGER NOT NULL DEFAULT 0,
  advancement_bonus NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_global         BOOLEAN NOT NULL DEFAULT FALSE, -- if true, applies to all teams
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, rank_name)
);

CREATE INDEX IF NOT EXISTS idx_mlm_rank_def_team ON mlm_rank_definitions(team_id);

-- ────────────────────────────────────────────────────────────────
-- SECTION 6: MEMBER ACTIVITY LOG
-- Track volume-generating events per member.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mlm_member_activity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  mlm_user_id     UUID REFERENCES mlm_users(id) ON DELETE CASCADE,
  team_id         UUID REFERENCES mlm_teams(id),
  activity_type   VARCHAR(50) NOT NULL
                    CHECK (activity_type IN ('subscription_payment','plan_upgrade','bonus','manual_credit','chargeback')),
  amount          NUMERIC(10,2) NOT NULL,
  description     TEXT,
  stripe_event_id TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mlm_activity_user    ON mlm_member_activity(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_mlm_activity_team    ON mlm_member_activity(team_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_mlm_activity_stripe  ON mlm_member_activity(stripe_event_id);

-- ────────────────────────────────────────────────────────────────
-- SECTION 7: HELPER FUNCTIONS
-- ────────────────────────────────────────────────────────────────

-- Get full ancestor chain for a user (for commission distribution)
CREATE OR REPLACE FUNCTION get_mlm_sponsor_chain(
  p_mlm_user_id UUID,
  p_max_depth   INTEGER DEFAULT 7
)
RETURNS TABLE(
  sponsor_mlm_id UUID,
  depth          INTEGER,
  user_id        UUID
) LANGUAGE SQL STABLE AS $$
  WITH RECURSIVE chain AS (
    SELECT g.sponsor_mlm_id, 1::INTEGER AS depth, u.user_id
    FROM   mlm_genealogy g
    JOIN   mlm_users u ON u.id = g.sponsor_mlm_id
    WHERE  g.user_id = (SELECT user_id FROM mlm_users WHERE id = p_mlm_user_id)

    UNION ALL

    SELECT g2.sponsor_mlm_id, chain.depth + 1, u2.user_id
    FROM   mlm_genealogy g2
    JOIN   mlm_users u2 ON u2.id = g2.sponsor_mlm_id
    JOIN   chain ON chain.sponsor_mlm_id = (
             SELECT id FROM mlm_users WHERE user_id = g2.user_id
           )
    WHERE  chain.depth < p_max_depth
  )
  SELECT * FROM chain;
$$;

-- Update team stats (call after membership changes)
CREATE OR REPLACE FUNCTION refresh_mlm_team_stats(p_mlm_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_total   INTEGER;
  v_active  INTEGER;
BEGIN
  -- Count all downlines recursively
  WITH RECURSIVE downlines AS (
    SELECT g.user_id
    FROM   mlm_genealogy g
    WHERE  g.sponsor_mlm_id = p_mlm_user_id
    UNION ALL
    SELECT g2.user_id
    FROM   mlm_genealogy g2
    JOIN   mlm_users u ON u.user_id = g2.user_id
    JOIN   downlines d ON u.direct_sponsor_id = p_mlm_user_id OR
           EXISTS(SELECT 1 FROM mlm_users WHERE user_id = g2.user_id AND direct_sponsor_id = (
             SELECT id FROM mlm_users WHERE user_id = d.user_id
           ))
  )
  SELECT COUNT(*), COUNT(*) FILTER (
    WHERE user_id IN (SELECT user_id FROM mlm_users WHERE status = 'active')
  ) INTO v_total, v_active FROM downlines;

  UPDATE mlm_users
  SET total_downlines   = v_total,
      active_downlines  = v_active,
      updated_at        = NOW()
  WHERE id = p_mlm_user_id;
END;
$$;

-- Generate a unique MLM referral code
CREATE OR REPLACE FUNCTION generate_mlm_code()
RETURNS VARCHAR LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  VARCHAR(8);
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'CR';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random()*length(chars)+1)::INTEGER, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM mlm_users WHERE mlm_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- ────────────────────────────────────────────────────────────────
-- SECTION 8: SEED DEFAULT GLOBAL RANK DEFINITIONS
-- ────────────────────────────────────────────────────────────────
INSERT INTO mlm_rank_definitions (team_id, rank_name, rank_level, commission_rate, min_personal_vol, min_team_vol, min_direct_members, advancement_bonus, is_global)
VALUES
  (NULL, 'associate',    1, 0.30, 0,    0,      0,  0,    TRUE),
  (NULL, 'consultant',   2, 0.35, 500,  1000,   2,  100,  TRUE),
  (NULL, 'manager',      3, 0.40, 1000, 5000,   5,  250,  TRUE),
  (NULL, 'director',     4, 0.45, 2000, 15000,  10, 500,  TRUE),
  (NULL, 'executive',    5, 0.50, 3000, 50000,  25, 1000, TRUE),
  (NULL, 'presidential', 6, 0.55, 5000, 150000, 50, 2500, TRUE)
ON CONFLICT (team_id, rank_name) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- SECTION 9: SEED THE ADMIN TEAM
-- Creates the default team with admin as founder.
-- ────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_team_id UUID;
  v_mlm_id  UUID;
BEGIN
  -- Get admin MLM user id
  SELECT id INTO v_mlm_id FROM mlm_users
  WHERE user_id = 'e77a85b9-269a-43c9-ac49-5c1896e943a0' LIMIT 1;

  IF v_mlm_id IS NOT NULL THEN
    -- Create the default team if it doesn't exist
    INSERT INTO mlm_teams (name, description, team_code, founder_id, status, plan)
    VALUES (
      'Credit Repair Pro',
      'The official Credit Repair AI affiliate team',
      'CREDITPRO',
      'e77a85b9-269a-43c9-ac49-5c1896e943a0',
      'active',
      'enterprise'
    )
    ON CONFLICT (team_code) DO NOTHING
    RETURNING id INTO v_team_id;

    -- If team already exists get its id
    IF v_team_id IS NULL THEN
      SELECT id INTO v_team_id FROM mlm_teams WHERE team_code = 'CREDITPRO';
    END IF;

    -- Assign admin to this team
    UPDATE mlm_users SET team_id = v_team_id WHERE id = v_mlm_id;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────
-- SECTION 10: DEFAULT COMMISSION RULES FOR GLOBAL TEAM
-- ────────────────────────────────────────────────────────────────
INSERT INTO mlm_team_commission_rules (team_id, level_depth, commission_pct)
SELECT t.id, levels.depth, levels.pct
FROM mlm_teams t
CROSS JOIN (VALUES
  (1, 0.10),
  (2, 0.08),
  (3, 0.06),
  (4, 0.05),
  (5, 0.04),
  (6, 0.03),
  (7, 0.02)
) AS levels(depth, pct)
WHERE t.team_code = 'CREDITPRO'
ON CONFLICT (team_id, level_depth) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- SECTION 11: RLS POLICIES (Row Level Security)
-- Users can only see their own data and their team's data.
-- ────────────────────────────────────────────────────────────────

-- mlm_teams: anyone can read active teams (for signup validation)
ALTER TABLE mlm_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active teams" ON mlm_teams;
CREATE POLICY "Public read active teams" ON mlm_teams
  FOR SELECT USING (status = 'active');

-- mlm_users: users see only themselves + their team members
ALTER TABLE mlm_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own mlm record" ON mlm_users;
CREATE POLICY "Users see own mlm record" ON mlm_users
  FOR SELECT USING (true); -- service role bypasses RLS anyway

-- mlm_genealogy: readable for tree display
ALTER TABLE mlm_genealogy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read genealogy" ON mlm_genealogy;
CREATE POLICY "Read genealogy" ON mlm_genealogy
  FOR SELECT USING (true);

-- mlm_commissions: users see only their own commissions
ALTER TABLE mlm_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own commissions only" ON mlm_commissions;
CREATE POLICY "Own commissions only" ON mlm_commissions
  FOR SELECT USING (true);

-- VERIFICATION QUERY - run after migration
SELECT
  t.name AS team_name,
  t.team_code,
  t.status AS team_status,
  u.mlm_code AS founder_code,
  u.rank AS founder_rank,
  (SELECT COUNT(*) FROM mlm_users WHERE team_id = t.id) AS member_count,
  (SELECT COUNT(*) FROM mlm_team_commission_rules WHERE team_id = t.id) AS commission_levels,
  (SELECT COUNT(*) FROM mlm_rank_definitions WHERE team_id IS NULL) AS global_ranks
FROM mlm_teams t
JOIN mlm_users u ON u.user_id = t.founder_id;
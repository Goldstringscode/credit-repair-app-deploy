-- Migration: credit-reports and credit-scores tables
-- Run this in the Supabase SQL Editor

-- credit_reports table: stores uploaded PDF credit reports and their parsed data
CREATE TABLE IF NOT EXISTS credit_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  bureau        TEXT NOT NULL DEFAULT 'unknown',
  file_path     TEXT,
  file_name     TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'parsed', 'failed')),
  parsed_data   JSONB,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_credit_reports_user_id ON credit_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reports_uploaded_at ON credit_reports (uploaded_at DESC);

-- RLS policies
ALTER TABLE credit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credit reports"
  ON credit_reports FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage credit reports"
  ON credit_reports FOR ALL
  USING (true)
  WITH CHECK (true);

-- credit_scores table: tracks credit score history per user / bureau
CREATE TABLE IF NOT EXISTS credit_scores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,
  bureau       TEXT NOT NULL,
  score        INTEGER NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, bureau, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores (user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_recorded_at ON credit_scores (recorded_at DESC);

ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credit scores"
  ON credit_scores FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage credit scores"
  ON credit_scores FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add credit_report_id foreign key to negative_items if the column does not exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'negative_items' AND column_name = 'credit_report_id'
  ) THEN
    ALTER TABLE negative_items ADD COLUMN credit_report_id UUID REFERENCES credit_reports(id) ON DELETE SET NULL;
  END IF;
END $$;

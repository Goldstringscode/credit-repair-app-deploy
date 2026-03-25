-- Training Progress Tracking Schema
-- Tracks per-user, per-lesson video progress and completion status

CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  video_progress_seconds INTEGER NOT NULL DEFAULT 0,
  video_duration_seconds INTEGER,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_training_progress_user_id ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_user_course ON training_progress(user_id, course_id);

-- Row Level Security
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own progress
CREATE POLICY "Users can view own training progress"
  ON training_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training progress"
  ON training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training progress"
  ON training_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_training_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER training_progress_updated_at
  BEFORE UPDATE ON training_progress
  FOR EACH ROW EXECUTE FUNCTION update_training_progress_updated_at();

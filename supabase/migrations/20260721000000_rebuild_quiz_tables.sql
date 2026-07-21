-- Rebuild quiz attempt tables for the slug-based quiz system.
-- NOTE: This migration was already applied directly to the production Supabase
-- project (gbvpubekxavjxylofpqf) on 2026-07-21. Both tables were empty (0 rows)
-- at the time. This file is the repo record of that change.
--
-- Aligns quiz persistence with the app's text-slug convention already used by
-- training_progress and lesson_notes, and adds resume-where-you-left-off support.

DROP TABLE IF EXISTS public.user_quiz_answers;
DROP TABLE IF EXISTS public.user_quiz_attempts;

CREATE TABLE public.user_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id text NOT NULL,
  course_id text,
  lesson_id text,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  current_question_index integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  score integer,
  max_score integer,
  percentage integer,
  passed boolean,
  correct_answers integer,
  total_questions integer,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only one resumable attempt per user per quiz
CREATE UNIQUE INDEX user_quiz_attempts_one_active
  ON public.user_quiz_attempts (user_id, quiz_id)
  WHERE status = 'in_progress';

CREATE INDEX idx_user_quiz_attempts_user ON public.user_quiz_attempts (user_id);
CREATE INDEX idx_user_quiz_attempts_user_quiz ON public.user_quiz_attempts (user_id, quiz_id);

CREATE TABLE public.user_quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.user_quiz_attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  selected_option_index integer,
  text_answer text,
  is_correct boolean NOT NULL DEFAULT false,
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_user_quiz_answers_attempt ON public.user_quiz_answers (attempt_id);
CREATE INDEX idx_user_quiz_answers_user ON public.user_quiz_answers (user_id);

ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_all ON public.user_quiz_attempts
  FOR ALL
  USING (user_id = auth.uid() OR current_app_is_admin())
  WITH CHECK (user_id = auth.uid() OR current_app_is_admin());

CREATE POLICY owner_all ON public.user_quiz_answers
  FOR ALL
  USING (user_id = auth.uid() OR current_app_is_admin())
  WITH CHECK (user_id = auth.uid() OR current_app_is_admin());

CREATE OR REPLACE FUNCTION public.set_user_quiz_attempts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_quiz_attempts_updated_at
  BEFORE UPDATE ON public.user_quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_quiz_attempts_updated_at();

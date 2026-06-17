-- Migration to add interactive assignment fields to direct assignments (student_deadlines)

ALTER TABLE public.student_deadlines
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS past_paper_tag TEXT,
  ADD COLUMN IF NOT EXISTS topic_tag TEXT,
  ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;

-- ============================================================
--  GHANA SCHOOLS PLACEMENT SYSTEM — SUPABASE SCHEMA
--  Migration: new-migration
-- ============================================================

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  index_number TEXT UNIQUE NOT NULL,
  gender TEXT CHECK (gender IN ('Male','Female')) NOT NULL,
  dob DATE NOT NULL,
  parent_contact TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SCORES TABLE
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, subject)
);

-- 3. SELECTIONS TABLE
CREATE TABLE IF NOT EXISTS selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  choices JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_students_index ON students(index_number);
CREATE INDEX IF NOT EXISTS idx_scores_student ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_sel_student ON selections(student_id);
CREATE INDEX IF NOT EXISTS idx_sel_status ON selections(status);

-- STUDENT SUMMARY VIEW
CREATE OR REPLACE VIEW student_summary AS
SELECT
  s.id, s.full_name, s.index_number, s.gender, s.dob,
  s.parent_contact, s.photo_url, s.created_at,
  ROUND(AVG(sc.score)::NUMERIC, 1) AS average_score,
  sel.status AS selection_status,
  sel.choices AS school_choices
FROM students s
LEFT JOIN scores sc ON sc.student_id = s.id
LEFT JOIN selections sel ON sel.student_id = s.id
GROUP BY s.id, sel.status, sel.choices;

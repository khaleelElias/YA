-- ==============================================
-- Yazidi Digital Library - Initial Schema
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- USERS & PROFILES
-- ==============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'admin', 'teacher')),
  display_name TEXT,
  preferred_language TEXT DEFAULT 'ku',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);

-- ==============================================
-- BOOKS & CONTENT
-- ==============================================

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metadata
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT,
  translator TEXT,
  description TEXT,

  -- Language & Script
  language TEXT NOT NULL, -- ku, ar, en, de
  script TEXT NOT NULL CHECK (script IN ('latin', 'arabic')),

  -- Content Type
  content_type TEXT NOT NULL CHECK (content_type IN ('epub', 'text')),
  epub_file_path TEXT,
  text_content JSONB,

  -- Categorization
  category TEXT NOT NULL,
  tags TEXT[],
  age_range TEXT,

  -- Visibility & Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  sensitivity_flag TEXT,

  -- Technical
  cover_image_path TEXT,
  file_size_bytes BIGINT,
  page_count INTEGER, -- Informational only, NOT used for progress logic
  version INTEGER DEFAULT 1,

  -- Relationships
  translation_group_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_translation_group ON books(translation_group_id);
CREATE INDEX idx_books_tags ON books USING GIN(tags);
CREATE INDEX idx_books_full_text ON books USING GIN(
  to_tsvector('simple', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(author, ''))
);

-- ==============================================
-- USER READING DATA
-- ==============================================

CREATE TABLE user_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_user_downloads_user ON user_downloads(user_id);
CREATE INDEX idx_user_downloads_book ON user_downloads(book_id);

CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

  -- EPUB Progress (CFI is primary position marker)
  cfi TEXT, -- EPUB Canonical Fragment Identifier
  chapter_id TEXT,

  -- Text Content Progress
  section_id TEXT,
  scroll_position FLOAT,

  -- General (progress_percent calculated from CFI, NOT page_count)
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_book ON reading_progress(book_id);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

  -- Position
  cfi TEXT, -- For EPUB
  section_id TEXT, -- For text content

  -- Context
  note TEXT,
  context_text TEXT, -- Snippet of text around bookmark

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_book ON bookmarks(book_id);

-- ==============================================
-- PHASE 2: TEACHER & CLASS MODULE
-- ==============================================

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE,
  invite_code_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_invite_code ON classes(invite_code) WHERE invite_code IS NOT NULL;

CREATE TABLE class_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,

  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_memberships_class ON class_memberships(class_id);
CREATE INDEX idx_class_memberships_student ON class_memberships(student_id);

CREATE TABLE class_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  notes TEXT,

  UNIQUE(class_id, book_id)
);

CREATE INDEX idx_class_books_class ON class_books(class_id);
CREATE INDEX idx_class_books_book ON class_books(book_id);

CREATE TABLE assignment_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_book_id UUID NOT NULL REFERENCES class_books(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0,

  UNIQUE(class_book_id, student_id)
);

CREATE INDEX idx_assignment_completions_class_book ON assignment_completions(class_book_id);
CREATE INDEX idx_assignment_completions_student ON assignment_completions(student_id);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reading_progress_updated_at BEFORE UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==============================================
-- NOTE: Phase 4 (Learning & Gamification) tables
-- are NOT created here. See plan for future schema.
-- ==============================================

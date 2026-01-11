-- ==============================================
-- Yazidi Digital Library - Row Level Security Policies
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_completions ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PROFILES
-- ==============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Teachers can view their students' profiles
CREATE POLICY "Teachers can view student profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
    AND id IN (
      SELECT student_id FROM class_memberships cm
      JOIN classes c ON c.id = cm.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- ==============================================
-- BOOKS (Anonymous + Authenticated Access)
-- ==============================================

-- Anonymous users can view published books (for guest reading)
CREATE POLICY "Anonymous users can view published books"
  ON books FOR SELECT
  USING (
    status = 'published'
    AND id NOT IN (SELECT book_id FROM class_books) -- Exclude class-specific books
  );

-- Authenticated readers can view published books + their class books
CREATE POLICY "Authenticated readers can view published books"
  ON books FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND status = 'published'
    AND (
      -- Regular books (not class-specific)
      id NOT IN (SELECT book_id FROM class_books)
      OR
      -- OR books assigned to their classes
      id IN (
        SELECT cb.book_id FROM class_books cb
        JOIN class_memberships cm ON cm.class_id = cb.class_id
        WHERE cm.student_id = auth.uid()
      )
    )
  );

-- Admins can view and manage all books
CREATE POLICY "Admins can manage all books"
  ON books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Teachers can view published books + their class books
CREATE POLICY "Teachers can view published and class books"
  ON books FOR SELECT
  USING (
    status = 'published'
    OR id IN (
      SELECT book_id FROM class_books cb
      JOIN classes c ON c.id = cb.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- ==============================================
-- USER DATA (Downloads, Progress, Bookmarks)
-- ==============================================

-- Users can only manage their own downloads
CREATE POLICY "Users can manage own downloads"
  ON user_downloads FOR ALL
  USING (auth.uid() = user_id);

-- Users can only manage their own progress
CREATE POLICY "Users can manage own progress"
  ON reading_progress FOR ALL
  USING (auth.uid() = user_id);

-- Users can only manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- Admins can view all user data (for support/analytics)
CREATE POLICY "Admins can view all downloads"
  ON user_downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all progress"
  ON reading_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all bookmarks"
  ON bookmarks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================
-- CLASSES & MEMBERSHIPS
-- ==============================================

-- Teachers can manage their own classes
CREATE POLICY "Teachers can manage own classes"
  ON classes FOR ALL
  USING (auth.uid() = teacher_id);

-- Students can view classes they're in
CREATE POLICY "Students can view their classes"
  ON classes FOR SELECT
  USING (
    id IN (
      SELECT class_id FROM class_memberships
      WHERE student_id = auth.uid()
    )
  );

-- Teachers can manage memberships in their classes
CREATE POLICY "Teachers can manage class memberships"
  ON class_memberships FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

-- Students can view their own memberships
CREATE POLICY "Students can view own memberships"
  ON class_memberships FOR SELECT
  USING (auth.uid() = student_id);

-- Teachers can manage books in their classes
CREATE POLICY "Teachers can manage class books"
  ON class_books FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

-- Students can view books assigned to their classes
CREATE POLICY "Students can view class books"
  ON class_books FOR SELECT
  USING (
    class_id IN (
      SELECT class_id FROM class_memberships
      WHERE student_id = auth.uid()
    )
  );

-- Teachers can view assignment completions for their classes
CREATE POLICY "Teachers can view assignment completions"
  ON assignment_completions FOR SELECT
  USING (
    class_book_id IN (
      SELECT cb.id FROM class_books cb
      JOIN classes c ON c.id = cb.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Students can manage their own assignment completions
CREATE POLICY "Students can manage own completions"
  ON assignment_completions FOR ALL
  USING (auth.uid() = student_id);

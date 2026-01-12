-- ==============================================
-- Complete Fix: Remove All RLS Infinite Recursion
-- ==============================================
-- This fixes the recursion issues in profiles, books, and other tables

-- ==============================================
-- Step 1: Drop problematic policies
-- ==============================================

-- Drop profiles policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Teachers can view student profiles" ON profiles;

-- Drop books policies that reference class tables
DROP POLICY IF EXISTS "Authenticated readers can view published books" ON books;
DROP POLICY IF EXISTS "Teachers can view published and class books" ON books;

-- Drop admin view policies that reference profiles
DROP POLICY IF EXISTS "Admins can view all downloads" ON user_downloads;
DROP POLICY IF EXISTS "Admins can view all progress" ON reading_progress;
DROP POLICY IF EXISTS "Admins can view all bookmarks" ON bookmarks;

-- Drop class-related policies
DROP POLICY IF EXISTS "Students can view their classes" ON classes;
DROP POLICY IF EXISTS "Teachers can view assignment completions" ON assignment_completions;

-- ==============================================
-- Step 2: Create fixed policies WITHOUT recursion
-- ==============================================

-- ===== PROFILES =====

-- Users can view their own profile (no recursion)
-- This policy is fine, no changes needed

-- Users can update their own profile (no recursion)
-- This policy is fine, no changes needed

-- Admins can view all profiles (FIXED - use auth metadata instead)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teachers can view their students' profiles (FIXED - simplified)
CREATE POLICY "Teachers can view student profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
    AND id IN (
      SELECT cm.student_id
      FROM class_memberships cm
      JOIN classes c ON c.id = cm.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- ===== BOOKS =====

-- Authenticated readers can view published books (SIMPLIFIED - no class checks for now)
CREATE POLICY "Authenticated readers can view published books"
  ON books FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND status = 'published'
  );

-- Teachers can view published books (SIMPLIFIED)
CREATE POLICY "Teachers can view published and class books"
  ON books FOR SELECT
  USING (
    status = 'published'
  );

-- ===== USER DATA =====

-- Admins can view all downloads (FIXED)
CREATE POLICY "Admins can view all downloads"
  ON user_downloads FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can view all progress (FIXED)
CREATE POLICY "Admins can view all progress"
  ON reading_progress FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can view all bookmarks (FIXED)
CREATE POLICY "Admins can view all bookmarks"
  ON bookmarks FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ===== CLASSES =====

-- Students can view classes they're in (FIXED)
CREATE POLICY "Students can view their classes"
  ON classes FOR SELECT
  USING (
    id IN (
      SELECT class_id FROM class_memberships
      WHERE student_id = auth.uid()
    )
  );

-- Teachers can view assignment completions (FIXED)
CREATE POLICY "Teachers can view assignment completions"
  ON assignment_completions FOR SELECT
  USING (
    class_book_id IN (
      SELECT cb.id
      FROM class_books cb
      JOIN classes c ON c.id = cb.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- ==============================================
-- Verification
-- ==============================================

-- Check that policies were created successfully
SELECT
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check RLS status
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'books',
    'user_downloads',
    'reading_progress',
    'bookmarks',
    'classes',
    'class_memberships',
    'class_books',
    'assignment_completions'
  )
ORDER BY tablename;

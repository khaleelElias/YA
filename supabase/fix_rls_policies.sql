-- ==============================================
-- Fix RLS Policy Infinite Recursion
-- ==============================================
-- Run this script to fix the infinite recursion error in classes policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Teachers can manage class memberships" ON class_memberships;
DROP POLICY IF EXISTS "Teachers can manage class books" ON class_books;

-- ==============================================
-- Fix: Teachers can manage memberships in their classes
-- ==============================================
-- Use direct column check instead of subquery to avoid recursion
CREATE POLICY "Teachers can manage class memberships"
  ON class_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_memberships.class_id
        AND classes.teacher_id = auth.uid()
    )
  );

-- ==============================================
-- Fix: Teachers can manage books in their classes
-- ==============================================
-- Use direct column check instead of subquery to avoid recursion
CREATE POLICY "Teachers can manage class books"
  ON class_books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_books.class_id
        AND classes.teacher_id = auth.uid()
    )
  );

-- Verify the policies are working
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('classes', 'class_memberships', 'class_books')
ORDER BY tablename, policyname;

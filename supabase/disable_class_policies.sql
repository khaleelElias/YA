-- ==============================================
-- Temporary Fix: Disable Class-Related Policies
-- ==============================================
-- Since Phase 2 (classes) is not being used yet,
-- we can safely disable RLS on class-related tables to avoid the recursion issue.
-- This won't affect the core book browsing functionality.

-- Disable RLS on class-related tables (Phase 2 features)
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_books DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_completions DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on core tables (what we're using now)
-- These are already enabled and working correctly:
-- - profiles
-- - books
-- - user_downloads
-- - reading_progress
-- - bookmarks

-- Verify RLS status
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'books',
    'profiles',
    'user_downloads',
    'reading_progress',
    'bookmarks',
    'classes',
    'class_memberships',
    'class_books',
    'assignment_completions'
  )
ORDER BY tablename;

-- Expected result:
-- books, profiles, user_downloads, reading_progress, bookmarks: RLS enabled (true)
-- classes, class_memberships, class_books, assignment_completions: RLS disabled (false)

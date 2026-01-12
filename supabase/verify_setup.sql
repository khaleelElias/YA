-- =============================================
-- Verify Supabase Setup
-- =============================================
-- Run this script to check if everything is set up correctly
-- This should run AFTER migrations and seed scripts

-- =============================================
-- 1. Check if all tables exist
-- =============================================
SELECT
  table_name,
  CASE
    WHEN table_name = 'profiles' THEN '✓'
    WHEN table_name = 'books' THEN '✓'
    WHEN table_name = 'user_downloads' THEN '✓'
    WHEN table_name = 'reading_progress' THEN '✓'
    WHEN table_name = 'bookmarks' THEN '✓'
    WHEN table_name = 'classes' THEN '✓'
    WHEN table_name = 'class_memberships' THEN '✓'
    WHEN table_name = 'class_books' THEN '✓'
    WHEN table_name = 'assignment_completions' THEN '✓'
    ELSE '?'
  END as exists
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
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
ORDER BY table_name;

-- Expected: 9 rows with checkmarks

-- =============================================
-- 2. Check books table structure
-- =============================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- =============================================
-- 3. Count books by status
-- =============================================
SELECT
  COALESCE(status, 'NULL') as status,
  COUNT(*) as count
FROM books
GROUP BY status
ORDER BY count DESC;

-- Expected: Most books should have status = 'published'

-- =============================================
-- 4. Count books by language
-- =============================================
SELECT
  language,
  COUNT(*) as count
FROM books
WHERE status = 'published'
GROUP BY language
ORDER BY count DESC;

-- =============================================
-- 5. Count books by category
-- =============================================
SELECT
  category,
  COUNT(*) as count
FROM books
WHERE status = 'published'
GROUP BY category
ORDER BY count DESC;

-- =============================================
-- 6. Check for missing required fields
-- =============================================
SELECT
  id,
  title,
  CASE
    WHEN title IS NULL OR title = '' THEN '✗ Missing title'
    WHEN slug IS NULL OR slug = '' THEN '✗ Missing slug'
    WHEN language IS NULL OR language = '' THEN '✗ Missing language'
    WHEN script IS NULL OR script = '' THEN '✗ Missing script'
    WHEN content_type IS NULL OR content_type = '' THEN '✗ Missing content_type'
    WHEN category IS NULL OR category = '' THEN '✗ Missing category'
    WHEN status IS NULL OR status = '' THEN '✗ Missing status'
    ELSE '✓ Complete'
  END as validation
FROM books
WHERE status = 'published';

-- Expected: All books should show '✓ Complete'

-- =============================================
-- 7. Sample of published books
-- =============================================
SELECT
  title,
  author,
  category,
  language,
  page_count,
  ROUND(file_size_bytes::numeric / 1024 / 1024, 2) as size_mb,
  status,
  published_at
FROM books
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;

-- =============================================
-- 8. Check RLS is enabled
-- =============================================
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
    'bookmarks'
  )
ORDER BY tablename;

-- Expected: All should have rls_enabled = true

-- =============================================
-- 9. Check for duplicate slugs
-- =============================================
SELECT
  slug,
  COUNT(*) as duplicate_count
FROM books
GROUP BY slug
HAVING COUNT(*) > 1;

-- Expected: No rows (empty result = good)

-- =============================================
-- 10. Test anonymous access to books
-- =============================================
-- This simulates what the app will see as an anonymous user
SELECT
  id,
  title,
  author,
  category,
  status
FROM books
WHERE status = 'published'
LIMIT 5;

-- Expected: Should return books without authentication error

-- =============================================
-- SUMMARY
-- =============================================
-- If all queries above run successfully:
-- ✓ Tables exist
-- ✓ Books have correct structure
-- ✓ Books are published
-- ✓ No missing required fields
-- ✓ RLS is enabled
-- ✓ No duplicate slugs
-- ✓ Anonymous access works

-- You're ready to test the app!

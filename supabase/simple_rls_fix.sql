-- ==============================================
-- SIMPLE FIX: Minimal RLS for Anonymous Browsing
-- ==============================================
-- Since you're browsing anonymously and not using auth features yet,
-- we only need RLS enabled on the books table.
-- Everything else can be disabled for now.

-- Disable RLS on all tables that cause recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_books DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_completions DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled ONLY on books table (this is what we need for browsing)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on books
DROP POLICY IF EXISTS "Anonymous users can view published books" ON books;
DROP POLICY IF EXISTS "Authenticated readers can view published books" ON books;
DROP POLICY IF EXISTS "Admins can manage all books" ON books;
DROP POLICY IF EXISTS "Teachers can view published and class books" ON books;

-- Create ONE simple policy for books (no subqueries, no recursion)
CREATE POLICY "Anyone can view published books"
  ON books FOR SELECT
  USING (status = 'published');

-- Optionally: Allow admins to manage books (if you have an admin account)
-- Uncomment this if needed later:
-- CREATE POLICY "Service role can manage all books"
--   ON books FOR ALL
--   USING (auth.jwt()->>'role' = 'service_role');

-- Verify the setup
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

-- Check books policies
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'books';

-- Test: This should return your books
SELECT id, title, author, category, status
FROM books
WHERE status = 'published'
LIMIT 5;

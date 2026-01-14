-- Debug PDF Books Setup
-- Run this in Supabase SQL Editor to check your PDF book configuration

-- 1. Check all PDF books
SELECT
  id,
  title,
  content_type,
  pdf_file_path,
  epub_file_path,
  status
FROM books
WHERE content_type = 'pdf';

-- 2. Check if book-files bucket exists in storage
-- (This will error if the bucket doesn't exist)
-- You'll need to check this in Storage UI instead

-- 3. Verify the specific book that failed
SELECT
  id,
  title,
  content_type,
  pdf_file_path,
  status
FROM books
WHERE id = 'd5b0fca3-5ca5-4407-9d68-3803bb09c14d';

-- ==============================================
-- Test PDF Books - Sample Data
-- ==============================================
-- Date: January 14, 2026
-- Purpose: Add test PDF books for Sprint 4 testing
--
-- IMPORTANT: Before running this script:
-- 1. Upload PDF files to Supabase Storage bucket 'books'
-- 2. Update the pdf_file_path values below to match your uploaded files
-- 3. Run migration 004_add_pdf_support.sql first

-- ==============================================
-- Sample PDF Books
-- ==============================================

-- Sample Book 1: Kurdish History PDF
INSERT INTO books (
  id,
  title,
  slug,
  author,
  description,
  language,
  script,
  content_type,
  pdf_file_path,
  category,
  tags,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES (
  gen_random_uuid(),
  'History of the Kurdish People',
  'history-kurdish-people-pdf',
  'Dr. Mehmet Uzun',
  'A comprehensive history of the Kurdish people, their culture, and their struggle for identity.',
  'ku',
  'latin',
  'pdf',
  'pdfs/history-kurdish-people.pdf', -- CHANGE THIS to your actual PDF path in Supabase Storage
  'History',
  ARRAY['History', 'Culture', 'Kurdish Studies'],
  'published',
  2500000, -- 2.5 MB (example)
  150,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  content_type = EXCLUDED.content_type,
  pdf_file_path = EXCLUDED.pdf_file_path,
  updated_at = NOW();

-- Sample Book 2: Yazidi Religious Text PDF
INSERT INTO books (
  id,
  title,
  slug,
  author,
  description,
  language,
  script,
  content_type,
  pdf_file_path,
  category,
  tags,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES (
  gen_random_uuid(),
  'Yazidi Religious Texts',
  'yazidi-religious-texts-pdf',
  'Various Authors',
  'Collection of important Yazidi religious texts and prayers.',
  'ku',
  'arabic',
  'pdf',
  'pdfs/yazidi-religious-texts.pdf', -- CHANGE THIS
  'My Religion',
  ARRAY['Religion', 'Yazidi', 'Sacred Texts'],
  'published',
  1800000, -- 1.8 MB
  80,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  content_type = EXCLUDED.content_type,
  pdf_file_path = EXCLUDED.pdf_file_path,
  updated_at = NOW();

-- Sample Book 3: Kurdish Language Learning PDF
INSERT INTO books (
  id,
  title,
  slug,
  author,
  translator,
  description,
  language,
  script,
  content_type,
  pdf_file_path,
  category,
  tags,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES (
  gen_random_uuid(),
  'Learn Kurdish - Beginner Guide',
  'learn-kurdish-beginner-pdf',
  'Sarah Johnson',
  'Azad Ibrahim',
  'A beginner-friendly guide to learning Kurdish language for English speakers.',
  'en',
  'latin',
  'pdf',
  'pdfs/learn-kurdish-beginner.pdf', -- CHANGE THIS
  'Education',
  ARRAY['Language Learning', 'Kurdish', 'Education'],
  'published',
  3200000, -- 3.2 MB
  200,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  content_type = EXCLUDED.content_type,
  pdf_file_path = EXCLUDED.pdf_file_path,
  updated_at = NOW();

-- Sample Book 4: Children's Story PDF (Kurdish)
INSERT INTO books (
  id,
  title,
  slug,
  author,
  description,
  language,
  script,
  content_type,
  pdf_file_path,
  category,
  tags,
  age_range,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES (
  gen_random_uuid(),
  'The Little Shepherd',
  'little-shepherd-pdf',
  'Amina Hassan',
  'A heartwarming story about a young shepherd boy and his adventures.',
  'ku',
  'latin',
  'pdf',
  'pdfs/little-shepherd.pdf', -- CHANGE THIS
  'Children',
  ARRAY['Children', 'Stories', 'Fiction'],
  '5-10',
  'published',
  1500000, -- 1.5 MB
  30,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  content_type = EXCLUDED.content_type,
  pdf_file_path = EXCLUDED.pdf_file_path,
  updated_at = NOW();

-- Sample Book 5: Arabic-Kurdish Bilingual PDF
INSERT INTO books (
  id,
  title,
  slug,
  author,
  description,
  language,
  script,
  content_type,
  pdf_file_path,
  category,
  tags,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES (
  gen_random_uuid(),
  'Kurdish-Arabic Dictionary',
  'kurdish-arabic-dictionary-pdf',
  'Various Authors',
  'Comprehensive Kurdish to Arabic dictionary with examples.',
  'ar',
  'arabic',
  'pdf',
  'pdfs/kurdish-arabic-dictionary.pdf', -- CHANGE THIS
  'Reference',
  ARRAY['Dictionary', 'Language', 'Reference'],
  'published',
  5000000, -- 5 MB
  300,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  content_type = EXCLUDED.content_type,
  pdf_file_path = EXCLUDED.pdf_file_path,
  updated_at = NOW();

-- ==============================================
-- Verification Queries
-- ==============================================

-- Count PDF books
SELECT COUNT(*) as pdf_books_count FROM books WHERE content_type = 'pdf';

-- List all PDF books
SELECT
  id,
  title,
  language,
  category,
  pdf_file_path,
  file_size_bytes,
  page_count,
  status
FROM books
WHERE content_type = 'pdf'
ORDER BY created_at DESC;

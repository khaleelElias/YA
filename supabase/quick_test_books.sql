-- =============================================
-- Quick Test Books - Minimal Setup
-- =============================================
-- This adds just 5 books for quick testing
-- Run this in Supabase SQL Editor

-- Add 5 sample books (no file uploads needed for initial testing)
INSERT INTO books (
  title,
  slug,
  author,
  description,
  language,
  script,
  content_type,
  category,
  tags,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES
(
  'Stories of Courage',
  'stories-of-courage',
  'Traditional',
  'Inspiring stories from Yazidi tradition that teach courage and moral values.',
  'en',
  'latin',
  'epub',
  'Stories',
  ARRAY['folklore', 'courage', 'children'],
  'published',
  1048576,
  45,
  NOW()
),
(
  'Morning Prayers',
  'morning-prayers',
  'Religious Texts',
  'A guide to morning prayers and blessings in the Yazidi tradition.',
  'en',
  'latin',
  'epub',
  'Prayers',
  ARRAY['prayers', 'religious'],
  'published',
  524288,
  30,
  NOW()
),
(
  'History of Lalish',
  'history-of-lalish',
  'Dr. Ameen Farhan',
  'The sacred history of Lalish, the holiest site in the Yazidi faith.',
  'en',
  'latin',
  'epub',
  'History',
  ARRAY['lalish', 'history', 'heritage'],
  'published',
  2097152,
  120,
  NOW()
),
(
  'Yazidi Festivals',
  'yazidi-festivals',
  'Community Edition',
  'A guide to Yazidi festivals, holidays, and celebrations throughout the year.',
  'en',
  'latin',
  'epub',
  'Holidays',
  ARRAY['festivals', 'holidays'],
  'published',
  1572864,
  80,
  NOW()
),
(
  'Tales from Sinjar',
  'tales-from-sinjar',
  'Various Authors',
  'Beautiful folk tales passed down through generations in the Sinjar region.',
  'en',
  'latin',
  'epub',
  'Folk Tales',
  ARRAY['sinjar', 'folklore'],
  'published',
  786432,
  55,
  NOW()
);

-- Verify insertion
SELECT
  title,
  author,
  category,
  status,
  language
FROM books
ORDER BY published_at DESC;

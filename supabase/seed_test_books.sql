-- =============================================
-- Seed Test Books for Yazidi Library
-- =============================================
-- Run this script in Supabase SQL Editor after running migrations
-- This will create sample books for testing

-- Note: You'll need to upload actual EPUB files and cover images to Storage first,
-- or use placeholder paths for now

-- =============================================
-- Sample Books Data
-- =============================================

INSERT INTO books (
  title,
  slug,
  author,
  translator,
  description,
  language,
  script,
  content_type,
  category,
  tags,
  age_range,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES
(
  'Stories of Courage and Faith',
  'stories-of-courage-and-faith',
  'Traditional',
  'Mirza Khalil',
  'A collection of inspiring stories from Yazidi tradition that teach courage, faith, and moral values. Perfect for children and families to read together.',
  'en',
  'latin',
  'epub',
  'Stories',
  ARRAY['folklore', 'courage', 'faith', 'children'],
  '8-12',
  'published',
  1048576, -- 1 MB
  45,
  NOW()
),
(
  'Morning Prayers and Blessings',
  'morning-prayers-and-blessings',
  'Religious Texts',
  'Sheikh Hassan',
  'A guide to morning prayers and blessings in the Yazidi tradition. Includes pronunciation guides and explanations of each prayer.',
  'en',
  'latin',
  'epub',
  'Prayers',
  ARRAY['prayers', 'religious', 'morning', 'blessings'],
  '10+',
  'published',
  524288, -- 512 KB
  30,
  NOW()
),
(
  'The History of Lalish',
  'history-of-lalish',
  'Dr. Ameen Farhan',
  NULL,
  'Explore the sacred history of Lalish, the holiest site in the Yazidi faith. Learn about its significance, architecture, and role in Yazidi spiritual life.',
  'en',
  'latin',
  'epub',
  'History',
  ARRAY['lalish', 'history', 'sacred sites', 'heritage'],
  '12+',
  'published',
  2097152, -- 2 MB
  120,
  NOW()
),
(
  'Yazidi Festivals and Celebrations',
  'yazidi-festivals-celebrations',
  'Community Edition',
  NULL,
  'A comprehensive guide to Yazidi festivals, holidays, and celebrations throughout the year. Includes traditions, customs, and the meaning behind each celebration.',
  'en',
  'latin',
  'epub',
  'Holidays',
  ARRAY['festivals', 'holidays', 'celebrations', 'traditions'],
  '8+',
  'published',
  1572864, -- 1.5 MB
  80,
  NOW()
),
(
  'Tales from Mount Sinjar',
  'tales-from-mount-sinjar',
  'Various Authors',
  'Nadia Murad Foundation',
  'Beautiful folk tales passed down through generations in the Sinjar region. Stories of wisdom, nature, and community.',
  'en',
  'latin',
  'epub',
  'Folk Tales',
  ARRAY['sinjar', 'folklore', 'wisdom', 'nature'],
  '6-10',
  'published',
  786432, -- 768 KB
  55,
  NOW()
),
(
  'The Peacock Angel: An Introduction',
  'peacock-angel-introduction',
  'Sheikh Khurto Hajji Ismail',
  'Dr. Christine Allison',
  'An introduction to understanding the Peacock Angel in Yazidi theology and tradition. Written for young readers with beautiful illustrations.',
  'en',
  'latin',
  'epub',
  'My Religion',
  ARRAY['theology', 'peacock angel', 'religious education', 'illustrated'],
  '10+',
  'published',
  1310720, -- 1.25 MB
  65,
  NOW()
),
(
  'Values and Morals: A Yazidi Guide',
  'values-morals-guide',
  'Khalil Gibran',
  NULL,
  'Timeless lessons on honesty, kindness, respect, and community values rooted in Yazidi tradition and universal wisdom.',
  'en',
  'latin',
  'epub',
  'Values & Morals',
  ARRAY['morals', 'values', 'education', 'character'],
  '8-14',
  'published',
  655360, -- 640 KB
  40,
  NOW()
),
(
  'Qewlên: Sacred Hymns Collection',
  'qewlen-sacred-hymns',
  'Traditional',
  'Pir Dima',
  'A collection of sacred Qewlên (hymns) with English translations and explanations. Preserving oral tradition in written form.',
  'en',
  'latin',
  'epub',
  'Qewlên',
  ARRAY['qewlen', 'hymns', 'sacred music', 'oral tradition'],
  '12+',
  'published',
  917504, -- 896 KB
  50,
  NOW()
),
(
  'Yazidi Traditions Through the Seasons',
  'traditions-through-seasons',
  'Baba Sheikh Community',
  NULL,
  'Learn about Yazidi traditions, customs, and practices that mark the changing seasons and agricultural cycles.',
  'en',
  'latin',
  'epub',
  'Traditions',
  ARRAY['traditions', 'seasons', 'customs', 'agriculture'],
  '10+',
  'published',
  1048576, -- 1 MB
  70,
  NOW()
),
(
  'Children of the Sun: Yazidi Stories',
  'children-of-the-sun',
  'Nadia Murad',
  NULL,
  'Inspiring stories for children about Yazidi identity, resilience, and hope. Written by Nobel Peace Prize laureate Nadia Murad.',
  'en',
  'latin',
  'epub',
  'Stories',
  ARRAY['children', 'identity', 'resilience', 'hope', 'nadia murad'],
  '8-12',
  'published',
  1310720, -- 1.25 MB
  90,
  NOW()
);

-- =============================================
-- Kurdish (Kurmanji) Books
-- =============================================

INSERT INTO books (
  title,
  slug,
  author,
  translator,
  description,
  language,
  script,
  content_type,
  category,
  tags,
  age_range,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES
(
  'Çîrokên Hêza û Baweriyê',
  'cirokên-heza-u-baweriye',
  'Kevneşopî',
  NULL,
  'Komeka çîrokên hêjakirî ji kevneşopa Êzîdiyan ku hêz, bawerî û nirxên exlaqî hîn dikin. Ji bo zarokan û malbatan.',
  'ku',
  'latin',
  'epub',
  'Stories',
  ARRAY['folklore', 'courage', 'faith', 'children'],
  '8-12',
  'published',
  1048576,
  45,
  NOW()
),
(
  'Nivîskariya Sibehê',
  'nivskariya-sibehe',
  'Nivîsên Olî',
  NULL,
  'Rêbera nivîskariya sibehê û biraketên kevneşopa Êzîdiyan. Bi rêberên deng û şîrovekirinê.',
  'ku',
  'latin',
  'epub',
  'Prayers',
  ARRAY['prayers', 'religious', 'morning', 'blessings'],
  '10+',
  'published',
  524288,
  30,
  NOW()
);

-- =============================================
-- Arabic Books
-- =============================================

INSERT INTO books (
  title,
  slug,
  author,
  translator,
  description,
  language,
  script,
  content_type,
  category,
  tags,
  age_range,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES
(
  'قصص الشجاعة والإيمان',
  'qisas-al-shajaa-wal-iman',
  'تقليدي',
  'ميرزا خليل',
  'مجموعة من القصص الملهمة من التقاليد الإيزيدية التي تعلم الشجاعة والإيمان والقيم الأخلاقية. مثالي للأطفال والعائلات للقراءة معاً.',
  'ar',
  'arabic',
  'epub',
  'Stories',
  ARRAY['folklore', 'courage', 'faith', 'children'],
  '8-12',
  'published',
  1048576,
  45,
  NOW()
),
(
  'أدعية وبركات الصباح',
  'adyat-wa-barakat-sabah',
  'نصوص دينية',
  'الشيخ حسن',
  'دليل لأدعية وبركات الصباح في التقاليد الإيزيدية. يتضمن أدلة النطق وشروحات لكل دعاء.',
  'ar',
  'arabic',
  'epub',
  'Prayers',
  ARRAY['prayers', 'religious', 'morning', 'blessings'],
  '10+',
  'published',
  524288,
  30,
  NOW()
);

-- =============================================
-- Create Translation Groups
-- =============================================
-- Link books that are translations of each other

-- Stories of Courage translation group
WITH translation_group_id AS (
  SELECT gen_random_uuid() AS id
)
UPDATE books
SET translation_group_id = (SELECT id FROM translation_group_id)
WHERE slug IN (
  'stories-of-courage-and-faith',
  'cirokên-heza-u-baweriye',
  'qisas-al-shajaa-wal-iman'
);

-- Morning Prayers translation group
WITH translation_group_id AS (
  SELECT gen_random_uuid() AS id
)
UPDATE books
SET translation_group_id = (SELECT id FROM translation_group_id)
WHERE slug IN (
  'morning-prayers-and-blessings',
  'nivskariya-sibehe',
  'adyat-wa-barakat-sabah'
);

-- =============================================
-- Verification Query
-- =============================================
-- Run this to verify books were inserted correctly

SELECT
  title,
  author,
  language,
  category,
  status,
  page_count,
  ROUND(file_size_bytes::numeric / 1024 / 1024, 2) as size_mb
FROM books
ORDER BY published_at DESC;

-- Count books by category
SELECT
  category,
  COUNT(*) as book_count
FROM books
WHERE status = 'published'
GROUP BY category
ORDER BY book_count DESC;

-- Count books by language
SELECT
  language,
  COUNT(*) as book_count
FROM books
WHERE status = 'published'
GROUP BY language
ORDER BY book_count DESC;

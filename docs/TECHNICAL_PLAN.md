# Yazidi Digital Library Mobile App - Technical Plan

## Executive Summary

This plan outlines the architecture for a Yazidi digital library mobile app built with Expo React Native and Supabase. The app will serve the global Yazidi community with multilingual children's books and educational content, supporting offline reading, RTL/LTR layouts, and a phased rollout from basic reader (v1) to advanced teacher/class management (v2-3).

**Target Audience:** General Yazidi community worldwide, including families and children (ages 6-18)

**Content:** Many small books (~50 pages each), mostly children's stories + some adult books, EPUB format ready to use

**Tech Stack:** Expo React Native (iOS/Android), Supabase (Postgres + Auth + Storage)

---

## 1. Phase 1 (v1) Scope - MVP Launch

### Core Features

**Anonymous/Guest Reading**
- Browse catalog without login
- Download books to device
- Read offline with basic reader features
- No authentication required for core reading experience
- Authentication only for cross-device sync, bookmarks, and teacher features

**Browse & Search**
- Category-based browsing (Children's Stories, Prayers, History, Folk Tales)
- Keyword search across books by title, author, and description
- Filter by language (Kurmanji, Arabic, English, German)
- Public access to published books catalog

**EPUB Reader**
- Read small books (~50 pages informational only) with smooth rendering using @epubjs-react-native
- Display structured text/markdown for prayers and short lessons
- Table of contents navigation
- Page turning with swipe gestures
- Progress tracked via CFI (Canonical Fragment Identifier), NOT page numbers

**Offline Downloads**
- Download books for offline reading (support 10-20 books initially, ~300 MB total)
- Progress indicator during download
- Resume interrupted downloads
- Delete downloaded books to free space
- Downloads stored per-device, migrated to user account on signup

**Multi-language Support**
- Full UI in Kurmanji (Latin), Arabic (RTL), English, German
- Proper RTL/LTR layout switching with I18nManager
- Per-book translations linked together
- RTL tested continuously during development, not as final sprint

**Authentication (Optional for v1)**
- User registration and login via Supabase Auth
- Role-based access (reader, admin, teacher)
- Required only for: syncing progress, bookmarks with notes, teacher/class features

**Reading Progress**
- Auto-save last read position every 30 seconds (local storage)
- Position tracked via CFI (EPUB location), NOT page numbers
- Manual bookmarks with optional notes (requires login)
- Continue reading from where you left off (works offline)
- Sync progress across devices when logged in and online

**Basic Settings**
- Adjustable font size for text content
- Light/dark theme toggle
- Language preference (persisted with AsyncStorage)
- Storage usage display and cache management

### Out of Scope for v1

- Teacher/class module (schema ready, no UI)
- Annotations or highlighting
- Social features (favorites sharing, reviews)
- Advanced search filters (age range, tags)
- Push notifications
- In-app analytics dashboard
- Web admin panel (use Supabase Studio)
- Learning tasks, quizzes, vocabulary exercises
- Points, levels, achievements, gamification

### Success Criteria

- Users can discover, download, and read books offline
- RTL (Arabic) and LTR (Kurmanji/English/German) work seamlessly
- App works with intermittent connectivity
- Content loads within 3 seconds on 3G connection
- EPUB files render correctly on iOS and Android
- Books under 20 MB download successfully
- Reading progress syncs without conflicts

---

## 2. Phase 2 & 3 Roadmap

### Phase 2: Teacher & Class Module (Q2 2026)

**Teacher Dashboard**
- View all classes and enrolled students
- Track reading progress across class

**Class Management**
- Create classes with names and descriptions
- Generate invite codes for students to join
- Deactivate classes or remove students

**Book Assignments**
- Assign books to specific classes
- Set optional due dates
- Add teacher notes for context

**Progress Tracking**
- See which students completed assigned books
- View reading progress percentages

**Class-only Content**
- Books visible only to specific classes
- Separate from general library catalog

### Phase 3: Advanced Features (Q3-Q4 2026)

**Annotations & Notes**
- Highlight text passages
- Add private notes
- Sync annotations to cloud

**Reading Statistics**
- Time spent reading
- Books completed counter

**Favorites & Collections**
- User-curated book lists
- Share collections with other users

**Push Notifications**
- New content alerts
- Reading reminders
- Assignment due dates

**Audio Support**
- Narrated books (if audio files available)
- Synchronized text highlighting during playback

**Web Admin Panel**
- Next.js admin UI to replace Supabase Studio
- User-friendly book upload with preview
- Bulk import via CSV
- Usage analytics dashboard

**Advanced Search**
- Filter by age range, difficulty, tags
- Sort by popularity, date added, A-Z

**Content Recommendations**
- "Books like this" based on metadata
- Personalized suggestions

### Phase 4: Learning & Gamification Module (Future)

**Learning Tasks & Quizzes**
- Book-linked vocabulary exercises
- Comprehension quizzes
- Teacher-created custom tasks
- Multiple choice, fill-in-blank, matching

**Gamification System**
- Points for completing books and tasks
- Levels and progression system
- Achievement badges
- Leaderboards (class-level, optional)

**Teacher Features**
- Assign learning activities alongside books
- Track student task completion
- View quiz scores and progress
- Create custom vocabulary lists per book

**Schema designed in Phase 1 to support future additions:**
- `learning_tasks` table
- `task_responses` table
- `user_points` table
- `achievements` and `user_achievements` tables
- Links to books and classes

---

## 3. Database Schema

### Overview

All tables in Supabase Postgres with UUID primary keys, timestamps, and full-text search indexes where appropriate.

### Core Tables

#### profiles
Extends Supabase auth.users with app-specific data.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'admin', 'teacher')),
  display_name TEXT,
  preferred_language TEXT DEFAULT 'ku',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
```

#### books
Core content table with all book metadata.

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metadata
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT,
  translator TEXT,
  description TEXT,

  -- Language & Script
  language TEXT NOT NULL, -- ku, ar, en, de
  script TEXT NOT NULL CHECK (script IN ('latin', 'arabic')),

  -- Content Type
  content_type TEXT NOT NULL CHECK (content_type IN ('epub', 'text')),
  epub_file_path TEXT,
  text_content JSONB,

  -- Categorization
  category TEXT NOT NULL,
  tags TEXT[],
  age_range TEXT,

  -- Visibility & Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  sensitivity_flag TEXT,

  -- Technical
  cover_image_path TEXT,
  file_size_bytes BIGINT,
  page_count INTEGER, -- Informational only, NOT used for progress logic
  version INTEGER DEFAULT 1,

  -- Relationships
  translation_group_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_translation_group ON books(translation_group_id);
CREATE INDEX idx_books_tags ON books USING GIN(tags);
CREATE INDEX idx_books_full_text ON books USING GIN(
  to_tsvector('simple', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(author, ''))
);
```

**Design Decisions:**
- **UUID primary keys**: Prevent ID enumeration attacks, support distributed ID generation
- **translation_group_id**: Links translated versions without strict parent-child hierarchy
- **JSONB for text_content**: Flexible structure for prayers/lessons with embedded translations
- **Array for tags**: Postgres GIN index enables fast tag searches
- **Full-text search index**: Enables fast multilingual search

#### user_downloads
Tracks which books users have downloaded for offline access.

```sql
CREATE TABLE user_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_user_downloads_user ON user_downloads(user_id);
CREATE INDEX idx_user_downloads_book ON user_downloads(book_id);
```

#### reading_progress
Stores user's position within each book.

```sql
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

  -- EPUB Progress
  cfi TEXT, -- EPUB Canonical Fragment Identifier
  chapter_id TEXT,

  -- Text Content Progress
  section_id TEXT,
  scroll_position FLOAT,

  -- General
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_book ON reading_progress(book_id);
```

**CFI (Canonical Fragment Identifier):** Standard EPUB location format that pinpoints exact position across different devices/readers.

#### bookmarks
User-created bookmarks within books.

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

  -- Position
  cfi TEXT,
  section_id TEXT,

  -- Context
  note TEXT,
  context_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_book ON bookmarks(book_id);
```

### Phase 2: Teacher & Class Module Tables

#### classes
Teacher-created classes for organizing students.

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE,
  invite_code_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_invite_code ON classes(invite_code) WHERE invite_code IS NOT NULL;
```

#### class_memberships
Links students to classes.

```sql
CREATE TABLE class_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,

  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_memberships_class ON class_memberships(class_id);
CREATE INDEX idx_class_memberships_student ON class_memberships(student_id);
```

#### class_books
Books assigned to specific classes.

```sql
CREATE TABLE class_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  notes TEXT,

  UNIQUE(class_id, book_id)
);

CREATE INDEX idx_class_books_class ON class_books(class_id);
CREATE INDEX idx_class_books_book ON class_books(book_id);
```

#### assignment_completions
Tracks student completion of assigned books.

```sql
CREATE TABLE assignment_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_book_id UUID NOT NULL REFERENCES class_books(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0,

  UNIQUE(class_book_id, student_id)
);

CREATE INDEX idx_assignment_completions_class_book ON assignment_completions(class_book_id);
CREATE INDEX idx_assignment_completions_student ON assignment_completions(student_id);
```

### Phase 4: Learning & Gamification Module (Future Schema)

**Note:** These tables are NOT created in v1, but the schema is designed to accommodate them without breaking changes.

#### learning_tasks
Tasks linked to books (vocabulary, quizzes, comprehension).

```sql
CREATE TABLE learning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('vocabulary', 'quiz', 'comprehension', 'custom')),
  task_data JSONB NOT NULL, -- Questions, answers, vocab words
  points INTEGER DEFAULT 0,
  required_for_completion BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id), -- Teacher or admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_tasks_book ON learning_tasks(book_id);
CREATE INDEX idx_learning_tasks_type ON learning_tasks(task_type);
```

#### task_responses
Student responses to learning tasks.

```sql
CREATE TABLE task_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES learning_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL, -- User's answers
  score INTEGER, -- Calculated score
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(task_id, user_id)
);

CREATE INDEX idx_task_responses_task ON task_responses(task_id);
CREATE INDEX idx_task_responses_user ON task_responses(user_id);
```

#### user_points
Track points earned by users.

```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_user_points_user ON user_points(user_id);
```

#### achievements
Predefined achievements.

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points_required INTEGER,
  books_required INTEGER,
  tasks_required INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### user_achievements
Track which achievements users have unlocked.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
```

### Triggers

Auto-update `updated_at` timestamps:

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reading_progress_updated_at BEFORE UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 4. Row Level Security (RLS) Policy Overview

### What is RLS?

**Simple Explanation:** RLS is like a security guard for your database. It automatically filters what each user can see based on their role and identity. Even if someone hacks the app's code, they can't see other users' data because Postgres enforces these rules at the database level.

### Enable RLS on All Tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_completions ENABLE ROW LEVEL SECURITY;
```

### Policies by Table

#### profiles

```sql
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
```

#### books

```sql
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
```

#### user_downloads, reading_progress, bookmarks

```sql
-- Users can only manage their own data
CREATE POLICY "Users can manage own downloads"
  ON user_downloads FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON reading_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- Admins can view all user data (for support/analytics)
CREATE POLICY "Admins can view all user data"
  ON user_downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- (Repeat for reading_progress, bookmarks)
```

#### classes, class_memberships, class_books

```sql
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
```

### RLS Testing Strategy

- Create test users for each role (reader, admin, teacher, student)
- Use Supabase SQL Editor to test queries as different users
- Automated tests with separate Supabase projects (dev, staging, prod)

---

## 5. Storage Strategy

### Supabase Storage Buckets

**Structure:**
```
yazidi-library/
├── book-covers/
│   ├── {book-id}.jpg          # 400x600px covers
│   └── {book-id}_thumb.jpg    # 150x225px thumbnails
└── book-files/
    └── {book-id}.epub         # EPUB files
```

**Why this structure?**
- Separate buckets for covers and files (different access patterns)
- Book ID in filename (easy to manage, prevents conflicts)
- Thumbnails for faster list view loading

### Storage Policies

```sql
-- Public read access to covers (anonymous browsing)
CREATE POLICY "Public can view book covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');

-- Public can download book files (anonymous reading)
CREATE POLICY "Public can download books"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-files');

-- Only admins can upload/delete
CREATE POLICY "Admins can manage files"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('book-covers', 'book-files')
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### File Organization Best Practices

**Upload Flow:**
1. Admin uploads EPUB via Supabase Studio
2. System generates thumbnail from cover (manual or via script)
3. Store metadata in `books` table with storage paths
4. Set `file_size_bytes` for download size display

**File Naming:**
- Use UUIDs, not book titles (handles special characters)
- Store original filename in `books` table if needed

**CDN & Caching:**
- Supabase Storage uses CloudFlare CDN automatically
- Set `Cache-Control` headers: covers (1 week), EPUBs (1 month)

### Storage Limits & Costs

**Supabase Free Tier:**
- 1 GB storage
- Estimate: ~50 books at 15 MB/book = 750 MB (fits in free tier)

**Pro Tier ($25/month):**
- 100 GB storage
- ~6,600 books at 15 MB/book

---

## 6. Offline Strategy

### What is Offline-First?

**Simple Explanation:** Offline-first means the app works without internet. When you download a book, it's saved on your device. The app reads from your device first, then checks the internet for updates. When you're back online, your reading progress syncs to the cloud.

### Local Storage Architecture

**Technologies:**
- **Expo FileSystem**: Store EPUB files in app's document directory
- **Expo SQLite**: Local database for metadata and reading progress
- **AsyncStorage**: User preferences and settings

**Why SQLite over Realm?**
- Simpler and battle-tested
- Smaller bundle size (~1 MB vs Realm's ~2 MB)
- Better Expo integration with `expo-sqlite`
- Trade-off: Realm has better sync primitives, but we need custom sync logic anyway

### Local SQLite Schema

**Important:** Local storage supports anonymous usage. Data is associated with device, not user ID initially.

```sql
CREATE TABLE local_books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  language TEXT,
  category TEXT,
  cover_uri TEXT,
  epub_uri TEXT,
  file_size_bytes INTEGER,
  page_count INTEGER, -- Informational only, NOT used for progress
  last_synced_at TEXT,
  metadata_json TEXT
);

CREATE TABLE local_reading_progress (
  book_id TEXT PRIMARY KEY,
  cfi TEXT, -- EPUB Canonical Fragment Identifier (primary position marker)
  chapter_id TEXT,
  progress_percent INTEGER, -- Calculated from CFI, NOT page numbers
  last_read_at TEXT,
  synced_to_cloud INTEGER DEFAULT 0,
  user_id TEXT -- NULL for anonymous users, set on login/signup
);

CREATE TABLE local_bookmarks (
  id TEXT PRIMARY KEY,
  book_id TEXT,
  cfi TEXT,
  note TEXT,
  context_text TEXT,
  created_at TEXT,
  synced_to_cloud INTEGER DEFAULT 0
);

CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT,
  record_id TEXT,
  operation TEXT,
  payload TEXT,
  created_at TEXT
);

CREATE INDEX idx_local_books_category ON local_books(category);
CREATE INDEX idx_local_books_language ON local_books(language);
```

### Download Flow

**Note:** Downloads work for both anonymous and authenticated users.

```typescript
async function downloadBook(bookId: string) {
  // 1. Check if already downloaded
  const existingBook = await SQLite.getBook(bookId);
  if (existingBook) return existingBook;

  // 2. Fetch metadata from Supabase (no auth required for published books)
  const book = await supabase.from('books').select('*').eq('id', bookId).single();

  // 3. Download cover image
  const coverUri = await downloadFile(book.cover_image_path, `${bookId}_cover.jpg`);

  // 4. Download EPUB with progress tracking
  const epubUri = await downloadFileWithProgress(
    book.epub_file_path,
    `${bookId}.epub`,
    (progress) => setDownloadProgress(progress)
  );

  // 5. Save to local SQLite
  await SQLite.insertBook({
    id: book.id,
    title: book.title,
    cover_uri: coverUri,
    epub_uri: epubUri,
    last_synced_at: new Date().toISOString(),
    metadata_json: JSON.stringify(book)
  });

  // 6. Record download in cloud (only if authenticated)
  if (currentUser) {
    await supabase.from('user_downloads').insert({
      user_id: currentUser.id,
      book_id: bookId
    });
  }

  return book;
}
```

### Migration on Signup/Login

When anonymous user creates account or logs in, migrate local data to cloud:

```typescript
async function migrateAnonymousDataToUser(userId: string) {
  // 1. Get all local progress without user_id
  const anonymousProgress = await SQLite.getAllProgress({ user_id: null });

  // 2. Upload to cloud
  for (const progress of anonymousProgress) {
    await supabase.from('reading_progress').upsert({
      user_id: userId,
      book_id: progress.book_id,
      cfi: progress.cfi,
      progress_percent: progress.progress_percent,
      last_read_at: progress.last_read_at
    });
  }

  // 3. Update local records with user_id
  await SQLite.updateProgressUserId(anonymousProgress.map(p => p.book_id), userId);

  // 4. Same for bookmarks if any
  const anonymousBookmarks = await SQLite.getAllBookmarks({ user_id: null });
  for (const bookmark of anonymousBookmarks) {
    await supabase.from('bookmarks').insert({
      user_id: userId,
      book_id: bookmark.book_id,
      cfi: bookmark.cfi,
      note: bookmark.note,
      context_text: bookmark.context_text
    });
  }

  await SQLite.updateBookmarksUserId(anonymousBookmarks.map(b => b.id), userId);
}
```

### Sync Logic

**Note:** Sync only runs for authenticated users. Anonymous users work entirely offline with local storage.

**When to Sync:**
- On app startup (if online and authenticated)
- On resume from background (if online and authenticated)
- On explicit "Sync" button (requires login)
- After login/signup (migrate anonymous data)

**Sync Strategy:**

```typescript
async function syncToCloud() {
  if (!isOnline) return;

  // 1. Process sync queue (pending local changes)
  const queue = await SQLite.getAllFromSyncQueue();
  for (const item of queue) {
    try {
      await syncQueueItem(item);
      await SQLite.removeFromSyncQueue(item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // 2. Pull latest progress from cloud
  const cloudProgress = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', currentUser.id);

  for (const cloudRecord of cloudProgress) {
    const localRecord = await SQLite.getProgress(cloudRecord.book_id);

    // Conflict resolution: use latest timestamp
    if (!localRecord || cloudRecord.updated_at > localRecord.last_read_at) {
      await SQLite.upsertProgress(cloudRecord);
    } else if (localRecord.last_read_at > cloudRecord.updated_at) {
      await supabase.from('reading_progress').upsert(localRecord);
    }
  }

  // 3. Check for book metadata updates
  const localBooks = await SQLite.getAllBooks();
  const cloudBooks = await supabase
    .from('books')
    .select('id, version, updated_at')
    .in('id', localBooks.map(b => b.id));

  for (const cloudBook of cloudBooks) {
    const localBook = localBooks.find(b => b.id === cloudBook.id);
    if (localBook && cloudBook.version > JSON.parse(localBook.metadata_json).version) {
      // Show notification: "Update available for {book.title}"
    }
  }
}
```

### Conflict Resolution Rules

**Reading Progress:**
- Last-write-wins based on `last_read_at` timestamp
- Edge case: Use progress with higher `progress_percent` if timestamps close

**Bookmarks:**
- No conflicts (bookmarks are additive)
- Each bookmark has unique ID

### Cache Limits & Management

**Storage Limits:**
- Recommend limiting to 20 books offline (~300 MB at 15 MB/book)
- iOS/Android can evict files under memory pressure

**Cache Eviction (LRU - Least Recently Used):**

```typescript
async function cleanupCache() {
  const downloadedBooks = await SQLite.getAllBooks();

  downloadedBooks.sort((a, b) =>
    new Date(a.last_accessed_at) - new Date(b.last_accessed_at)
  );

  const totalSize = downloadedBooks.reduce((sum, b) => sum + b.file_size_bytes, 0);
  const MAX_CACHE_SIZE = 300 * 1024 * 1024; // 300 MB

  if (totalSize > MAX_CACHE_SIZE) {
    let currentSize = totalSize;
    for (const book of downloadedBooks) {
      if (currentSize <= MAX_CACHE_SIZE) break;
      await deleteBookFromCache(book.id);
      currentSize -= book.file_size_bytes;
    }
  }
}
```

**User Controls:**
- Settings screen: "Downloaded Books" list with "Delete" buttons
- Display total cache size used
- "Clear All Downloads" button

---

## 7. UI Flows & User Journeys

### Key User Journey: First-Time User Browses and Reads Book

**1. Splash Screen (3s)**
- Show Yazidi library logo
- Load language preference
- Route directly to Home (no forced login)

**2. Home Screen (Tab Navigator) - No Login Required**

Tabs: [Browse] [Search] [Downloads] [Profile]

**Browse Tab:**
- Hero section: Featured book carousel
- Category cards grid:
  - Children's Stories
  - Prayers
  - History
  - Folk Tales
- "Recently Added" horizontal scroll
- Language filter: [All] [Kurmanji] [Arabic] [English] [German]

**4. Category Screen**
- Header: "Children's Stories" with back button
- Filter bar: Language, Age Range, Sort
- Grid layout (2 columns mobile, 4 tablet):
  - Cover image
  - Title
  - Author
  - Language badge
  - Download icon (if not downloaded)

**5. Book Detail Screen**
- Large cover image
- Title, Author, Translator
- Description (expandable)
- Metadata badges: Language, Age Range, Pages, Size
- Tags: [folklore] [animals] [ages-6-8]
- "Translations" section (if translation_group_id set)
- Action buttons:
  - [Download] - if not downloaded
  - [Read] - if downloaded
  - [Continue Reading] - if progress exists
- Reading progress bar

**6. Download Flow**
- Progress modal: "Downloading... 45% (2.3 MB / 5.1 MB)"
- Cancel button
- On complete: "Download complete!" → [Read] button appears

**7. EPUB Reader Screen**
- Full-screen reader (hides status bar)
- Top bar (tap to reveal, auto-hide after 3s):
  - Back button
  - Book title
  - Table of Contents icon
- Bottom bar (tap to reveal):
  - Reading progress slider
  - Font size buttons [A-] [A+]
  - Theme toggle (light/dark)
  - Bookmark icon
- Swipe left/right to turn pages

**8. Auto-save Progress**
- CFI position stored locally every 30 seconds
- Synced to cloud when online

**9. Downloads Tab**
- List of downloaded books (works without login)
- Each item shows:
  - Cover thumbnail
  - Title, Author
  - Progress bar (if started, based on CFI)
  - Last read timestamp
  - "Delete" button
- Empty state: "No downloaded books yet"

**10. Profile Tab**
- If anonymous:
  - "Sign Up" button (to enable sync)
  - "Login" button
  - Settings (language, theme, storage)
- If authenticated:
  - Display name
  - "My Progress" (synced across devices)
  - "My Bookmarks"
  - Settings
  - Logout

### RTL/LTR Layout Considerations

**Key UI Elements:**
- Navigation drawer opens from right (RTL) or left (LTR)
- Back buttons on right (RTL), left (LTR)
- Mirror directional icons (arrows, chevrons)
- Text alignment: right (RTL), left (LTR)

**Implementation:**

```typescript
import { I18nManager } from 'react-native';

async function changeLanguage(lang: string) {
  const isRTL = lang === 'ar';

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    await i18n.changeLanguage(lang);
    Alert.alert('Restart Required', 'Please restart the app.');
  }
}
```

---

## 8. Codebase Structure

```
C:\YA\
├── .expo/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── assets/
│   ├── images/
│   │   ├── icon.png
│   │   ├── splash.png
│   │   └── placeholder-cover.png
│   └── translations/
│       ├── en.json
│       ├── ku.json
│       ├── ar.json
│       └── de.json
├── src/
│   ├── api/
│   │   ├── supabase.ts       # Supabase client init
│   │   ├── auth.ts
│   │   ├── books.ts
│   │   ├── progress.ts
│   │   └── storage.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── books/
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookGrid.tsx
│   │   │   ├── BookDetail.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   └── DownloadProgress.tsx
│   │   ├── reader/
│   │   │   ├── EPUBReader.tsx
│   │   │   ├── TextReader.tsx
│   │   │   ├── ReaderControls.tsx
│   │   │   └── TableOfContents.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── TabBar.tsx
│   │       └── LanguageSwitcher.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CategoryScreen.tsx
│   │   │   └── BookDetailScreen.tsx
│   │   ├── search/
│   │   │   └── SearchScreen.tsx
│   │   ├── downloads/
│   │   │   └── DownloadsScreen.tsx
│   │   ├── reader/
│   │   │   ├── EPUBReaderScreen.tsx
│   │   │   └── TextReaderScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── AboutScreen.tsx
│   │   └── classes/          # Phase 2
│   │       ├── ClassesScreen.tsx
│   │       ├── ClassDetailScreen.tsx
│   │       └── CreateClassScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBooks.ts
│   │   ├── useDownload.ts
│   │   ├── useReadingProgress.ts
│   │   ├── useSync.ts
│   │   └── useLocalization.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── booksStore.ts
│   │   ├── downloadsStore.ts
│   │   └── settingsStore.ts
│   ├── services/
│   │   ├── database/
│   │   │   ├── sqlite.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations.ts
│   │   ├── sync/
│   │   │   ├── syncEngine.ts
│   │   │   ├── syncQueue.ts
│   │   │   └── conflictResolver.ts
│   │   ├── download/
│   │   │   ├── downloadManager.ts
│   │   │   └── cacheManager.ts
│   │   └── reader/
│   │       ├── epubService.ts
│   │       └── progressTracker.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   ├── types/
│   │   ├── book.ts
│   │   ├── user.ts
│   │   ├── reading.ts
│   │   └── api.ts
│   └── theme/
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       └── theme.ts
├── __tests__/
│   ├── components/
│   ├── screens/
│   ├── hooks/
│   └── services/
├── scripts/
│   ├── generate-icons.sh
│   └── seed-database.ts
├── docs/
│   ├── SETUP.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_storage_setup.sql
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── jest.config.js
├── app.json
├── eas.json
├── package.json
└── README.md
```

### Critical Files to Create First

**Setup & Config:**
1. `package.json` - Dependencies
2. `app.json` - Expo config
3. `.env.example` - Supabase credentials template
4. `tsconfig.json` - TypeScript config

**Database:**
5. `supabase/migrations/001_initial_schema.sql` - Full schema
6. `supabase/migrations/002_rls_policies.sql` - RLS policies

**API Layer:**
7. `src/api/supabase.ts` - Initialize Supabase client
8. `src/api/books.ts` - Book fetching functions

**Local Storage:**
9. `src/services/database/sqlite.ts` - SQLite wrapper
10. `src/services/database/schema.ts` - Local schema

**Navigation:**
11. `src/navigation/AppNavigator.tsx` - Root navigator with auth check

**Core Screens:**
12. `src/screens/auth/LoginScreen.tsx`
13. `src/screens/home/HomeScreen.tsx`
14. `src/screens/reader/EPUBReaderScreen.tsx`

### Key Dependencies

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",

    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",

    "@supabase/supabase-js": "^2.39.0",

    "@epubjs-react-native/core": "^2.0.0",
    "@epubjs-react-native/file-system": "^2.0.0",
    "react-native-webview": "13.12.2",

    "expo-sqlite": "~15.0.0",
    "expo-file-system": "~18.0.4",
    "@react-native-async-storage/async-storage": "2.1.0",

    "i18next": "^23.7.6",
    "react-i18next": "^14.0.0",
    "expo-localization": "~16.0.0",

    "zustand": "^4.4.7",
    "date-fns": "^3.0.6",
    "zod": "^3.22.4"
  }
}
```

---

## 9. Testing & Quality Guardrails

### Testing Strategy

**Unit Tests (80% coverage target)**
- Services: downloadManager, syncEngine, cacheManager
- Utils: formatting, validation
- Hooks: useBooks, useDownload, useSync
- API clients: books.ts, progress.ts (mock Supabase)

**Integration Tests**
- Auth flow: Register → Login → Logout
- Download flow: Browse → Download → Read → Sync
- Offline flow: Go offline → Read → Modify progress → Go online → Sync
- Search flow: Search → Filter by language → Open book

**Manual Testing Checklist (Before Each Release)**
- [ ] Test on physical iOS device (iPhone 12+)
- [ ] Test on physical Android device (Samsung Galaxy S10+)
- [ ] Test RTL layout (switch to Arabic) - EVERY screen
- [ ] Test anonymous user flow (browse, download, read without login)
- [ ] Test signup flow (migrate anonymous data to account)
- [ ] Test offline mode (Airplane Mode)
- [ ] Test download interruption (turn off WiFi mid-download)
- [ ] Test sync conflict (read on two devices, sync both)
- [ ] Test CFI-based progress (change font size, verify position preserved)
- [ ] Test large library (100+ books)
- [ ] Test small device (iPhone SE)
- [ ] Test tablet layout (iPad, Android tablet)
- [ ] Test accessibility (VoiceOver, TalkBack)

### Code Quality Standards

**ESLint Rules:**
```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

**Prettier Config:**
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100
}
```

### CI/CD Pipeline

**GitHub Actions:**
- Run lint and type-check on every PR
- Run tests with coverage reporting
- **RTL layout tests** (automated screenshot comparison)
- Build iOS and Android on main branch push
- Deploy to TestFlight/Google Play Internal Testing

**RTL Testing in CI:**
- Automated snapshot tests for RTL layouts
- Compare LTR and RTL screenshots
- Fail build if RTL layout breaks

### Performance Budgets

- Home screen load: < 2s on 3G
- Book detail: < 1s
- EPUB first page render: < 3s
- Search results: < 1s
- iOS IPA: < 50 MB
- Android APK: < 40 MB

---

## 10. Risk Mitigation

### Risk 1: Large EPUB Files

**Issue:** Books could exceed expected size (> 50 MB)

**Mitigation:**
- Document max file size (20 MB) for admins
- Compress images inside EPUBs (max 800px width, JPEG quality 80%)
- Use chunked downloads with resume capability
- Show warning before downloading large files: "This book is 45 MB. Download on WiFi?"
- Fallback: Offer "Read Online" mode (stream from Supabase Storage)

### Risk 2: Network Failures During Download

**Issue:** Download fails mid-way with no recovery

**Mitigation:**
- Use `FileSystem.createDownloadResumable()` (built-in resume)
- Retry automatically up to 3 times with exponential backoff
- Show notification: "Download paused. Will resume when online."
- Manual "Retry" button on failed downloads
- Download queue (process one at a time)

### Risk 3: WebView Differences (iOS vs Android)

**Issue:** EPUB rendering looks different or breaks on one platform

**Mitigation:**
- Use @epubjs-react-native (abstracts platform differences)
- Include fallback fonts in app bundle
- Inject CSS reset in WebView for consistency
- Platform-specific fixes where needed
- Test on physical devices (both platforms)
- Fallback: If EPUB fails, extract and show text

### Risk 4: RTL Layout Quirks

**Issue:** UI breaks when switching to Arabic

**Mitigation:**
- Test every screen in Arabic before release
- Use `I18nManager.isRTL` for conditional styling
- Mirror directional icons with `transform: [{ scaleX: -1 }]`
- Ensure third-party libraries support RTL
- Have Arabic-speaking team member review UI

### Risk 5: Local Caching Limits

**Issue:** Device runs out of storage

**Mitigation:**
- Check available storage before downloading
- Enforce 300 MB max cache (configurable)
- Run auto-cleanup on app launch
- Show storage usage in settings
- User can manually delete books

### Risk 6: Sync Conflicts

**Issue:** User reads offline on two devices, progress conflicts

**Mitigation:**
- Last-write-wins by timestamp
- Fallback: Use higher `progress_percent` if timestamps close
- Notify user: "Reading progress updated from another device"
- Store conflict history for debugging

### Risk 7: Supabase Free Tier Limits

**Issue:** App exceeds free tier (storage, bandwidth)

**Mitigation:**
- Monitor usage via Supabase dashboard
- Optimize queries (select only needed columns)
- Cache metadata locally, refresh daily
- Budget for Pro tier ($25/month) at 100+ users
- Implement client-side rate limiting

**Free Tier Limits:**
- 500 MB database
- 1 GB storage
- 2 GB bandwidth/month

### Risk 8: EPUB Format Inconsistencies

**Issue:** Some EPUBs don't follow standards

**Mitigation:**
- Use EPUBCheck tool to validate all EPUBs before upload
- Document required specs (EPUB 3.0, reflowable, no DRM)
- Catch parsing errors, show user-friendly message
- Fallback: Extract HTML and display in WebView
- Manually test each EPUB before publishing

### Risk 9: Authentication Issues

**Issue:** Users can't log in due to Supabase downtime

**Mitigation:**
- Allow browsing downloaded books without auth (offline mode)
- Clear error messages: "Can't connect. Check your internet."
- Auto-retry auth requests (3 attempts)
- Keep users logged in for 30 days (refresh token)

### Risk 10: App Store Rejection

**Issue:** App rejected for policy violations

**Mitigation:**
- Ensure content complies with store guidelines
- Include privacy policy URL
- Set appropriate age rating (4+)
- Use Expo compliance helpers
- Run pre-submission checks

---

## 11. Technical Choices Explained

### Expo React Native vs Bare React Native

**What Expo does:** Framework wrapping React Native with pre-configured tools, like building a house with a kit.

**Why Expo:**
- Faster setup (no Xcode/Android Studio needed)
- OTA updates (push bug fixes without app store review)
- Managed workflow (handles native code, certificates)
- Rich library (Camera, FileSystem, SQLite)

**Trade-off:** Can't add custom native modules easily (but can eject if needed)

### Supabase vs Firebase

**What Supabase does:** Open-source Backend-as-a-Service with Postgres, auth, storage, real-time.

**Why Supabase:**
- Full Postgres (complex queries, full-text search)
- Row Level Security (more powerful than Firebase rules)
- Open source (can self-host)
- More affordable at scale
- Direct SQL access

**Trade-off:** Newer than Firebase, requires SQL knowledge

### @epubjs-react-native vs Custom

**What it does:** React Native wrapper around EPUB.js for rendering EPUBs.

**Why this library:**
- Active maintenance
- Expo compatible
- Feature-rich (TOC, bookmarks, themes)
- Cross-platform consistency

**Trade-off:** Requires WebView (adds ~1 MB), slightly slower than native rendering

### SQLite vs Realm

**What SQLite does:** Lightweight file-based relational database built into iOS/Android.

**Why SQLite:**
- Simple SQL syntax
- Small footprint (~1 MB)
- Fast with indexing
- Official Expo support

**Trade-off:** Manual sync (but we need custom logic anyway)

### i18next vs Alternatives

**What i18next does:** Manages translations, detects language, switches locales, formats plurals/dates.

**Why i18next:**
- Comprehensive (translations, RTL, interpolation)
- AsyncStorage integration
- Pluralization (Arabic has 6 plural forms!)

**Trade-off:** Adds ~50 KB (acceptable)

### Zustand vs Redux

**What Zustand does:** Minimalist state management (1 KB).

**Why Zustand:**
- Simple, no boilerplate
- TypeScript-friendly
- DevTools support
- Persist middleware

**Trade-off:** Less ecosystem than Redux (but we don't need it)

---

## 12. Phase 1 Implementation Timeline

### Sprint 0: Setup (Week 1)
1. Initialize Expo project
2. Install dependencies
3. Create folder structure
4. Set up Supabase project
5. Create migrations
6. Configure linting/TypeScript

### Sprint 1: Core Navigation & Anonymous Mode (Week 2)
1. Initialize Supabase client (with anonymous access)
2. Set up navigation (NO forced auth check)
3. Build profile screen with "Sign Up" / "Login" prompts
4. Create auth API and store
5. Build login/register screens (optional flow)
6. Implement local storage for anonymous users

### Sprint 2: Books Catalog (Weeks 3-4)
1. Create books API and store
2. Build home, category, and book detail screens
3. Create book components
4. Upload sample books

### Sprint 3: Downloads & Offline (Weeks 5-6)
1. Set up SQLite
2. Build download manager
3. Add download button
4. Build downloads screen
5. Implement cache manager

### Sprint 4: EPUB Reader (Weeks 7-8)
1. Install @epubjs-react-native
2. Build reader screen
3. Add reader controls
4. Implement progress tracking

### Sprint 5: Sync & Search (Weeks 9-10)
1. Build sync engine and queue
2. Implement conflict resolver
3. Build search screen
4. Test sync flow

### Sprint 6: Localization & RTL (Weeks 11-12)
1. Set up i18next
2. Create translation files
3. Implement language switcher
4. Test RTL layout
5. Fix RTL quirks

### Sprint 7: Polish & Testing (Weeks 13-14)
1. Add loading states and error handling
2. Implement settings screen
3. Write unit and integration tests
4. Manual testing on devices
5. Fix bugs and polish UI

### Sprint 8: Deployment (Week 15)
1. Set up EAS Build
2. Create app icons and splash screens
3. Write privacy policy
4. Build and test apps
5. Submit to App Store and Google Play

**Total Timeline: ~15 weeks (3.5 months) for v1 MVP**

---

## 13. Admin Workflow (Phase 1)

### Content Management via Supabase Studio

**Step-by-Step: Adding a New Book**

1. **Upload EPUB File**
   - Go to Supabase Storage → `book-files` bucket
   - Click "Upload File"
   - Select EPUB file
   - Note the uploaded path

2. **Upload Cover Image**
   - Go to `book-covers` bucket
   - Upload cover image (400x600px)
   - Optionally upload thumbnail (150x225px)

3. **Insert Book Metadata**
   - Go to Table Editor → `books` table
   - Click "Insert Row"
   - Fill in fields: title, slug, author, translator, description, language, script, content_type, epub_file_path, cover_image_path, category, tags, age_range, status, file_size_bytes, page_count
   - Click "Save"

4. **Link Translations**
   - If book has translations, set same `translation_group_id` on related entries

5. **Test in App**
   - Open mobile app
   - Navigate to category
   - Download and read book

### Future: Web Admin Panel (Phase 3)

**Tech Stack:** Next.js 14, Supabase JS client, Tailwind CSS

**Features:**
- Dashboard with stats
- Books manager with drag-drop upload
- Users manager
- Bulk upload via CSV
- Content preview

**Timeline:** 4-6 weeks in Phase 3

---

## Conclusion

This plan provides a comprehensive roadmap for building the Yazidi Digital Library app with:

- **Offline-first architecture** using SQLite + FileSystem
- **Secure data access** via Row Level Security
- **Scalable design** supporting future teacher/class features
- **Maintainable codebase** with clear structure and testing
- **Privacy-focused** approach with curated content

**Key Success Metrics:**
- v1 launch in 15 weeks
- < 3s EPUB load time on 3G
- < 1% crash rate
- Support for 100+ books, 1000+ users

**Critical Files to Create First:**
1. `supabase/migrations/001_initial_schema.sql` - Database foundation (with future gamification schema noted)
2. `supabase/migrations/002_rls_policies.sql` - Security layer (with anonymous access)
3. `src/api/supabase.ts` - API client (anonymous and authenticated modes)
4. `src/services/database/sqlite.ts` - Local storage (supports anonymous users)
5. `src/services/reader/progressTracker.ts` - CFI-based progress tracking (NOT page-based)
6. `src/services/sync/syncEngine.ts` - Sync orchestration (authenticated only)
7. `src/services/sync/anonymousMigration.ts` - Migrate anonymous data on signup
8. `src/screens/reader/EPUBReaderScreen.tsx` - Core UX (CFI-based progress)
9. `src/navigation/AppNavigator.tsx` - App structure (no forced login)
10. `app.json` - Expo configuration

**Important Implementation Notes:**
- **page_count**: Display only, never use for progress calculations
- **CFI**: Primary position marker, calculate progress_percent from CFI
- **Anonymous mode**: All core features work without login
- **RTL testing**: Continuous from Sprint 6 onward, not a final phase
- **Future-proof schema**: Tables designed to add gamification module without breaking changes

The plan balances simplicity with scalability, prioritizes working features over clever architecture, and delivers incrementally with clear milestones.

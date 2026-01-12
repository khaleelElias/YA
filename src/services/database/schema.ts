/**
 * Local SQLite Database Schema
 *
 * This defines the structure for the local database that stores:
 * - Downloaded books
 * - Reading progress (works offline)
 * - Bookmarks (works offline)
 * - Sync queue (for uploading to Supabase when online)
 *
 * IMPORTANT: Supports anonymous users!
 * - user_id is nullable for anonymous users
 * - Data is migrated to cloud when user signs up/logs in
 */

export const DATABASE_NAME = 'yazidi_library.db';
export const DATABASE_VERSION = 1;

/**
 * SQL statements to create all local tables
 */
export const CREATE_TABLES = `
  -- =============================================
  -- Local Books Table
  -- =============================================
  -- Stores metadata for downloaded books
  CREATE TABLE IF NOT EXISTS local_books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    translator TEXT,
    description TEXT,
    language TEXT NOT NULL,
    script TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT, -- JSON array as string
    age_range TEXT,
    content_type TEXT NOT NULL,
    cover_uri TEXT, -- Local file path
    epub_uri TEXT, -- Local file path
    file_size_bytes INTEGER,
    page_count INTEGER,
    downloaded_at TEXT NOT NULL,
    last_accessed_at TEXT,
    metadata_json TEXT, -- Full metadata from Supabase
    user_id TEXT -- NULL for anonymous, set on login/signup
  );

  CREATE INDEX IF NOT EXISTS idx_local_books_category ON local_books(category);
  CREATE INDEX IF NOT EXISTS idx_local_books_language ON local_books(language);
  CREATE INDEX IF NOT EXISTS idx_local_books_user_id ON local_books(user_id);

  -- =============================================
  -- Local Reading Progress Table
  -- =============================================
  -- Tracks reading position for each book
  -- Works offline, syncs to cloud when online
  CREATE TABLE IF NOT EXISTS local_reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT NOT NULL,
    cfi TEXT, -- EPUB Canonical Fragment Identifier (primary position)
    chapter_id TEXT,
    section_id TEXT,
    scroll_position REAL,
    progress_percent INTEGER DEFAULT 0,
    last_read_at TEXT NOT NULL,
    synced_to_cloud INTEGER DEFAULT 0, -- 0 = not synced, 1 = synced
    user_id TEXT, -- NULL for anonymous
    UNIQUE(book_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_reading_progress_book ON local_reading_progress(book_id);
  CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON local_reading_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_reading_progress_synced ON local_reading_progress(synced_to_cloud);

  -- =============================================
  -- Local Bookmarks Table
  -- =============================================
  -- User-created bookmarks within books
  CREATE TABLE IF NOT EXISTS local_bookmarks (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    cfi TEXT,
    section_id TEXT,
    note TEXT,
    context_text TEXT,
    created_at TEXT NOT NULL,
    synced_to_cloud INTEGER DEFAULT 0,
    user_id TEXT -- NULL for anonymous
  );

  CREATE INDEX IF NOT EXISTS idx_bookmarks_book ON local_bookmarks(book_id);
  CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON local_bookmarks(user_id);
  CREATE INDEX IF NOT EXISTS idx_bookmarks_synced ON local_bookmarks(synced_to_cloud);

  -- =============================================
  -- Sync Queue Table
  -- =============================================
  -- Stores pending operations to sync to cloud
  CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL, -- 'insert', 'update', 'delete'
    payload TEXT NOT NULL, -- JSON data
    created_at TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);

  -- =============================================
  -- Download Queue Table
  -- =============================================
  -- Tracks downloads in progress
  CREATE TABLE IF NOT EXISTS download_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL, -- 'pending', 'downloading', 'paused', 'completed', 'failed'
    progress_bytes INTEGER DEFAULT 0,
    total_bytes INTEGER,
    error_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_download_queue_status ON download_queue(status);
`;

/**
 * SQL statement to drop all tables (for resetting database)
 */
export const DROP_TABLES = `
  DROP TABLE IF EXISTS local_books;
  DROP TABLE IF EXISTS local_reading_progress;
  DROP TABLE IF EXISTS local_bookmarks;
  DROP TABLE IF EXISTS sync_queue;
  DROP TABLE IF EXISTS download_queue;
`;

/**
 * Migration function for future schema updates
 */
export const migrations: Record<number, string> = {
  // Version 1 is the initial schema (CREATE_TABLES)
  // Future versions go here:
  // 2: 'ALTER TABLE ...',
  // 3: 'CREATE TABLE ...',
};

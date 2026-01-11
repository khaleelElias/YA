/**
 * Book and Content Types
 *
 * IMPORTANT NOTES:
 * - page_count is INFORMATIONAL ONLY, never used for progress calculations
 * - Progress tracking uses CFI (Canonical Fragment Identifier), NOT pages
 */

export type Language = 'ku' | 'ar' | 'en' | 'de';
export type Script = 'latin' | 'arabic';
export type ContentType = 'epub' | 'text';
export type BookStatus = 'draft' | 'published' | 'hidden';

export interface Book {
  id: string;

  // Metadata
  title: string;
  slug: string;
  author: string | null;
  translator: string | null;
  description: string | null;

  // Language & Script
  language: Language;
  script: Script;

  // Content Type
  content_type: ContentType;
  epub_file_path: string | null;
  text_content: Record<string, any> | null; // JSONB for structured text/markdown

  // Categorization
  category: string;
  tags: string[] | null;
  age_range: string | null;

  // Visibility & Status
  status: BookStatus;
  sensitivity_flag: string | null;

  // Technical
  cover_image_path: string | null;
  file_size_bytes: number | null;
  page_count: number | null; // INFORMATIONAL ONLY - NOT used for progress
  version: number;

  // Relationships
  translation_group_id: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * Book with translations
 * Used when fetching a book with its related translations
 */
export interface BookWithTranslations extends Book {
  translations: Book[];
}

/**
 * User's download record
 */
export interface UserDownload {
  id: string;
  user_id: string;
  book_id: string;
  downloaded_at: string;
  last_accessed_at: string;
}

/**
 * Reading progress
 *
 * CRITICAL: Progress is tracked via CFI, NOT page_count
 * - cfi: EPUB Canonical Fragment Identifier (primary position marker)
 * - progress_percent: Calculated FROM cfi, not from pages
 */
export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;

  // EPUB Progress (CFI is the source of truth)
  cfi: string | null; // EPUB Canonical Fragment Identifier
  chapter_id: string | null;

  // Text Content Progress
  section_id: string | null;
  scroll_position: number | null;

  // General (calculated from CFI, NOT page numbers)
  progress_percent: number;
  last_read_at: string;

  created_at: string;
  updated_at: string;
}

/**
 * Bookmark
 */
export interface Bookmark {
  id: string;
  user_id: string;
  book_id: string;

  // Position (CFI for EPUB, section_id for text)
  cfi: string | null;
  section_id: string | null;

  // Context
  note: string | null;
  context_text: string | null;

  created_at: string;
}

/**
 * Local book (stored in SQLite for offline access)
 */
export interface LocalBook {
  id: string;
  title: string;
  author: string | null;
  language: Language;
  category: string;
  cover_uri: string | null; // Local file path
  epub_uri: string | null; // Local file path
  file_size_bytes: number;
  page_count: number | null; // INFORMATIONAL ONLY
  last_synced_at: string;
  metadata_json: string; // Full Book object as JSON
}

/**
 * Local reading progress (SQLite)
 *
 * CRITICAL: progress_percent calculated from CFI, NOT pages
 */
export interface LocalReadingProgress {
  book_id: string;
  cfi: string | null; // Primary position marker
  chapter_id: string | null;
  progress_percent: number; // Calculated from CFI
  last_read_at: string;
  synced_to_cloud: 0 | 1; // SQLite boolean
  user_id: string | null; // NULL for anonymous users
}

/**
 * Category for grouping books
 */
export interface Category {
  id: string;
  name: string;
  name_translations: Record<Language, string>;
  icon: string | null;
  book_count: number;
}

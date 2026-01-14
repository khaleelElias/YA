-- ==============================================
-- Migration 004: Add PDF Support
-- ==============================================
-- Date: January 14, 2026
-- Purpose: Add PDF file support to books table and reading progress

-- Update books table
-- 1. Add pdf_file_path column
ALTER TABLE books ADD COLUMN IF NOT EXISTS pdf_file_path TEXT;

-- 2. Update content_type constraint to include 'pdf'
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_content_type_check;
ALTER TABLE books ADD CONSTRAINT books_content_type_check
  CHECK (content_type IN ('epub', 'pdf', 'text'));

-- Update reading_progress table for PDF page tracking
-- 3. Add current_page column for PDF files
ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS current_page INTEGER;

-- 4. Add total_pages column for PDF files
ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS total_pages INTEGER;

-- 5. Update bookmarks table to support PDF page numbers
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS page_number INTEGER;

-- Create index for pdf_file_path (for faster queries)
CREATE INDEX IF NOT EXISTS idx_books_pdf_file_path ON books(pdf_file_path) WHERE pdf_file_path IS NOT NULL;

-- Update comments for clarity
COMMENT ON COLUMN books.epub_file_path IS 'Path to EPUB file in Supabase Storage (for EPUB content)';
COMMENT ON COLUMN books.pdf_file_path IS 'Path to PDF file in Supabase Storage (for PDF content)';
COMMENT ON COLUMN reading_progress.cfi IS 'EPUB Canonical Fragment Identifier (for EPUB files)';
COMMENT ON COLUMN reading_progress.current_page IS 'Current page number (for PDF files)';
COMMENT ON COLUMN reading_progress.total_pages IS 'Total pages (for PDF files)';
COMMENT ON COLUMN reading_progress.progress_percent IS 'Progress percentage: calculated from CFI for EPUB, from page numbers for PDF';

# PDF Setup Guide for Yazidi Library

This guide walks you through setting up PDF books in your Supabase database and storage.

## Prerequisites

- Supabase project set up (you already have this)
- Access to Supabase Dashboard
- PDF files ready to upload

## Step 1: Run Database Migration

First, we need to update the Supabase database schema to support PDF files.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (in left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/004_add_pdf_support.sql`
6. Click **Run** or press `Ctrl+Enter`

### Option B: Using Supabase CLI

```bash
supabase db push
```

### What This Does:

- Adds `pdf_file_path` column to `books` table
- Updates `content_type` constraint to include `'pdf'`
- Adds `current_page` and `total_pages` columns to `reading_progress` table
- Adds `page_number` column to `bookmarks` table

## Step 2: Create Storage Bucket (If Not Exists)

### Check if 'books' bucket exists:

1. Go to **Storage** in Supabase Dashboard
2. Look for a bucket named `books`

### If it doesn't exist, create it:

1. Click **New Bucket**
2. Name: `books`
3. **Public bucket**: Check this (so books can be downloaded)
4. Click **Create Bucket**

### Create a subfolder for PDFs:

1. Click on the `books` bucket
2. Click **Create Folder**
3. Name: `pdfs`
4. Click **Create**

## Step 3: Upload PDF Files

You have two options for uploading PDFs:

### Option A: Upload via Supabase Dashboard

1. Go to **Storage** → `books` bucket
2. Navigate to the `pdfs` folder
3. Click **Upload File**
4. Select your PDF files
5. Click **Upload**

**Note**: Remember the exact file names, you'll need them for Step 4.

### Option B: Upload via Supabase Client

You can also upload programmatically:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Upload a PDF file
const file = /* your file object */
const { data, error } = await supabase.storage
  .from('books')
  .upload('pdfs/your-book.pdf', file, {
    contentType: 'application/pdf',
    cacheControl: '3600'
  })
```

## Step 4: Add PDF Book Records to Database

Now we need to create book records that reference these PDF files.

### Option A: Use the Test Data Script (Quick Start)

1. Open `supabase/seed_test_pdf_books.sql`
2. **Update the `pdf_file_path` values** to match your uploaded files:
   ```sql
   -- Change this:
   pdf_file_path = 'pdfs/history-kurdish-people.pdf'

   -- To match your actual file name:
   pdf_file_path = 'pdfs/your-actual-file.pdf'
   ```
3. Go to **SQL Editor** in Supabase Dashboard
4. Paste the updated SQL
5. Click **Run**

### Option B: Create Individual Book Records

Use this template for each PDF book:

```sql
INSERT INTO books (
  title,
  slug,
  author,
  description,
  language,
  script,
  content_type,
  pdf_file_path,  -- Path in Supabase Storage
  category,
  tags,
  status,
  file_size_bytes,
  page_count,
  published_at
) VALUES (
  'Your Book Title',
  'your-book-slug',  -- Must be unique
  'Author Name',
  'Book description',
  'ku',  -- ku, ar, en, or de
  'latin',  -- latin or arabic
  'pdf',  -- content type
  'pdfs/your-file.pdf',  -- Path in Storage
  'Category Name',  -- History, Children, Education, etc.
  ARRAY['Tag1', 'Tag2'],
  'published',
  2500000,  -- File size in bytes
  150,  -- Number of pages
  NOW()
);
```

## Step 5: Verify Setup

Run these queries to verify everything is set up correctly:

### 1. Check PDF books were created:

```sql
SELECT id, title, pdf_file_path, category, status
FROM books
WHERE content_type = 'pdf';
```

### 2. Test file URL generation:

```sql
SELECT
  title,
  pdf_file_path,
  -- Generate public URL
  'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/books/' || pdf_file_path as download_url
FROM books
WHERE content_type = 'pdf';
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### 3. Test in the app:

1. Build the app: `npx expo prebuild && npx expo run:ios`
2. Open the app
3. Go to Browse tab
4. You should see your PDF books
5. Tap on a PDF book
6. Tap "Download" button
7. Wait for download to complete
8. Tap "Read Now" to open the PDF reader

## Step 6: Troubleshooting

### Issue: "Failed to get download URL"

**Cause**: Bucket is not public or file path is incorrect

**Solution**:
1. Go to **Storage** → `books` bucket → **Settings**
2. Ensure **Public bucket** is checked
3. Verify file path matches exactly (case-sensitive)

### Issue: "This book does not have a PDF file available"

**Cause**: `pdf_file_path` is NULL or empty in database

**Solution**:
```sql
-- Check the book record
SELECT id, title, content_type, pdf_file_path
FROM books
WHERE id = 'your-book-id';

-- Update if needed
UPDATE books
SET pdf_file_path = 'pdfs/your-file.pdf'
WHERE id = 'your-book-id';
```

### Issue: "Download failed with status: 404"

**Cause**: File doesn't exist in Storage

**Solution**:
1. Verify file exists: Go to **Storage** → `books` → `pdfs`
2. Check file name matches exactly
3. Re-upload if necessary

### Issue: PDF opens but shows blank screen

**Cause**: PDF file is corrupted or invalid

**Solution**:
1. Open PDF on your computer to verify it's valid
2. Try a different PDF file
3. Ensure PDF is not password-protected
4. Check file size (very large PDFs may have issues)

## Step 7: Storage Policies (Optional)

If you want more control over who can access PDFs:

```sql
-- Allow anonymous download of published books
CREATE POLICY "Allow public read access to book PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'books' AND
  (storage.foldername(name))[1] = 'pdfs'
);
```

## Quick Reference: File Paths

When referencing files in the database:

- ✅ Correct: `'pdfs/my-book.pdf'` (relative path)
- ❌ Wrong: `'/pdfs/my-book.pdf'` (leading slash)
- ❌ Wrong: `'books/pdfs/my-book.pdf'` (includes bucket name)
- ❌ Wrong: `'file:///pdfs/my-book.pdf'` (file:// protocol)

The app automatically constructs the full Supabase Storage URL:
```
https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/books/pdfs/my-book.pdf
```

## Sample PDF Books for Testing

If you need sample PDFs for testing, you can use:

1. **Free Public Domain Books**: https://www.gutenberg.org/
2. **Sample PDFs**: Search for "sample pdf" online
3. **Create Your Own**: Use any PDF creator/converter

**Tip**: Start with small PDFs (< 5 MB) for faster testing.

## Next Steps

After setting up PDF books:

1. Test downloading a PDF book in the app
2. Test opening the PDF reader
3. Test page navigation (swipe/tap)
4. Test progress tracking (close and reopen)
5. Check SQLite database: `SELECT * FROM local_reading_progress`

## Need Help?

- Check `docs/SPRINT_4_IMPLEMENTATION.md` for reader implementation details
- Check `docs/TROUBLESHOOTING.md` for common issues
- Review console logs for detailed error messages

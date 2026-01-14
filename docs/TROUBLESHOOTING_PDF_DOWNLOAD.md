# Troubleshooting PDF Download Issues

## Error: "Download failed with status: 400"

This error means the file URL is incorrect or the file doesn't exist. Here's how to fix it:

### Step 1: Check Your Supabase Storage Setup

1. **Go to Supabase Dashboard → Storage**
2. **Identify your bucket name**:
   - Is it named `books`?
   - Or `book-files`?
   - Or something else?

3. **Check if PDFs are uploaded**:
   - Click on your bucket
   - Navigate through folders (if any)
   - Verify your PDF files are there

### Step 2: Match Bucket Name in Code

The app currently uses `'books'` as the bucket name. If yours is different, update the code:

**File**: `src/api/books.ts`

```typescript
export async function getBookFileUrl(filePath: string): Promise<string | null> {
  try {
    // Change 'books' to YOUR actual bucket name
    const { data } = supabase.storage.from('YOUR_BUCKET_NAME').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting book file URL:', error);
    return null;
  }
}
```

### Step 3: Check File Paths in Database

Run this query in Supabase SQL Editor:

```sql
SELECT
  id,
  title,
  content_type,
  pdf_file_path
FROM books
WHERE content_type = 'pdf';
```

**The `pdf_file_path` must match the actual location in Storage.**

#### Example Scenarios:

**Scenario A: Files in root of bucket**
```
Storage: books/testbook1.pdf
Database: pdf_file_path = 'testbook1.pdf'  ✅ Correct
```

**Scenario B: Files in subfolder**
```
Storage: books/pdfs/testbook1.pdf
Database: pdf_file_path = 'pdfs/testbook1.pdf'  ✅ Correct
Database: pdf_file_path = 'testbook1.pdf'  ❌ Wrong
```

### Step 4: Make Bucket Public

1. Go to **Storage** → your bucket
2. Click the bucket name
3. Go to **Policies** tab
4. Add this policy if it doesn't exist:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'books' );  -- Change 'books' to your bucket name
```

Or simply check the **"Public bucket"** checkbox in settings.

### Step 5: Test the URL Manually

From your error log, the URL was:
```
https://ucgryycirirxjskfhqes.supabase.co/storage/v1/object/public/books/testbook5.pdf
```

**Test it**:
1. Copy this URL
2. Paste it in your browser
3. It should either:
   - Download the PDF ✅
   - OR show "File not found" ❌

If it shows "File not found", the path is wrong.

### Step 6: Fix Your Database Records

If your files are actually in `books/pdfs/testbook5.pdf`, update the database:

```sql
UPDATE books
SET pdf_file_path = 'pdfs/testbook5.pdf'  -- Add the folder prefix
WHERE id = 'd5b0fca3-5ca5-4407-9d68-3803bb09c14d';

-- Or if they're in the root:
UPDATE books
SET pdf_file_path = 'testbook5.pdf'
WHERE id = 'd5b0fca3-5ca5-4407-9d68-3803bb09c14d';
```

## Common Issues & Solutions

### Issue: "Storage bucket not found"

**Cause**: Bucket name in code doesn't match Supabase
**Solution**: Update `src/api/books.ts` line 286 with correct bucket name

### Issue: Files download but app says "not found"

**Cause**: Path mismatch between database and Storage
**Solution**:
1. Check exact path in Storage (with folders)
2. Update `pdf_file_path` in database to match

### Issue: "Access denied" or 403 error

**Cause**: Bucket is not public
**Solution**:
1. Go to Storage → Policies
2. Add public SELECT policy
3. Or check "Public bucket" in settings

### Issue: Some books work, others don't

**Cause**: Inconsistent paths in database
**Solution**:
```sql
-- Check all PDF books
SELECT id, title, pdf_file_path FROM books WHERE content_type = 'pdf';

-- Fix each one individually
UPDATE books SET pdf_file_path = 'correct/path.pdf' WHERE id = 'book-id';
```

## Verification Checklist

Before trying to download again, verify:

- [ ] Supabase Storage bucket exists
- [ ] Bucket name in code matches actual bucket name
- [ ] PDF files are uploaded to Storage
- [ ] Bucket is public (or has read policy)
- [ ] `pdf_file_path` in database matches Storage location exactly
- [ ] Test URL works in browser

## Quick Test

After fixing, test with this SQL to see generated URLs:

```sql
SELECT
  title,
  pdf_file_path,
  'https://ucgryycirirxjskfhqes.supabase.co/storage/v1/object/public/books/' || pdf_file_path as full_url
FROM books
WHERE content_type = 'pdf';
```

Copy a `full_url` and test it in your browser. It should download the PDF.

## Still Not Working?

Share these details:
1. Your actual Supabase bucket name
2. Where files are located in Storage (with folders)
3. The `pdf_file_path` value from database
4. The full URL being generated (from logs)
5. What happens when you test the URL in browser

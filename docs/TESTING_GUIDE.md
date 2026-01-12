# Testing Guide - Yazidi Library App

This guide will help you set up your Supabase database with test data and verify that the app is working correctly.

---

## Prerequisites

Before testing, ensure you have:

- ✅ Supabase project created at `https://ucgryycirirxjskfhqes.supabase.co`
- ✅ `.env` file with correct credentials
- ✅ Node modules installed (`npm install`)
- ✅ Expo development server running (`npm start`)

---

## Step 1: Run Database Migrations

These migrations create all necessary tables and set up Row Level Security.

### Option A: Using SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project: `yazidi-library`

2. **Run Migration 001 - Initial Schema**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**
   - Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - ✅ You should see "Success. No rows returned"

3. **Run Migration 002 - RLS Policies**
   - Click **New Query** again
   - Copy the entire contents of `supabase/migrations/002_rls_policies.sql`
   - Paste and **Run**
   - ✅ Should complete successfully

4. **Run Migration 003 - Storage Setup**
   - Click **New Query** again
   - Copy the entire contents of `supabase/migrations/003_storage_setup.sql`
   - Paste and **Run**
   - ✅ Should create storage buckets

### Verify Migrations Ran Successfully

1. **Check Tables**
   - Go to **Table Editor** (left sidebar)
   - You should see these tables:
     - `profiles`
     - `books`
     - `user_downloads`
     - `reading_progress`
     - `bookmarks`
     - `classes`
     - `class_memberships`
     - `class_books`
     - `assignment_completions`

2. **Check Storage Buckets**
   - Go to **Storage** (left sidebar)
   - You should see:
     - `book-covers` (public)
     - `book-files` (public)

---

## Step 2: Add Test Books

Now let's add some test books so you can see data in the app.

### Quick Option: 5 Test Books

1. **Open SQL Editor**
   - Go to **SQL Editor** → **New Query**

2. **Run Quick Test Books Script**
   - Copy the entire contents of `supabase/quick_test_books.sql`
   - Paste into SQL Editor
   - Click **Run**
   - ✅ You should see "Success" and a table showing 5 books

3. **Verify Books Were Added**
   - Go to **Table Editor** → `books` table
   - You should see 5 books:
     - Stories of Courage
     - Morning Prayers
     - History of Lalish
     - Yazidi Festivals
     - Tales from Sinjar

### Full Option: 14 Test Books (with translations)

If you want more books including Kurdish and Arabic translations:

1. **Open SQL Editor** → **New Query**
2. Copy contents of `supabase/seed_test_books.sql`
3. Run the script
4. You'll get 14 books across 3 languages (English, Kurmanji, Arabic)

---

## Step 3: Verify .env Configuration

Make sure your `.env` file has the correct Supabase credentials.

1. **Check .env file** at `C:\YA\.env`

2. **It should look like this:**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://ucgryycirirxjskfhqes.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   EXPO_PUBLIC_ENV=development
   ```

3. **Get the correct Anon Key:**
   - Go to Supabase Dashboard → **Settings** (gear icon)
   - Click **API**
   - Copy the **anon/public** key (starts with `eyJhbGc...`)
   - Replace the value in `.env`

4. **⚠️ IMPORTANT:** Your current `.env` has an incomplete key. Update it with the full key from Supabase.

---

## Step 4: Restart the App

After updating `.env`, you need to restart the Expo server:

```bash
# Stop the current server (Ctrl+C)
# Clear cache and restart
npm start -- --clear
```

---

## Step 5: Test the App

Now let's test all the features we just built!

### Test 1: Browse Books
- ✅ Open the app on your device/emulator
- ✅ You should see the **Browse** tab
- ✅ Books should load automatically
- ✅ You should see "5 books" (or "14 books" if you ran the full seed script)

**Expected Result:**
- Book cards displayed in a 2-column grid
- Each book shows title, author, category
- Colored placeholder covers
- EPUB badges on covers

### Test 2: Loading State
- ✅ Pull down to refresh the list
- ✅ You should see a loading spinner
- ✅ "Loading books..." text appears

### Test 3: Category Filtering
- ✅ Scroll the category pills horizontally
- ✅ Click on "Stories" category
- ✅ Books should filter to only show Stories
- ✅ Category pill turns gold/amber (active state)
- ✅ Book count updates

**Categories you should see:**
- Stories (1-2 books)
- Prayers (1 book)
- History (1 book)
- Holidays (1 book)
- Folk Tales (1 book)

### Test 4: Search
- ✅ Click on the search bar at the top
- ✅ Type "courage"
- ✅ Books filter to show only matching results
- ✅ Try typing "lalish"
- ✅ Should show History of Lalish book

### Test 5: Book Detail Navigation
- ✅ Tap on any book card
- ✅ Should navigate to Book Detail screen
- ✅ See large book cover
- ✅ See full book information
- ✅ Metadata pills (language, category, page count)
- ✅ Description text
- ✅ File size information
- ✅ Favorite button (heart icon)
- ✅ Action buttons at bottom (Download, Read Now)

### Test 6: Back Navigation
- ✅ Press the back button (top left)
- ✅ Should return to Browse screen
- ✅ Previous search/filter should be preserved

### Test 7: Empty State
- ✅ Search for "xyz123" (something that doesn't exist)
- ✅ Should show empty state with book icon
- ✅ "No books found" message
- ✅ "Try a different search term" subtext

### Test 8: Favorite Button
- ✅ On a book card, tap the heart icon
- ✅ Heart should fill in (become solid)
- ✅ Tap again, it should unfill
- ✅ Should NOT navigate to book detail when tapping heart

---

## Troubleshooting

### "No books found" but you added test books

**Possible causes:**
1. Books status is not 'published' - Check `books` table, ensure `status = 'published'`
2. RLS policies blocking access - Make sure migration 002 ran successfully
3. Wrong environment variables - Verify `.env` has correct URL and key

**Solution:**
```sql
-- Check if books exist
SELECT * FROM books;

-- Check if books are published
SELECT title, status FROM books;

-- If status is wrong, fix it:
UPDATE books SET status = 'published' WHERE status != 'published';
```

### App shows "Failed to fetch books"

**Possible causes:**
1. Wrong Supabase URL or key
2. Network issue
3. RLS policies too strict

**Solution:**
1. Verify `.env` credentials match Supabase dashboard
2. Check console for detailed error messages
3. Test connection in Supabase SQL Editor:
   ```sql
   SELECT * FROM books WHERE status = 'published';
   ```

### Categories not showing

**Cause:** No books or RPC function missing

**Solution:**
```sql
-- Verify books have categories
SELECT DISTINCT category, COUNT(*)
FROM books
WHERE status = 'published'
GROUP BY category;
```

### TypeScript errors

**Solution:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# If errors, they should be in the output
# Common fixes:
# 1. Restart TypeScript server in VS Code
# 2. Delete node_modules and reinstall
npm install
```

---

## What's Working Now

After completing these steps, you should have:

- ✅ **Browse Screen** - Shows books from database
- ✅ **Category Filtering** - Filter by category with counts
- ✅ **Search** - Search books by title, author, description
- ✅ **Loading States** - Spinner while fetching
- ✅ **Error States** - Error message with retry button
- ✅ **Empty States** - Friendly message when no results
- ✅ **Book Detail Screen** - Full book information
- ✅ **Navigation** - Smooth navigation between screens
- ✅ **Pull to Refresh** - Refresh book list
- ✅ **Favorites** - Toggle favorite status (local only for now)

---

## What's NOT Working Yet

These features are planned for future sprints:

- ❌ **Download Books** - Download functionality not implemented
- ❌ **Read Books** - EPUB reader not implemented
- ❌ **Offline Storage** - SQLite not set up yet
- ❌ **Sync** - Cross-device sync not implemented
- ❌ **Authentication** - Login/signup not implemented
- ❌ **Book Covers** - Actual cover images (using colored placeholders)
- ❌ **Favorites Persistence** - Favorites not saved to database

---

## Next Steps

After verifying everything works:

1. **Sprint 3: Downloads & Offline**
   - Implement book downloads
   - Set up SQLite for local storage
   - Cache management

2. **Sprint 4: EPUB Reader**
   - Integrate EPUB reader library
   - Reading progress tracking with CFI
   - Reader controls (font size, theme)

3. **Sprint 5: Authentication & Sync**
   - Login/signup screens
   - Migrate anonymous data on signup
   - Cross-device sync

---

## Success Criteria

You'll know everything is working when:

1. ✅ App loads without errors
2. ✅ Books appear on Browse screen
3. ✅ Category filtering works
4. ✅ Search works
5. ✅ Can navigate to book detail and back
6. ✅ All loading/error/empty states display correctly
7. ✅ Pull-to-refresh works
8. ✅ Favorite buttons toggle on/off

---

## Getting Help

If you encounter issues:

1. **Check Console Logs** - Look for error messages in Metro bundler
2. **Check Supabase Logs** - Supabase Dashboard → Logs
3. **Verify Database** - Use SQL Editor to query data directly
4. **Check Network** - Use React Native Debugger to see API calls

---

## Database Queries for Debugging

Useful SQL queries for troubleshooting:

```sql
-- Count all books by status
SELECT status, COUNT(*)
FROM books
GROUP BY status;

-- View all published books
SELECT id, title, author, category, language
FROM books
WHERE status = 'published'
ORDER BY published_at DESC;

-- Check for books with missing data
SELECT id, title,
  CASE
    WHEN author IS NULL THEN 'Missing author'
    WHEN category IS NULL THEN 'Missing category'
    WHEN description IS NULL THEN 'Missing description'
    ELSE 'Complete'
  END as data_status
FROM books;

-- View book categories with counts
SELECT category, COUNT(*) as book_count
FROM books
WHERE status = 'published'
GROUP BY category
ORDER BY book_count DESC;
```

---

## Test Checklist

Use this checklist to verify everything works:

### Database Setup
- [ ] Migration 001 ran successfully
- [ ] Migration 002 ran successfully
- [ ] Migration 003 ran successfully
- [ ] Test books inserted (5 or 14)
- [ ] Books table has data
- [ ] All books have `status = 'published'`

### App Configuration
- [ ] `.env` file exists
- [ ] Supabase URL is correct
- [ ] Anon key is complete (not truncated)
- [ ] Server restarted after `.env` update

### App Functionality
- [ ] App loads without crashes
- [ ] Books display on Browse screen
- [ ] Book count shows correctly
- [ ] Category pills appear
- [ ] Category filtering works
- [ ] Search works
- [ ] Book cards are tappable
- [ ] Book detail screen shows
- [ ] Back button works
- [ ] Loading state appears when refreshing
- [ ] Favorite hearts toggle

---

**Ready to test!** 🚀

Start with Step 1 and work through each step. By the end, you'll have a fully functional book browsing experience!

# Supabase Setup Guide

## When to Set Up Supabase

**⏰ You should set up Supabase NOW** before continuing with app development.

The API layer is ready and the app will need a working Supabase backend to function properly.

---

## Step-by-Step Supabase Setup

### 1. Create a Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [https://app.supabase.com](https://app.supabase.com)
   - Sign in or create a free account

2. **Create New Project**
   - Click "New Project"
   - Fill in project details:
     - **Organization**: Select or create one
     - **Name**: `yazidi-library` (or your preferred name)
     - **Database Password**: Choose a strong password (save it securely!)
     - **Region**: Choose closest to your users (e.g., `eu-central-1` for Europe)
     - **Pricing Plan**: Free tier is fine to start

3. **Wait for Project Initialization**
   - This takes ~2 minutes
   - You'll see "Setting up project..." status

---

### 2. Run Database Migrations

Once your project is ready:

#### Option A: Using SQL Editor (Recommended for first time)

1. **Open SQL Editor**
   - In Supabase Dashboard, go to **SQL Editor** (left sidebar)
   - Click **New Query**

2. **Run Migration 001: Initial Schema**
   - Copy entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - ✅ You should see "Success. No rows returned"

3. **Run Migration 002: RLS Policies**
   - Open a **New Query**
   - Copy entire contents of `supabase/migrations/002_rls_policies.sql`
   - Paste and **Run**
   - ✅ Should complete successfully

4. **Run Migration 003: Storage Setup**
   - Open a **New Query**
   - Copy entire contents of `supabase/migrations/003_storage_setup.sql`
   - Paste and **Run**
   - ✅ Should create storage buckets

#### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

### 3. Verify Database Setup

After running migrations, verify everything is set up correctly:

#### Check Tables

1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `books`
   - ✅ `user_downloads`
   - ✅ `reading_progress`
   - ✅ `bookmarks`
   - ✅ `classes` (for Phase 2)
   - ✅ `class_memberships` (for Phase 2)
   - ✅ `class_books` (for Phase 2)
   - ✅ `assignment_completions` (for Phase 2)

#### Check Storage Buckets

1. Go to **Storage** (left sidebar)
2. You should see:
   - ✅ `book-covers` (public)
   - ✅ `book-files` (public for reading, private for uploads)

#### Check RLS Policies

1. Go to **Authentication** → **Policies**
2. Each table should have policies defined
3. Example: `books` table should have policies like:
   - "Anonymous users can view published books"
   - "Authenticated readers can view published books"
   - "Admins can manage all books"

---

### 4. Get Your API Credentials

1. **Go to Project Settings**
   - Click **Settings** (gear icon in sidebar)
   - Select **API**

2. **Copy Your Credentials**
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

3. **Update `.env` File**
   - Open `C:\YA\.env` (create it if it doesn't exist)
   - Copy from `.env.example`:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
     EXPO_PUBLIC_ENV=development
     ```
   - Replace with your actual values

---

### 5. Create Your First Admin User

You need an admin user to upload books.

#### Option 1: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Fill in:
   - **Email**: your email
   - **Password**: choose a password
   - **Auto Confirm User**: ✅ (check this)
4. Click **Create User**

5. **Set User Role to Admin**
   - Go to **Table Editor** → `profiles`
   - Find the row with your user's ID
   - If no row exists, insert one:
     ```sql
     INSERT INTO profiles (id, role, display_name, preferred_language)
     VALUES ('your-user-id-from-auth', 'admin', 'Admin User', 'en');
     ```
   - If row exists, update:
     ```sql
     UPDATE profiles
     SET role = 'admin'
     WHERE id = 'your-user-id-from-auth';
     ```

#### Option 2: Via SQL Editor

```sql
-- Create admin user directly
-- Replace with your email and desired password
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@example.com',
  crypt('your-password', gen_salt('bf')),
  NOW()
);

-- Get the user ID (will be returned from insert)
-- Then create profile
INSERT INTO profiles (id, role, display_name, preferred_language)
VALUES (
  'user-id-from-previous-query',
  'admin',
  'Admin User',
  'en'
);
```

---

### 6. Upload Test Books (Optional)

To test the app with real content:

#### Upload a Book File

1. Go to **Storage** → `book-files`
2. Click **Upload File**
3. Select an EPUB file (or use a test file)
4. Note the file path (e.g., `abc123.epub`)

#### Upload a Book Cover

1. Go to **Storage** → `book-covers`
2. Upload a cover image (400x600px recommended)
3. Note the file path (e.g., `abc123.jpg`)

#### Add Book Metadata

1. Go to **Table Editor** → `books`
2. Click **Insert Row**
3. Fill in fields:
   ```
   title: Test Book
   slug: test-book
   author: Test Author
   description: A test book for development
   language: en
   script: latin
   content_type: epub
   epub_file_path: abc123.epub
   cover_image_path: abc123.jpg
   category: Children's Stories
   status: published
   file_size_bytes: 1048576 (1 MB)
   page_count: 50
   ```
4. Click **Save**

---

## Verification Checklist

Before continuing with app development, verify:

- [ ] Supabase project created
- [ ] All 3 migrations run successfully (001, 002, 003)
- [ ] All tables visible in Table Editor
- [ ] Storage buckets created (book-covers, book-files)
- [ ] `.env` file updated with project URL and anon key
- [ ] Admin user created
- [ ] (Optional) Test book uploaded

---

## Troubleshooting

### Migration Failed with "relation already exists"

This means you tried to run the migration twice. You can either:
1. Drop the database and start fresh (destructive)
2. Comment out the failing parts and run the rest

### Can't See Storage Buckets

1. Make sure migration 003 ran successfully
2. Check SQL Editor for errors
3. Manually create buckets:
   - Go to Storage → New Bucket
   - Name: `book-covers`, Public: ✅
   - Name: `book-files`, Public: ✅

### RLS Policies Not Working

1. Verify migration 002 ran successfully
2. Check Authentication → Policies
3. Test with SQL Editor:
   ```sql
   -- Test as anonymous
   SELECT * FROM books WHERE status = 'published';
   ```

---

## Next Steps

Once Supabase is set up:

1. **Restart your Expo development server**
   ```bash
   npm start -- --clear
   ```

2. **Test the API connection**
   - The app should now be able to fetch books from Supabase
   - Check console for any connection errors

3. **Continue with app development**
   - Navigation setup
   - Home screen with book browsing
   - Book detail and reader screens

---

## Cost Estimate

**Supabase Free Tier:**
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth per month
- 50,000 monthly active users

**This is sufficient for:**
- ~50-100 small books (~15 MB each)
- ~100-500 active users
- Development and initial testing

**When to upgrade to Pro ($25/month):**
- 100+ books
- 500+ active users
- 5 GB+ bandwidth needed

# Quick Start Guide

Get your app running with real data in 5 minutes!

---

## 🚀 Quick Setup (First Time)

### 1. Run Database Migrations (One Time Only)

In Supabase Dashboard → SQL Editor:

```sql
-- Run each file in order:
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_rls_policies.sql
3. supabase/migrations/003_storage_setup.sql
```

### 2. Add Test Books

In Supabase Dashboard → SQL Editor:

```sql
-- Copy and run: supabase/quick_test_books.sql
-- This adds 5 test books
```

### 3. Update .env File

Check that your `.env` has the **complete** anon key:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ucgryycirirxjskfhqes.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get the full key from: Supabase → Settings → API → anon/public key

### 4. Restart App

```bash
npm start -- --clear
```

---

## ✅ What Should Work Now

- Browse books (should see 5 books)
- Filter by category
- Search books
- Tap book → see details
- Pull to refresh
- Favorite buttons

---

## 🐛 Common Issues

### "No books found"
- ✅ Check: Did you run `quick_test_books.sql`?
- ✅ Check: Is `.env` anon key complete?
- ✅ Check: Did you restart the app?

### "Failed to fetch books"
- ✅ Check: Is Supabase URL correct in `.env`?
- ✅ Check: Did migrations run successfully?
- ✅ Check: Run `supabase/verify_setup.sql` to check database

### App crashes
- ✅ Check: Run `npx tsc --noEmit` for TypeScript errors
- ✅ Check: Clear cache with `npm start -- --clear`

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `supabase/quick_test_books.sql` | Add 5 test books (fastest) |
| `supabase/seed_test_books.sql` | Add 14 test books with translations |
| `supabase/verify_setup.sql` | Check if database is set up correctly |
| `docs/TESTING_GUIDE.md` | Detailed testing instructions |
| `docs/SUPABASE_SETUP.md` | Complete Supabase setup guide |
| `.env` | Supabase credentials |

---

## 🎯 Test Checklist

- [ ] Migrations ran (3 files)
- [ ] Test books added (5 or 14)
- [ ] `.env` updated with full anon key
- [ ] App restarted
- [ ] Books visible on Browse screen
- [ ] Category filtering works
- [ ] Search works
- [ ] Book detail navigation works

---

## 📚 What's Implemented

**Sprint 0: Foundation** ✅
- Expo project with TypeScript
- Supabase client configured
- Database schema designed
- API layer implemented

**Sprint 1: UI & Navigation** ✅
- Modern UI with theme system
- Bottom tab navigation (4 tabs)
- Professional Ionicons
- HomeScreen with sample data
- ProfileScreen, LibraryScreen, SearchScreen

**Sprint 2: Real Data (CURRENT)** ✅
- Connected to Supabase
- Fetch books from database
- Category filtering with counts
- Search functionality
- Loading/error/empty states
- BookDetailScreen with full info
- Navigation between screens

---

## 🔜 Coming Next

**Sprint 3: Downloads & Offline**
- Download books to device
- SQLite for local storage
- Offline reading
- Cache management

**Sprint 4: EPUB Reader**
- Read EPUB books
- Reading progress (CFI-based)
- Font size, themes
- Bookmarks

**Sprint 5: Authentication & Sync**
- Login/signup (optional)
- Migrate anonymous data
- Cross-device sync

---

## 💡 Pro Tips

1. **Use verify_setup.sql** before testing to catch issues early
2. **Check console logs** in Metro bundler for detailed errors
3. **Use Supabase SQL Editor** to query data directly when debugging
4. **Pull to refresh** in the app to reload data after changes

---

## 🆘 Need Help?

1. Read detailed instructions: `docs/TESTING_GUIDE.md`
2. Check Supabase setup: `docs/SUPABASE_SETUP.md`
3. Verify database: Run `supabase/verify_setup.sql`
4. Check console for errors

---

**Ready? Start with Step 1 above!** 🎉

# Sprint 4: PDF Reader Implementation

**Date**: January 14, 2026
**Status**: ✅ COMPLETE

## Overview

Sprint 4 implements a PDF reader using **react-native-pdf** library with native support through Expo Config Plugins.

## Architecture

```
React Native
 └── PDFReaderScreen.tsx
      └── react-native-pdf (Native Module)
           └── Platform-specific PDF rendering
                ├── iOS: PDFKit
                └── Android: Android PdfRenderer
```

**Key Principle**: Uses native PDF rendering for best performance and compatibility.

## What Was Implemented

### ✅ 1. Dependency Installation

**Packages Installed**:
- `react-native-pdf` - Native PDF viewer component
- `react-native-blob-util` - Required dependency for file handling
- `@config-plugins/react-native-pdf` - Expo config plugin
- `@config-plugins/react-native-blob-util` - Expo config plugin

**Configuration** (app.json):
```json
{
  "plugins": [
    "@config-plugins/react-native-pdf",
    "@config-plugins/react-native-blob-util"
  ]
}
```

### ✅ 2. Database Schema Updates

**Version 2 Migration** (`src/services/database/schema.ts`):
- Added `pdf_uri` column to `local_books` table
- Added `current_page` column to `local_reading_progress` table
- Added `total_pages` column to `local_reading_progress` table
- Updated `DATABASE_VERSION` from 1 to 2

**Migration Support**:
- Added migration system to database service
- Automatic migration on app startup
- Uses `PRAGMA user_version` to track database version

### ✅ 3. Type Definitions Updated

**Book Types** (`src/types/book.ts`):
- Added `'pdf'` to `ContentType` union type
- Added `pdf_file_path: string | null` to `Book` interface
- Added `pdf_uri: string | null` to `LocalBook` interface
- Added `current_page` and `total_pages` to `LocalReadingProgress` interface

### ✅ 4. Download Manager Enhanced

**PDF Support** (`src/services/downloads/downloadManager.ts`):
- Detects content type (PDF vs EPUB)
- Downloads appropriate file format
- Saves to correct database column (`pdf_uri` or `epub_uri`)
- File naming: `{bookId}.pdf` or `{bookId}.epub`

**Logic Flow**:
```
1. Check content_type
2. If 'pdf' → use pdf_file_path, extension '.pdf'
3. If 'epub' → use epub_file_path, extension '.epub'
4. Download to documentDirectory/books/
5. Save URI to appropriate column in local_books
```

### ✅ 5. PDF Reader Screen

**File**: `src/screens/reader/PDFReaderScreen.tsx`

**Features**:
- ✅ Loads PDF from local file system
- ✅ Displays current page number
- ✅ Page-based navigation (tap/swipe)
- ✅ Automatic progress tracking
- ✅ Saves progress on page turn
- ✅ Saves progress on unmount
- ✅ Restores reading position on reopen
- ✅ Custom header with back button
- ✅ Loading and error states
- ✅ Page indicator overlay

**PDF Component Props**:
```tsx
<Pdf
  source={{ uri: pdfSource, cache: true }}
  page={currentPage}
  onLoadComplete={handleLoadComplete}
  onPageChanged={handlePageChanged}
  onError={handleError}
  style={styles.pdf}
  trustAllCerts={false}
  enablePaging={true}
  horizontal={false}
  spacing={0}
  fitPolicy={0} // Fit to width
/>
```

### ✅ 6. Navigation Integration

**Updated**: `src/navigation/BrowseStackNavigator.tsx`
- Added `PDFReaderScreen` import
- Added `Reader` screen to stack navigator
- Set `headerShown: false` (custom header in screen)

**Updated**: `src/screens/home/BookDetailScreen.tsx`
- Modified `handleRead()` to navigate to Reader
- Passes `bookId` as route parameter

### ✅ 7. Reading Progress Tracking

**Progress Calculation**:
```typescript
const progressPercent = Math.round((currentPage / totalPages) * 100);
```

**Storage** (SQLite):
```sql
INSERT INTO local_reading_progress
  (book_id, current_page, total_pages, progress_percent, last_read_at, synced_to_cloud, user_id)
VALUES (?, ?, ?, ?, datetime('now'), 0, NULL)
ON CONFLICT(book_id, user_id) DO UPDATE SET
  current_page = excluded.current_page,
  total_pages = excluded.total_pages,
  progress_percent = excluded.progress_percent,
  last_read_at = excluded.last_read_at,
  synced_to_cloud = 0
```

**Auto-Save Triggers**:
1. On page turn (via `onPageChanged` callback)
2. On screen unmount (via `useEffect` cleanup)

## Data Flow

### Load Flow
```
BookDetailScreen
 → "Read Now" button pressed
 → Navigate to Reader screen with bookId
 → PDFReaderScreen loads
     → Query: SELECT pdf_uri FROM local_books WHERE id = ?
     → Query: SELECT current_page FROM local_reading_progress WHERE book_id = ?
     → Normalize file path (file://)
     → Render PDF with react-native-pdf
     → Set page={currentPage} to restore position
```

### Save Flow
```
react-native-pdf
 → User swipes/taps to change page
 → onPageChanged(page, totalPages) fires
 → saveReadingProgress()
     → Calculate progress_percent
     → UPSERT INTO local_reading_progress
         (book_id, current_page, total_pages, progress_percent, ...)
```

## Files Created/Modified

### Created
- ✅ `src/screens/reader/PDFReaderScreen.tsx`
- ✅ `docs/SPRINT_4_IMPLEMENTATION.md` (this file)

### Modified
- ✅ `app.json` - Added Expo config plugins
- ✅ `package.json` - Added dependencies
- ✅ `src/types/book.ts` - Added PDF types
- ✅ `src/services/database/schema.ts` - Database v2 migration
- ✅ `src/services/database/index.ts` - Migration system
- ✅ `src/services/downloads/downloadManager.ts` - PDF support
- ✅ `src/navigation/BrowseStackNavigator.tsx` - Added Reader screen
- ✅ `src/screens/home/BookDetailScreen.tsx` - Navigate to Reader

## Sprint 4 Success Criteria

| Criteria | Status |
|----------|--------|
| ✅ PDF opens | Implemented |
| ✅ Text is readable | Native rendering |
| ✅ Page turns work | Swipe/tap navigation |
| ✅ App restart restores position | Page-based save/restore |
| ✅ No crashes | Error handling implemented |
| ✅ Cross-platform | iOS & Android support |
| ✅ Page progress tracking | Auto-save on page turn |

## Technical Decisions

### Why react-native-pdf?

**Pros**:
- Native PDF rendering (PDFKit on iOS, PdfRenderer on Android)
- Excellent performance
- Works with Expo via config plugins
- Active maintenance
- Page-based navigation (simpler than EPUB CFI)

**Cons**:
- Requires custom development client (can't use Expo Go)
- Native module (larger app size)

**Alternative Considered**: `rn-pdf-reader-js`
- Would work in Expo Go
- But uses WebView with PDF.js (slower performance)
- Limited features compared to native solution

### Why Page-Based Progress?

PDF files have fixed pages, unlike EPUB's virtual pages. This makes progress tracking simpler:
- Each page has a number (1, 2, 3, ...)
- Progress = current_page / total_pages * 100
- No need for complex CFI (Canonical Fragment Identifier)
- Easier to display to users ("Page 5 of 20")

### Why file:// Protocol?

PDFs are stored locally via expo-file-system:
- Files saved to `documentDirectory/books/{bookId}.pdf`
- react-native-pdf accepts `file://` URIs
- No need for HTTP server or base64 encoding
- Direct file access for best performance

## Testing Instructions

### Prerequisites
1. Have a PDF book in Supabase database
2. Book must have `content_type = 'pdf'`
3. Book must have valid `pdf_file_path` in Supabase Storage

### Test Steps

**1. Build with Native Modules**:
```bash
# For development build
npx expo prebuild
npx expo run:ios    # or npx expo run:android

# OR use EAS Build
eas build --profile development --platform ios
```

**Important**: You must use a custom development client or standalone build. Expo Go does NOT support native modules.

**2. Download a PDF book**:
- Open app
- Go to Browse tab
- Tap on a book with `content_type = 'pdf'`
- Tap "Download" button
- Wait for download to complete

**3. Open the PDF reader**:
- Tap "Read Now" button
- PDF should load and display

**4. Test page navigation**:
- Swipe left → next page
- Swipe right → previous page
- OR tap right side → next page
- OR tap left side → previous page

**5. Test progress save**:
- Navigate to page 5 (or any page)
- Close reader (tap back button)
- Verify console log: "Progress saved: Page 5/X (Y%)"

**6. Test progress restore**:
- Re-open the same book
- Should open to page 5 (last position)
- Verify console log: "Current version: 2"

**7. Verify database**:
```sql
-- Check book was downloaded
SELECT id, title, pdf_uri FROM local_books;

-- Check progress was saved
SELECT book_id, current_page, total_pages, progress_percent
FROM local_reading_progress;
```

## Known Limitations

### Sprint 4 Scope (Intentional)
- ❌ No reader settings (theme, font size - not applicable to PDF)
- ❌ No table of contents navigation
- ❌ No bookmarks
- ❌ No highlights/annotations
- ❌ No search within PDF
- ❌ No zoom controls (uses default pinch-to-zoom)
- ❌ No sync to Supabase (offline only, Sprint 5)

## Troubleshooting

### Issue: "Book not found in local database"
**Cause**: Book not downloaded yet
**Solution**: Download book first from BookDetailScreen

### Issue: "PDF file not downloaded"
**Cause**: `pdf_uri` is NULL in database
**Solution**: Ensure download completed successfully, check `local_books` table

### Issue: "Failed to load PDF file" in Reader
**Cause**: Invalid file path or PDF corruption
**Solution**:
- Check console logs for pdf_uri
- Verify file exists at path: `ls "$(dirname pdf_uri)"`
- Try re-downloading book
- Verify PDF is valid (not corrupted)

### Issue: Reader shows blank screen
**Cause**: react-native-pdf not linked properly
**Solution**:
- Ensure you ran `npx expo prebuild`
- Check app.json has plugins configured
- Rebuild app: `npx expo run:ios` or `npx expo run:android`

### Issue: Position not restored
**Cause**: current_page not saved or database migration failed
**Solution**:
- Check console for "Current version: 2"
- Verify migration ran: `SELECT user_version FROM pragma_user_version`
- Check reading_progress table: `SELECT * FROM local_reading_progress`

### Issue: "Module not found: react-native-pdf"
**Cause**: Using Expo Go (doesn't support native modules)
**Solution**: Use custom development client or EAS Build

## Console Logs Reference

**Successful Load**:
```
[Database] Current version: 2, Target version: 2
[Database] Database initialized successfully
PDF loaded successfully with 50 pages
Page changed: 1/50
```

**Successful Progress Save**:
```
Page changed: 5/50
Progress saved: Page 5/50 (10%)
```

**Error Example**:
```
Failed to load book: Book not found in local database
PDF error: [error details]
```

## Next Steps (Future Sprints)

### Sprint 4B (Optional PDF Enhancements)
- PDF bookmarks
- PDF table of contents extraction
- Search within PDF
- Text selection and highlighting

### Sprint 5 (Authentication & Sync)
- User authentication
- Sync reading progress to Supabase
- Sync across devices
- Migrate anonymous data on login

## Dependencies Reference

```json
{
  "dependencies": {
    "react-native-pdf": "^6.x",
    "react-native-blob-util": "^0.x"
  },
  "devDependencies": {
    "@config-plugins/react-native-pdf": "^8.x",
    "@config-plugins/react-native-blob-util": "^8.x"
  }
}
```

## Sources

Research for PDF library selection:
- [How to View PDF in Expo (React Native)](https://withfra.me/react-native-tutorials/how-to-view-pdf-in-react-native)
- [react-native-pdf on npm](https://www.npmjs.com/package/react-native-pdf)
- [GitHub: xcarpentier/rn-pdf-reader-js](https://github.com/xcarpentier/rn-pdf-reader-js)

## Conclusion

Sprint 4 is **COMPLETE**. The implementation provides:
- ✅ Working PDF reader using react-native-pdf
- ✅ Page-based reading position tracking
- ✅ Offline reading support
- ✅ Anonymous user support
- ✅ Automatic progress save/restore
- ✅ Native PDF rendering for best performance
- ✅ Cross-platform (iOS & Android)

**Ready for testing with downloaded PDF books!**

**Note**: Requires custom development client or EAS Build (not compatible with Expo Go).

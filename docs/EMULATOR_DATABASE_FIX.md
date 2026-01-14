# Emulator Database Fix

## Problem

If you see this error on the emulator:

```
ERROR [Database] Migration failed: duplicate column name: pdf_uri
ERROR [Database] Failed to initialize
ERROR [App] Failed to initialize app
```

This happens when the database was partially migrated or created with an older schema version.

## Solution

The code now automatically handles this by checking if columns exist before adding them. However, if you still see this error, follow these steps:

### Method 1: Clear App Data (Recommended)

#### Android Emulator:
1. Long press the app icon
2. Select "App info"
3. Tap "Storage"
4. Tap "Clear storage" or "Clear data"
5. Restart the app

#### iOS Simulator:
1. Stop the app
2. In Terminal, run:
   ```bash
   xcrun simctl uninstall booted com.yourcompany.yazidilibrary
   ```
3. Or simply delete the app from the simulator
4. Rebuild and run:
   ```bash
   npx expo run:ios
   ```

### Method 2: Reset Database via Code (For Testing)

If you need to reset the database programmatically during development:

1. Add a reset button in your app (temporarily):

```typescript
import { database } from '@/services/database';

// In your component:
const handleResetDatabase = async () => {
  try {
    await database.reset();
    console.log('Database reset successful');
    // Restart the app or reload the screen
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
};

// Add a button:
<Button title="Reset Database" onPress={handleResetDatabase} />
```

2. Tap the button to reset the database
3. Restart the app

### Method 3: Delete Database File

#### Android:
```bash
adb shell
cd /data/data/com.yourcompany.yazidilibrary/databases/
rm yazidi_library.db
exit
```

Then restart the app.

#### iOS:
The easiest way is to delete the app from the simulator and reinstall.

## What Was Fixed

The migration system now:
1. Checks if columns exist before adding them using `PRAGMA table_info()`
2. Only adds columns that don't exist
3. Handles both fresh installs and existing databases correctly

This means the error should not occur anymore on fresh installs or updates.

## Verification

After fixing, you should see logs like:

```
LOG [App] Initializing app...
LOG [Database] Initializing SQLite database...
LOG [Database] Current version: 0, Target version: 2
LOG [Database] Running migration to version 2...
LOG [Database] Adding pdf_uri column to local_books...
LOG [Database] Adding current_page column to local_reading_progress...
LOG [Database] Adding total_pages column to local_reading_progress...
LOG [Database] Migration to version 2 complete
LOG [Database] Database initialized successfully
```

Or if columns already exist:

```
LOG [Database] Current version: 0, Target version: 2
LOG [Database] Running migration to version 2...
LOG [Database] Migration to version 2 complete
```

No errors should appear!

## Why This Happens

1. **Fresh Install**: When the app is first installed, `CREATE_TABLES` runs which already includes `pdf_uri`, `current_page`, and `total_pages` columns. The database version is set to 0.

2. **Migration Run**: Then the migration system runs, sees version 0, and tries to run migration v2 which attempts to add these columns again.

3. **Conflict**: SQLite errors because the columns already exist.

The fix ensures that migrations check for column existence before adding them, making the process idempotent (safe to run multiple times).

## For Real Devices

Your Android phone works because it likely:
- Has a clean database from a fresh install, OR
- The timing of when you installed meant the columns were added correctly

The emulator likely had a partially migrated database from previous testing.

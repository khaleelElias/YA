/**
 * SQLite Database Service
 *
 * Manages local database for offline storage:
 * - Downloaded books
 * - Reading progress
 * - Bookmarks
 * - Sync queue
 *
 * IMPORTANT: Works for anonymous users!
 * - Data stored locally without authentication
 * - Migrated to cloud when user signs up/logs in
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, DATABASE_VERSION, CREATE_TABLES, DROP_TABLES, migrations } from './schema';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  /**
   * Initialize database connection and create tables
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('[Database] Initializing SQLite database...');

      // Open database connection
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Create tables
      await this.db.execAsync(CREATE_TABLES);

      // Run migrations
      await this.runMigrations();

      this.initialized = true;
      console.log('[Database] Database initialized successfully');
    } catch (error) {
      console.error('[Database] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Check if a column exists in a table
   */
  private async columnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
      const result = await this.db!.getAllAsync<{ name: string }>(
        `PRAGMA table_info(${tableName})`
      );
      return result.some((col) => col.name === columnName);
    } catch (error) {
      console.error(`[Database] Error checking column ${tableName}.${columnName}:`, error);
      return false;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    try {
      // Get current database version
      const result = await this.db!.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
      );
      const currentVersion = result?.user_version || 0;

      console.log(`[Database] Current version: ${currentVersion}, Target version: ${DATABASE_VERSION}`);

      // Run migrations in order
      for (let version = currentVersion + 1; version <= DATABASE_VERSION; version++) {
        if (migrations[version]) {
          console.log(`[Database] Running migration to version ${version}...`);

          // Special handling for version 2 (PDF support)
          if (version === 2) {
            // Only add columns if they don't exist
            const hasPdfUri = await this.columnExists('local_books', 'pdf_uri');
            const hasCurrentPage = await this.columnExists('local_reading_progress', 'current_page');
            const hasTotalPages = await this.columnExists('local_reading_progress', 'total_pages');

            if (!hasPdfUri) {
              console.log('[Database] Adding pdf_uri column to local_books...');
              await this.db!.execAsync('ALTER TABLE local_books ADD COLUMN pdf_uri TEXT');
            }
            if (!hasCurrentPage) {
              console.log('[Database] Adding current_page column to local_reading_progress...');
              await this.db!.execAsync('ALTER TABLE local_reading_progress ADD COLUMN current_page INTEGER');
            }
            if (!hasTotalPages) {
              console.log('[Database] Adding total_pages column to local_reading_progress...');
              await this.db!.execAsync('ALTER TABLE local_reading_progress ADD COLUMN total_pages INTEGER');
            }
          } else {
            // Run other migrations normally
            await this.db!.execAsync(migrations[version]);
          }

          await this.db!.execAsync(`PRAGMA user_version = ${version}`);
          console.log(`[Database] Migration to version ${version} complete`);
        }
      }
    } catch (error) {
      console.error('[Database] Migration failed:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   * Ensures database is initialized before use
   */
  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.initialized || !this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  /**
   * Reset database (drop and recreate all tables)
   * WARNING: This deletes ALL local data!
   */
  async reset(): Promise<void> {
    try {
      console.log('[Database] Resetting database...');
      const db = await this.getDatabase();

      // Drop all tables
      await db.execAsync(DROP_TABLES);

      // Recreate tables
      await db.execAsync(CREATE_TABLES);

      console.log('[Database] Database reset complete');
    } catch (error) {
      console.error('[Database] Failed to reset:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
      console.log('[Database] Database connection closed');
    }
  }

  /**
   * Execute a raw SQL query
   * Use with caution!
   */
  async executeRaw(sql: string, params: any[] = []): Promise<any> {
    const db = await this.getDatabase();
    return await db.runAsync(sql, params);
  }

  /**
   * Execute a SQL query and return all results
   */
  async queryAll<T>(sql: string, params: any[] = []): Promise<T[]> {
    const db = await this.getDatabase();
    return await db.getAllAsync<T>(sql, params);
  }

  /**
   * Execute a SQL query and return first result
   */
  async queryFirst<T>(sql: string, params: any[] = []): Promise<T | null> {
    const db = await this.getDatabase();
    return await db.getFirstAsync<T>(sql, params);
  }
}

// Export singleton instance
export const database = new DatabaseService();
export default database;

// Export helper function for getting database
export const getDatabase = () => database.getDatabase();

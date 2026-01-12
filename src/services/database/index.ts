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
import { DATABASE_NAME, CREATE_TABLES, DROP_TABLES } from './schema';

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

      this.initialized = true;
      console.log('[Database] Database initialized successfully');
    } catch (error) {
      console.error('[Database] Failed to initialize:', error);
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

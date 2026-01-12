/**
 * Download Manager Service - MINIMAL IMPLEMENTATION
 *
 * Sprint 3 Goal: Download ONE EPUB file successfully
 * - Uses modern Expo FileSystem API (SDK 52+)
 * - No pause/resume, no sync queue, no progress callbacks
 * - Simple validation and error handling
 */

import * as FileSystem from 'expo-file-system/legacy';
import { database } from '../database';
import { getBookFileUrl } from '@/api/books';
import type { Book } from '@/types';

/**
 * Download a single book EPUB file to local storage
 *
 * @param book - Book object from Supabase
 * @returns Local file URI of downloaded EPUB
 * @throws Error if epub_file_path is missing or download fails
 */
export async function downloadBook(book: Book): Promise<string> {
  const { id: bookId } = book;

  try {
    console.log(`[DownloadManager] Starting download for book: ${bookId}`);

    // Validate epub_file_path exists
    if (!book.epub_file_path || book.epub_file_path.trim() === '') {
      const errorMsg = 'This book does not have an EPUB file available for download';
      console.error(`[DownloadManager] ${errorMsg}. book.epub_file_path:`, book.epub_file_path);
      throw new Error(errorMsg);
    }

    // Check if already downloaded
    const isDownloaded = await isBookDownloaded(bookId);
    if (isDownloaded) {
      throw new Error('Book is already downloaded');
    }

    // Create books directory if it doesn't exist
    const booksDir = `${FileSystem.documentDirectory}books/`;
    const dirInfo = await FileSystem.getInfoAsync(booksDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
      console.log(`[DownloadManager] Created directory: ${booksDir}`);
    }

    // Get download URL from Supabase Storage
    const epubUrl = await getBookFileUrl(book.epub_file_path);
    console.log(`[DownloadManager] Resolved Supabase URL: ${epubUrl}`);

    if (!epubUrl) {
      throw new Error('Failed to get download URL from Supabase Storage');
    }

    // Download EPUB file
    const destination = `${booksDir}${bookId}.epub`;
    console.log(`[DownloadManager] Downloading to: ${destination}`);

    const downloadResult = await FileSystem.downloadAsync(epubUrl, destination);

    if (!downloadResult || downloadResult.status !== 200) {
      throw new Error(`Download failed with status: ${downloadResult?.status || 'unknown'}`);
    }

    console.log(`[DownloadManager] File downloaded successfully: ${downloadResult.uri}`);

    // Store book metadata in local database
    await saveBookToDatabase(book, downloadResult.uri);

    console.log(`[DownloadManager] Book downloaded and saved: ${bookId}`);
    return downloadResult.uri;
  } catch (error: any) {
    console.error(`[DownloadManager] Failed to download book ${bookId}:`, error);
    throw error;
  }
}

/**
 * Check if a book is already downloaded
 */
export async function isBookDownloaded(bookId: string): Promise<boolean> {
  try {
    const db = await database.getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM local_books WHERE id = ?',
      [bookId]
    );
    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error('[DownloadManager] Failed to check if book is downloaded:', error);
    return false;
  }
}

/**
 * Save book metadata to local database
 */
async function saveBookToDatabase(book: Book, epubUri: string): Promise<void> {
  const db = await database.getDatabase();

  await db.runAsync(
    `INSERT INTO local_books (
      id, title, author, translator, description, language, script, category,
      tags, age_range, content_type, epub_uri, file_size_bytes,
      page_count, downloaded_at, metadata_json, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      book.id,
      book.title,
      book.author || null,
      book.translator || null,
      book.description || null,
      book.language,
      book.script,
      book.category,
      book.tags ? JSON.stringify(book.tags) : null,
      book.age_range || null,
      book.content_type,
      epubUri,
      book.file_size_bytes || null,
      book.page_count || null,
      new Date().toISOString(),
      JSON.stringify(book),
      null, // user_id is null for anonymous users
    ]
  );

  console.log(`[DownloadManager] Book metadata saved to database: ${book.id}`);
}

/**
 * Delete a downloaded book
 */
export async function deleteBook(bookId: string): Promise<void> {
  try {
    console.log(`[DownloadManager] Deleting book: ${bookId}`);

    // Get book info from database
    const db = await database.getDatabase();
    const book = await db.getFirstAsync<{ epub_uri: string | null }>(
      'SELECT epub_uri FROM local_books WHERE id = ?',
      [bookId]
    );

    if (!book) {
      throw new Error('Book not found in local database');
    }

    // Delete EPUB file
    if (book.epub_uri) {
      await FileSystem.deleteAsync(book.epub_uri, { idempotent: true });
    }

    // Delete from database
    await db.runAsync('DELETE FROM local_books WHERE id = ?', [bookId]);

    console.log(`[DownloadManager] Book deleted successfully: ${bookId}`);
  } catch (error) {
    console.error(`[DownloadManager] Failed to delete book ${bookId}:`, error);
    throw error;
  }
}

/**
 * Get all downloaded books
 */
export async function getDownloadedBooks(): Promise<Book[]> {
  try {
    const db = await database.getDatabase();
    const books = await db.getAllAsync<{ metadata_json: string }>(
      'SELECT metadata_json FROM local_books ORDER BY downloaded_at DESC'
    );

    return books.map((row) => JSON.parse(row.metadata_json));
  } catch (error) {
    console.error('[DownloadManager] Failed to get downloaded books:', error);
    return [];
  }
}

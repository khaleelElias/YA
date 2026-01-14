/**
 * Download Manager Service - MINIMAL IMPLEMENTATION
 *
 * Sprint 3-4 Goal: Download EPUB or PDF files successfully
 * - Uses modern Expo FileSystem API (SDK 52+)
 * - No pause/resume, no sync queue, no progress callbacks
 * - Simple validation and error handling
 * - Supports both EPUB and PDF formats
 */

import * as FileSystem from 'expo-file-system/legacy';
import { database } from '../database';
import { getBookFileUrl } from '@/api/books';
import type { Book } from '@/types';

/**
 * Download a single book file (EPUB or PDF) to local storage
 *
 * @param book - Book object from Supabase
 * @returns Local file URI of downloaded file
 * @throws Error if file path is missing or download fails
 */
export async function downloadBook(book: Book): Promise<string> {
  const { id: bookId, content_type } = book;

  try {
    console.log(`[DownloadManager] Starting download for book: ${bookId} (${content_type})`);

    // Determine file path and extension based on content type
    let filePath: string | null;
    let fileExtension: string;

    if (content_type === 'pdf') {
      filePath = book.pdf_file_path;
      fileExtension = 'pdf';
    } else {
      filePath = book.epub_file_path;
      fileExtension = 'epub';
    }

    // Validate file path exists
    if (!filePath || filePath.trim() === '') {
      const errorMsg = `This book does not have a ${fileExtension.toUpperCase()} file available for download`;
      console.error(`[DownloadManager] ${errorMsg}. file_path:`, filePath);
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
    const fileUrl = await getBookFileUrl(filePath);
    console.log(`[DownloadManager] Resolved Supabase URL: ${fileUrl}`);

    if (!fileUrl) {
      throw new Error('Failed to get download URL from Supabase Storage');
    }

    // Download file
    const destination = `${booksDir}${bookId}.${fileExtension}`;
    console.log(`[DownloadManager] Downloading to: ${destination}`);

    const downloadResult = await FileSystem.downloadAsync(fileUrl, destination);

    if (!downloadResult || downloadResult.status !== 200) {
      throw new Error(`Download failed with status: ${downloadResult?.status || 'unknown'}`);
    }

    console.log(`[DownloadManager] File downloaded successfully: ${downloadResult.uri}`);

    // Store book metadata in local database
    await saveBookToDatabase(book, downloadResult.uri, fileExtension);

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
async function saveBookToDatabase(book: Book, fileUri: string, fileType: string): Promise<void> {
  const db = await database.getDatabase();

  const epubUri = fileType === 'epub' ? fileUri : null;
  const pdfUri = fileType === 'pdf' ? fileUri : null;

  await db.runAsync(
    `INSERT INTO local_books (
      id, title, author, translator, description, language, script, category,
      tags, age_range, content_type, epub_uri, pdf_uri, file_size_bytes,
      page_count, downloaded_at, metadata_json, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      pdfUri,
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
    const book = await db.getFirstAsync<{ epub_uri: string | null; pdf_uri: string | null }>(
      'SELECT epub_uri, pdf_uri FROM local_books WHERE id = ?',
      [bookId]
    );

    if (!book) {
      throw new Error('Book not found in local database');
    }

    // Delete EPUB file if exists
    if (book.epub_uri) {
      await FileSystem.deleteAsync(book.epub_uri, { idempotent: true });
    }

    // Delete PDF file if exists
    if (book.pdf_uri) {
      await FileSystem.deleteAsync(book.pdf_uri, { idempotent: true });
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

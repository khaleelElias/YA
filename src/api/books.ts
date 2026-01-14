/**
 * Books API
 *
 * IMPORTANT: All book fetching functions work for ANONYMOUS users
 * - Public access to published books
 * - No authentication required for browsing
 * - Class-specific books excluded for anonymous users
 */

import { supabase } from './supabase';
import type { Book, BooksQueryOptions, ApiResponse, PaginatedResponse } from '@/types';

/**
 * Fetch all published books
 * Works for anonymous users (excludes class-specific books)
 */
export async function fetchPublishedBooks(
  options: BooksQueryOptions = {}
): Promise<PaginatedResponse<Book>> {
  try {
    const {
      language,
      category,
      search,
      tags,
      page = 0,
      pageSize = 20,
      sortBy = 'published_at',
      sortOrder = 'desc',
    } = options;

    // Start query
    let query = supabase
      .from('books')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    // Apply filters
    if (language) {
      query = query.eq('language', language);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      // Full-text search on title, description, author
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`
      );
    }

    if (tags && tags.length > 0) {
      // Match any of the provided tags
      query = query.overlaps('tags', tags);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          pageSize,
          hasMore: false,
        },
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    const total = count || 0;
    const hasMore = to < total - 1;

    return {
      data: data || [],
      meta: {
        total,
        page,
        pageSize,
        hasMore,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching published books:', error);
    return {
      data: [],
      meta: {
        total: 0,
        page: options.page || 0,
        pageSize: options.pageSize || 20,
        hasMore: false,
      },
      error: {
        message: error.message || 'Failed to fetch books',
      },
    };
  }
}

/**
 * Fetch a single book by ID
 * Works for anonymous users
 */
export async function fetchBookById(bookId: string): Promise<ApiResponse<Book>> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('status', 'published')
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching book by ID:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to fetch book',
      },
    };
  }
}

/**
 * Fetch book translations
 * Given a book, fetch all books in the same translation group
 */
export async function fetchBookTranslations(
  translationGroupId: string
): Promise<ApiResponse<Book[]>> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('translation_group_id', translationGroupId)
      .eq('status', 'published')
      .order('language', { ascending: true });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return {
      data: data || [],
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching book translations:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to fetch translations',
      },
    };
  }
}

/**
 * Fetch books by category
 * Works for anonymous users
 */
export async function fetchBooksByCategory(
  category: string,
  options: Omit<BooksQueryOptions, 'category'> = {}
): Promise<PaginatedResponse<Book>> {
  return fetchPublishedBooks({ ...options, category });
}

/**
 * Search books by query
 * Works for anonymous users
 */
export async function searchBooks(
  searchQuery: string,
  options: Omit<BooksQueryOptions, 'search'> = {}
): Promise<PaginatedResponse<Book>> {
  return fetchPublishedBooks({ ...options, search: searchQuery });
}

/**
 * Fetch book categories with counts
 * Returns list of categories and number of published books in each
 */
export async function fetchCategories(): Promise<
  ApiResponse<Array<{ category: string; count: number }>>
> {
  try {
    // Use Postgres aggregation
    const { data, error } = await supabase.rpc('get_book_categories');

    if (error) {
      // Fallback: Fetch all books and group manually
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('category')
        .eq('status', 'published');

      if (booksError) {
        return {
          data: null,
          error: {
            message: booksError.message,
            code: booksError.code,
          },
        };
      }

      // Count books per category
      const categoryCounts: Record<string, number> = {};
      books?.forEach((book) => {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      });

      const categories = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
      }));

      return {
        data: categories,
        error: null,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to fetch categories',
      },
    };
  }
}

/**
 * Get download URL for book file
 * Works for anonymous users (public bucket access)
 */
export async function getBookFileUrl(filePath: string): Promise<string | null> {
  try {
    // Using 'book-files' bucket as shown in Supabase Storage
    const { data } = supabase.storage.from('book-files').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting book file URL:', error);
    return null;
  }
}

/**
 * Get download URL for book cover
 * Works for anonymous users (public bucket access)
 */
export async function getBookCoverUrl(coverPath: string): Promise<string | null> {
  try {
    const { data } = supabase.storage.from('book-covers').getPublicUrl(coverPath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting book cover URL:', error);
    return null;
  }
}

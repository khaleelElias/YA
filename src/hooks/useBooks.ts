/**
 * useBooks Hook
 *
 * Custom hook for fetching and managing books data
 * Supports filtering by category, language, and search
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchPublishedBooks, fetchCategories } from '@/api/books';
import type { Book, BooksQueryOptions } from '@/types';

interface UseBooksOptions extends BooksQueryOptions {
  enabled?: boolean; // Whether to auto-fetch on mount
}

interface UseBooksReturn {
  books: Book[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
}

/**
 * Hook to fetch and manage books
 *
 * @example
 * const { books, loading, error, refetch } = useBooks({ category: 'Stories' });
 */
export function useBooks(options: UseBooksOptions = {}): UseBooksReturn {
  const { enabled = true, ...queryOptions } = options;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const fetchBooks = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchPublishedBooks({
        ...queryOptions,
        page: pageNum,
      });

      if (response.error) {
        setError(response.error.message);
        setBooks([]);
        setTotal(0);
        setHasMore(false);
      } else {
        setBooks(append ? [...books, ...response.data] : response.data);
        setTotal(response.meta.total);
        setHasMore(response.meta.hasMore);
        setPage(pageNum);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch books');
      setBooks([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [enabled, queryOptions, books]);

  const refetch = useCallback(async () => {
    await fetchBooks(0, false);
  }, [fetchBooks]);

  const fetchMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchBooks(page + 1, true);
  }, [hasMore, loading, page, fetchBooks]);

  // Auto-fetch on mount or when options change
  useEffect(() => {
    fetchBooks(0, false);
  }, [
    enabled,
    queryOptions.category,
    queryOptions.language,
    queryOptions.search,
    queryOptions.tags?.join(','),
  ]);

  return {
    books,
    loading,
    error,
    total,
    hasMore,
    refetch,
    fetchMore,
  };
}

/**
 * Hook to fetch book categories
 */
interface UseCategoriesReturn {
  categories: Array<{ category: string; count: number }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoriesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCategories();

      if (response.error) {
        setError(response.error.message);
        setCategories([]);
      } else {
        setCategories(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchCategoriesData();
  }, [fetchCategoriesData]);

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch,
  };
}

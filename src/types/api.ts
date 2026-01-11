/**
 * API Response Types
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * API Error
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  error: ApiError | null;
}

/**
 * Books query filters
 */
export interface BooksQueryFilters {
  language?: 'ku' | 'ar' | 'en' | 'de';
  category?: string;
  search?: string;
  tags?: string[];
  status?: 'published' | 'draft' | 'hidden';
}

/**
 * Books query options
 */
export interface BooksQueryOptions extends BooksQueryFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'title' | 'created_at' | 'published_at';
  sortOrder?: 'asc' | 'desc';
}

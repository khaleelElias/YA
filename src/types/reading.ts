/**
 * Reading-related types
 */

/**
 * Reader theme
 */
export type ReaderTheme = 'light' | 'dark' | 'sepia';

/**
 * Font size options
 */
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Reader settings
 */
export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: FontSize;
  lineHeight: number;
  fontFamily?: string;
}

/**
 * Download status
 */
export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'failed' | 'paused';

/**
 * Download progress
 */
export interface DownloadProgress {
  bookId: string;
  status: DownloadStatus;
  progress: number; // 0-1
  downloadedBytes: number;
  totalBytes: number;
  error?: string;
}

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

/**
 * Network status
 */
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

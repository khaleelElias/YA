import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { Ionicons } from '@expo/vector-icons';
import { BrowseStackScreenProps } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import { getDatabase } from '@/services/database';

type Props = BrowseStackScreenProps<'Reader'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PDFReaderScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [initialPage, setInitialPage] = useState(1); // Track initial page separately
  const pdfRef = useRef<any>(null);
  const currentPageRef = useRef(1); // Use ref to avoid re-renders
  const totalPagesRef = useRef(0);

  useEffect(() => {
    loadBook();
  }, [bookId]);

  // Separate effect for cleanup to avoid re-running on every state change
  useEffect(() => {
    return () => {
      // Save progress on unmount using refs
      saveReadingProgressSync();
    };
  }, []);

  const loadBook = async () => {
    setLoading(true);
    setError(null);

    try {
      const db = await getDatabase();

      // Get book from local database
      const result = await db.getAllAsync(
        'SELECT * FROM local_books WHERE id = ?',
        [bookId]
      );

      if (!result || result.length === 0) {
        setError('Book not found in local database');
        setLoading(false);
        return;
      }

      const bookData = result[0] as any;

      if (!bookData.pdf_uri) {
        setError('PDF file not downloaded');
        setLoading(false);
        return;
      }

      setBook(bookData);

      // Load reading progress
      const progressResult = await db.getAllAsync(
        'SELECT * FROM local_reading_progress WHERE book_id = ? AND user_id IS NULL',
        [bookId]
      );

      if (progressResult && progressResult.length > 0) {
        const progress = progressResult[0] as any;
        if (progress.current_page) {
          const savedPage = progress.current_page;
          setInitialPage(savedPage); // Set initial page for PDF component
          setCurrentPage(savedPage);
          currentPageRef.current = savedPage;
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load book:', err);
      setError(err.message || 'Failed to load book');
      setLoading(false);
    }
  };

  // Synchronous version for cleanup
  const saveReadingProgressSync = () => {
    const page = currentPageRef.current;
    const pages = totalPagesRef.current;

    if (!bookId || page === 0 || pages === 0) return;

    // Use async immediately invoked function
    (async () => {
      try {
        const db = await getDatabase();
        const progressPercent = Math.round((page / pages) * 100);

        await db.runAsync(
          `INSERT INTO local_reading_progress
           (book_id, current_page, total_pages, progress_percent, last_read_at, synced_to_cloud, user_id)
           VALUES (?, ?, ?, ?, datetime('now'), 0, NULL)
           ON CONFLICT(book_id, user_id) DO UPDATE SET
             current_page = excluded.current_page,
             total_pages = excluded.total_pages,
             progress_percent = excluded.progress_percent,
             last_read_at = excluded.last_read_at,
             synced_to_cloud = 0`,
          [bookId, page, pages, progressPercent]
        );

        console.log(`Progress saved: Page ${page}/${pages} (${progressPercent}%)`);
      } catch (err) {
        console.error('Failed to save reading progress:', err);
      }
    })();
  };

  const saveReadingProgress = async () => {
    const page = currentPageRef.current;
    const pages = totalPagesRef.current;

    if (!bookId || page === 0 || pages === 0) return;

    try {
      const db = await getDatabase();
      const progressPercent = Math.round((page / pages) * 100);

      await db.runAsync(
        `INSERT INTO local_reading_progress
         (book_id, current_page, total_pages, progress_percent, last_read_at, synced_to_cloud, user_id)
         VALUES (?, ?, ?, ?, datetime('now'), 0, NULL)
         ON CONFLICT(book_id, user_id) DO UPDATE SET
           current_page = excluded.current_page,
           total_pages = excluded.total_pages,
           progress_percent = excluded.progress_percent,
           last_read_at = excluded.last_read_at,
           synced_to_cloud = 0`,
        [bookId, page, pages, progressPercent]
      );

      console.log(`Progress saved: Page ${page}/${pages} (${progressPercent}%)`);
    } catch (err) {
      console.error('Failed to save reading progress:', err);
    }
  };

  const handleLoadComplete = (numberOfPages: number) => {
    console.log(`PDF loaded successfully with ${numberOfPages} pages`);
    setTotalPages(numberOfPages);
    totalPagesRef.current = numberOfPages;
  };

  const handlePageChanged = (page: number, numberOfPages: number) => {
    // Update refs immediately (no re-render)
    currentPageRef.current = page;
    totalPagesRef.current = numberOfPages;

    // Update state for UI display only
    setCurrentPage(page);
    setTotalPages(numberOfPages);
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (currentPage > 0 && totalPages > 0) {
      const timeoutId = setTimeout(() => {
        saveReadingProgress();
      }, 1000); // Save 1 second after page change

      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, totalPages]);

  const handleError = (error: any) => {
    console.error('PDF error:', error);
    setError('Failed to load PDF file');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading PDF...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Error State */}
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Book not found'}</Text>
          <Pressable style={styles.retryButton} onPress={loadBook}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Normalize file path
  let pdfSource = book.pdf_uri;
  if (!pdfSource.startsWith('file://')) {
    pdfSource = 'file://' + pdfSource;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={styles.headerButton} />
      </View>

      {/* PDF Viewer */}
      <Pdf
        ref={pdfRef}
        source={{ uri: pdfSource, cache: true }}
        page={initialPage} // Only use for initial load
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

      {/* Page Indicator */}
      {totalPages > 0 && (
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  pdf: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.background,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pageText: {
    ...typography.bodySmall,
    color: colors.surface,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

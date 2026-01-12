import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrowseStackScreenProps } from '@/navigation/types';
import { colors, typography, spacing, layout, shadows } from '@/theme';
import { fetchBookById, getBookCoverUrl } from '@/api/books';
import { downloadBook, deleteBook, isBookDownloaded } from '@/services/downloads/downloadManager';
import type { Book } from '@/types';

type Props = BrowseStackScreenProps<'BookDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_WIDTH = SCREEN_WIDTH * 0.5;
const COVER_HEIGHT = COVER_WIDTH * 1.5;

export default function BookDetailScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadBook();
    checkIfDownloaded();
  }, [bookId]);

  const loadBook = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchBookById(bookId);

      if (response.error || !response.data) {
        setError(response.error?.message || 'Book not found');
        setBook(null);
      } else {
        setBook(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load book');
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const checkIfDownloaded = async () => {
    try {
      const downloaded = await isBookDownloaded(bookId);
      setIsDownloaded(downloaded);
    } catch (error) {
      console.error('Failed to check if book is downloaded:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Save to favorites
  };

  const handleDownload = async () => {
    if (!book) return;

    if (isDownloaded) {
      // Already downloaded - ask if they want to delete
      Alert.alert(
        'Delete Download',
        'This book is already downloaded. Do you want to delete it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteBook(book.id);
                setIsDownloaded(false);
                Alert.alert('Success', 'Book deleted successfully');
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to delete book');
              }
            },
          },
        ]
      );
      return;
    }

    try {
      setIsDownloading(true);

      // Download the book (returns local file URI)
      await downloadBook(book);

      setIsDownloaded(true);
      Alert.alert('Success', 'Book downloaded successfully!');
    } catch (error: any) {
      Alert.alert('Download Failed', error.message || 'Failed to download book');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRead = () => {
    // Reader coming in Sprint 4
    Alert.alert('Reader Coming Soon', 'The EPUB reader will be implemented in Sprint 4!');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error || 'Book not found'}</Text>
        <Pressable style={styles.retryButton} onPress={loadBook}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Book Cover Section */}
        <View style={styles.coverSection}>
          <View style={[styles.coverPlaceholder, { width: COVER_WIDTH, height: COVER_HEIGHT }]}>
            <Text style={styles.coverTitle} numberOfLines={4}>
              {book.title}
            </Text>
          </View>

          {/* Favorite Button */}
          <Pressable style={styles.favoriteButtonLarge} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.error : colors.surface}
            />
          </Pressable>

          {/* Content Type Badge */}
          {book.content_type === 'epub' && (
            <View style={styles.coverBadge}>
              <Text style={styles.coverBadgeText}>EPUB</Text>
            </View>
          )}
        </View>

        {/* Book Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{book.title}</Text>

          {book.author && (
            <Text style={styles.author}>by {book.author}</Text>
          )}

          {book.translator && (
            <Text style={styles.translator}>Translated by {book.translator}</Text>
          )}

          {/* Metadata Pills */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataPill}>
              <Ionicons name="language-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.metadataText}>{getLanguageName(book.language)}</Text>
            </View>

            <View style={styles.metadataPill}>
              <Ionicons name="book-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.metadataText}>{book.category}</Text>
            </View>

            {book.page_count && (
              <View style={styles.metadataPill}>
                <Ionicons name="document-text-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.metadataText}>{book.page_count} pages</Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {book.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {book.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About this book</Text>
              <Text style={styles.description}>{book.description}</Text>
            </View>
          )}

          {/* File Size */}
          {book.file_size_bytes && (
            <View style={styles.fileSizeContainer}>
              <Ionicons name="cloud-download-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.fileSizeText}>
                Download size: {formatFileSize(book.file_size_bytes)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <Pressable
          style={[
            styles.downloadButton,
            (isDownloading || isDownloaded) && styles.downloadButtonAlternate,
          ]}
          onPress={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <ActivityIndicator size="small" color={colors.surface} />
              <Text style={styles.downloadButtonText}>Downloading...</Text>
            </>
          ) : (
            <>
              <Ionicons
                name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
                size={20}
                color={colors.surface}
              />
              <Text style={styles.downloadButtonText}>
                {isDownloaded ? 'Downloaded' : 'Download'}
              </Text>
            </>
          )}
        </Pressable>

        <Pressable style={styles.readButton} onPress={handleRead}>
          <Ionicons name="book-outline" size={20} color={colors.surface} />
          <Text style={styles.readButtonText}>Read Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Helper function to get language display name
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    ku: 'Kurmanji',
    ar: 'Arabic',
    en: 'English',
    de: 'German',
  };
  return languages[code] || code;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl + 60, // Space for action bar
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.background,
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
  coverSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  coverPlaceholder: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    ...shadows.lg,
  },
  coverTitle: {
    ...typography.h1,
    fontSize: 24,
    color: colors.surface,
    textAlign: 'center',
  },
  favoriteButtonLarge: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: spacing.lg + spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  coverBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  infoSection: {
    padding: layout.screenPadding,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  author: {
    ...typography.h3,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  translator: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metadataPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metadataText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  fileSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  fileSizeText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: layout.screenPadding,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.md,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.text.secondary,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  downloadButtonAlternate: {
    backgroundColor: '#10B981', // Green for downloaded state
  },
  downloadButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  readButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  readButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});

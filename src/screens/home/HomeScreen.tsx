import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrowseStackScreenProps } from '@/navigation/types';
import { colors, typography, spacing, layout, shadows } from '@/theme';
import { useBooks, useCategories } from '@/hooks/useBooks';
import type { Book } from '@/types';

type Props = BrowseStackScreenProps<'BrowseHome'>;

// Color palette for book covers (when no cover image)
const BOOK_COLORS = [
  '#6366F1', '#EC4899', '#8B5CF6', '#F59E0B',
  '#10B981', '#3B82F6', '#EF4444', '#14B8A6',
];

export default function HomeScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { books, loading, error, total, refetch } = useBooks({
    category: selectedCategory,
    search: searchQuery || undefined,
  });

  const { categories } = useCategories();

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterSection}
          contentContainerStyle={styles.filterContent}
        >
          <CategoryPill
            label="All Books"
            active={selectedCategory === undefined}
            onPress={() => handleCategorySelect(undefined)}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat.category}
              label={`${cat.category} (${cat.count})`}
              active={selectedCategory === cat.category}
              onPress={() => handleCategorySelect(cat.category)}
            />
          ))}
        </ScrollView>

        {/* Book Count */}
        <View style={styles.headerSection}>
          <Text style={styles.bookCount}>
            {loading ? 'Loading...' : `${total} book${total !== 1 ? 's' : ''}`}
          </Text>
          <View style={styles.viewToggle}>
            <Pressable style={styles.viewButton}>
              <Ionicons name="list" size={20} color={colors.text.tertiary} />
            </Pressable>
            <Pressable style={[styles.viewButton, styles.viewButtonActive]}>
              <Ionicons name="grid" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Loading State */}
        {loading && books.length === 0 && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading books...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && (
          <View style={styles.centerContent}>
            <Ionicons name="book-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No books found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Check back later for new books'}
            </Text>
          </View>
        )}

        {/* Books Grid */}
        {!loading && !error && books.length > 0 && (
          <View style={styles.booksGrid}>
            {books.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                color={BOOK_COLORS[index % BOOK_COLORS.length]}
                onPress={() => {
                  navigation.navigate('BookDetail', { bookId: book.id });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function CategoryPill({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.categoryPill, active && styles.categoryPillActive]}
      onPress={onPress}
    >
      <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function BookCard({
  book,
  color,
  onPress,
}: {
  book: Book;
  color: string;
  onPress: () => void;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: any) => {
    e.stopPropagation(); // Prevent triggering parent onPress
    setIsFavorite(!isFavorite);
    // TODO: Save to favorites
  };

  return (
    <Pressable style={styles.bookCard} onPress={onPress}>
      {/* Book Cover */}
      <View style={[styles.bookCover, { backgroundColor: color }]}>
        <View style={styles.bookCoverContent}>
          <Text style={styles.bookCoverTitle} numberOfLines={3}>
            {book.title}
          </Text>
        </View>
        {/* EPUB Badge */}
        {book.content_type === 'epub' && (
          <View style={styles.epubBadge}>
            <Text style={styles.epubBadgeText}>EPUB</Text>
          </View>
        )}
        {/* Favorite Button */}
        <Pressable style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={colors.surface}
          />
        </Pressable>
      </View>

      {/* Book Info */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author || 'Unknown Author'}
        </Text>
        <Text style={styles.bookCategory}>{book.category}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  filterSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterContent: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  bookCount: {
    ...typography.body,
    color: colors.text.secondary,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewButton: {
    padding: spacing.xs,
  },
  viewButtonActive: {
    opacity: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.screenPadding - spacing.xs,
    gap: spacing.md,
  },
  bookCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  bookCover: {
    aspectRatio: 3 / 4,
    justifyContent: 'flex-end',
    padding: spacing.md,
    position: 'relative',
  },
  bookCoverContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bookCoverTitle: {
    ...typography.h2,
    fontSize: 18,
    color: colors.surface,
    textAlign: 'center',
  },
  epubBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  epubBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    padding: spacing.sm,
  },
  bookTitle: {
    ...typography.h3,
    fontSize: 15,
    marginBottom: 4,
  },
  bookAuthor: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  bookCategory: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  // Loading, Error, and Empty States
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: layout.screenPadding,
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
  emptyText: {
    ...typography.h3,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

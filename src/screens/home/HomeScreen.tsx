import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '@/navigation/types';
import { colors, typography, spacing, layout, shadows } from '@/theme';

type Props = MainTabScreenProps<'Browse'>;

export default function HomeScreen({ navigation }: Props) {
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
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterSection}
          contentContainerStyle={styles.filterContent}
        >
          <CategoryPill label="All Books" active />
          <CategoryPill label="My Religion" />
          <CategoryPill label="History" />
          <CategoryPill label="Holidays" />
          <CategoryPill label="Values & Morals" />
          <CategoryPill label="Traditions" />
          <CategoryPill label="Prayers" />
          <CategoryPill label="Qewlên" />
          <CategoryPill label="Stories" />
        </ScrollView>

        {/* Book Count */}
        <View style={styles.headerSection}>
          <Text style={styles.bookCount}>20 books</Text>
          <View style={styles.viewToggle}>
            <Pressable style={styles.viewButton}>
              <Ionicons name="list" size={20} color={colors.text.tertiary} />
            </Pressable>
            <Pressable style={[styles.viewButton, styles.viewButtonActive]}>
              <Ionicons name="grid" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Books Grid */}
        <View style={styles.booksGrid}>
          <BookCard
            title="Yazidi Stories for Children"
            author="Lewis Carroll"
            category="Stories"
            color="#6366F1"
            isFavorite={false}
          />
          <BookCard
            title="Tales of Courage"
            author="Traditional"
            category="Folk Tales"
            color="#EC4899"
            isFavorite={true}
          />
          <BookCard
            title="Morning Prayers"
            author="Religious Texts"
            category="Prayers"
            color="#8B5CF6"
            isFavorite={false}
          />
          <BookCard
            title="Yazidi Heritage"
            author="Various Authors"
            category="History"
            color="#F59E0B"
            isFavorite={false}
          />
          <BookCard
            title="Children's Wisdom"
            author="Khalil Gibran"
            category="Values & Morals"
            color="#10B981"
            isFavorite={false}
          />
          <BookCard
            title="Festival Guide"
            author="Community Edition"
            category="Holidays"
            color="#3B82F6"
            isFavorite={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function CategoryPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <Pressable
      style={[styles.categoryPill, active && styles.categoryPillActive]}
    >
      <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function BookCard({
  title,
  author,
  category,
  color,
  isFavorite,
}: {
  title: string;
  author: string;
  category: string;
  color: string;
  isFavorite: boolean;
}) {
  return (
    <Pressable style={styles.bookCard}>
      {/* Book Cover */}
      <View style={[styles.bookCover, { backgroundColor: color }]}>
        <View style={styles.bookCoverContent}>
          <Text style={styles.bookCoverTitle} numberOfLines={3}>
            {title}
          </Text>
        </View>
        {/* EPUB Badge */}
        <View style={styles.epubBadge}>
          <Text style={styles.epubBadgeText}>EPUB</Text>
        </View>
        {/* Favorite Button */}
        <Pressable style={styles.favoriteButton}>
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
          {title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {author}
        </Text>
        <Text style={styles.bookCategory}>{category}</Text>
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
});

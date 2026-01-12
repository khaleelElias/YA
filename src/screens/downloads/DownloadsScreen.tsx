import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '@/navigation/types';
import { colors, typography, spacing, layout, shadows } from '@/theme';

type Props = MainTabScreenProps<'Downloads'>;

export default function DownloadsScreen({ navigation }: Props) {
  const hasDownloads = true; // Change to false to see empty state

  return (
    <View style={styles.container}>
      {hasDownloads ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Library</Text>
            <Text style={styles.bookCount}>1 book</Text>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabSection}
            contentContainerStyle={styles.tabContent}
          >
            <TabButton label="Reading" count={1} active icon="book-outline" />
            <TabButton label="Favorites" count={1} icon="heart-outline" />
            <TabButton label="Downloads" icon="download-outline" />
            <TabButton label="Completed" icon="checkmark-circle-outline" />
          </ScrollView>

          {/* Book List */}
          <View style={styles.bookList}>
            <DownloadedBookItem
              title="Yazidi Stories for Children"
              author="Lewis Carroll"
              category="Stories"
              color="#6366F1"
              isFavorite={false}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.emptyContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="book-outline" size={48} color={colors.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No downloads yet</Text>
            <Text style={styles.emptyText}>
              Books you download will appear here, ready to read offline anytime.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function TabButton({
  label,
  count,
  active = false,
  icon,
}: {
  label: string;
  count?: number;
  active?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]}>
      <View style={styles.tabContent}>
        <Ionicons
          name={icon}
          size={16}
          color={active ? colors.surface : colors.text.secondary}
        />
        <Text style={[styles.tabText, active && styles.tabTextActive]}>
          {label}
          {count !== undefined && ` ${count}`}
        </Text>
      </View>
    </Pressable>
  );
}

function DownloadedBookItem({
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
    <Pressable style={styles.bookItem}>
      {/* Book Cover Thumbnail */}
      <View style={[styles.bookThumbnail, { backgroundColor: color }]}>
        <Text style={styles.bookThumbnailText} numberOfLines={2}>
          {title}
        </Text>
        {/* EPUB Badge */}
        <View style={styles.epubBadge}>
          <Text style={styles.epubBadgeText}>EPUB</Text>
        </View>
      </View>

      {/* Book Info */}
      <View style={styles.bookItemInfo}>
        <Text style={styles.bookItemTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.bookItemAuthor} numberOfLines={1}>
          {author}
        </Text>
        <Text style={styles.bookItemCategory}>{category}</Text>
      </View>

      {/* Favorite Button */}
      <Pressable style={styles.favoriteButton}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={isFavorite ? colors.favoriteRed : colors.text.tertiary}
        />
      </Pressable>
    </Pressable>
  );
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
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.displayMedium,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  bookCount: {
    ...typography.body,
    color: colors.text.secondary,
  },
  tabSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabContent: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  bookList: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    ...shadows.sm,
    alignItems: 'center',
  },
  bookThumbnail: {
    width: 80,
    height: 110,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: spacing.xs,
  },
  bookThumbnailText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.surface,
    textAlign: 'center',
    fontWeight: '600',
  },
  epubBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  epubBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 9,
  },
  bookItemInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  bookItemTitle: {
    ...typography.h3,
    fontSize: 16,
    marginBottom: 4,
  },
  bookItemAuthor: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  bookItemCategory: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 280,
    color: colors.text.secondary,
  },
});

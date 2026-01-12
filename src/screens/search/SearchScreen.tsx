import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MainTabScreenProps } from '@/navigation/types';
import { colors, typography, spacing, layout } from '@/theme';

type Props = MainTabScreenProps<'Search'>;

export default function SearchScreen({ navigation }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Search will go here */}
      <View style={styles.searchPlaceholder}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchText}>Search coming soon...</Text>
        </View>
      </View>

      {/* Empty State */}
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
        </View>
        <Text style={styles.emptyTitle}>Search the library</Text>
        <Text style={styles.emptyText}>
          Find books by title, author, category, or keyword in multiple languages.
        </Text>
      </View>

      {/* Quick Filters Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <View style={styles.filterGrid}>
          <FilterChip emoji="📖" label="Stories" />
          <FilterChip emoji="🌍" label="Kurmanji" />
          <FilterChip emoji="📚" label="Arabic" />
          <FilterChip emoji="✨" label="New Books" />
        </View>
      </View>
    </ScrollView>
  );
}

function FilterChip({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={styles.filterChip}>
      <Text style={styles.filterEmoji}>{emoji}</Text>
      <Text style={styles.filterLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: layout.screenPadding,
    paddingTop: spacing.lg,
  },
  searchPlaceholder: {
    marginBottom: spacing.xl,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
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
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterEmoji: {
    fontSize: 16,
  },
  filterLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

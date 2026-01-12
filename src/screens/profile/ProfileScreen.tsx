import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '@/navigation/types';
import { colors, typography, spacing, layout, shadows } from '@/theme';

type Props = MainTabScreenProps<'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const isAuthenticated = false;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {!isAuthenticated ? (
          <>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={40} color={colors.text.tertiary} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome!</Text>
              <Text style={styles.welcomeText}>
                Sign in to sync your reading progress and access your library across all devices.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </Pressable>
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.settingsCard}>
                <SettingItem icon="language-outline" label="Language" value="English" />
                <Divider />
                <SettingItem icon="color-palette-outline" label="Appearance" value="Light" />
                <Divider />
                <SettingItem icon="server-outline" label="Storage" value="0 MB used" />
              </View>
            </View>

            {/* About */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <View style={styles.settingsCard}>
                <SettingItem icon="information-circle-outline" label="About Yazidi Library" />
                <Divider />
                <SettingItem icon="document-text-outline" label="Terms & Privacy" />
                <Divider />
                <SettingItem icon="chatbubble-outline" label="Send Feedback" />
              </View>
            </View>

            {/* Version */}
            <Text style={styles.version}>Version 1.0.0</Text>
          </>
        ) : null}

        <View style={{ height: spacing.xl }} />
      </View>
    </ScrollView>
  );
}

function SettingItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.settingItemPressed,
      ]}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={colors.text.secondary} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </View>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.lg,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    ...typography.h1,
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  buttonGroup: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    marginBottom: spacing.md,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingItemPressed: {
    backgroundColor: colors.background,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingValue: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 48,
  },
  version: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: layout.screenPadding,
  },
});

// Professional Color Palette - Inspired by modern reading apps
export const colors = {
  // Backgrounds
  background: '#F5F5F5', // Light gray like the reference
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',

  // Primary (Gold/Amber - warm, inviting)
  primary: '#D4A574', // Warm gold/amber
  primaryDark: '#B8935F',
  primaryLight: '#E6C79C',
  primarySurface: '#FFF9F0',

  // Secondary (Blue-gray - professional)
  secondary: '#64748B',
  secondaryDark: '#475569',
  secondaryLight: '#94A3B8',

  // Accent (Warm gold for highlights)
  accent: '#D4A574',
  accentDark: '#B8935F',
  accentSurface: '#FEF7EE',

  // Neutrals
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#9CA3AF',
    disabled: '#D1D5DB',
  },

  // Status colors
  success: '#10B981',
  successSurface: '#D1FAE5',
  warning: '#F59E0B',
  warningSurface: '#FEF3C7',
  error: '#EF4444',
  errorSurface: '#FEE2E2',

  // Borders & dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  // Card backgrounds
  cardBackground: '#FFFFFF',

  // Special
  favoriteRed: '#EF4444',
  downloadBadge: '#D4A574', // Gold/bronze for EPUB badge

  // Tab bar
  tabActive: '#D4A574', // Gold/amber for active tab
  tabInactive: '#9CA3AF',
} as const;

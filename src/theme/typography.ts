import { TextStyle } from 'react-native';
import { colors } from './colors';

// Modern typography scale
export const typography = {
  // Display (Hero sections)
  displayLarge: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.text.primary,
  } as TextStyle,

  displayMedium: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.5,
    color: colors.text.primary,
  } as TextStyle,

  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: colors.text.primary,
  } as TextStyle,

  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.text.primary,
  } as TextStyle,

  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text.primary,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text.secondary,
  } as TextStyle,

  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text.secondary,
  } as TextStyle,

  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.text.tertiary,
  } as TextStyle,

  // Special
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.text.tertiary,
  } as TextStyle,

  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text.primary,
  } as TextStyle,

  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.text.primary,
  } as TextStyle,
} as const;

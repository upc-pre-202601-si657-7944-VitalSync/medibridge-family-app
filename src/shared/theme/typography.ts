import { StyleSheet } from 'react-native';
import { colors } from './colors';

const fontFamily = 'Inter_400Regular';
const fontFamilyMedium = 'Inter_500Medium';
const fontFamilySemiBold = 'Inter_600SemiBold';
const fontFamilyBold = 'Inter_700Bold';

export const typography = StyleSheet.create({
  h1: {
    fontFamily: fontFamilyBold,
    fontSize: 26,
    color: colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamilySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  h3: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  body: {
    fontFamily: fontFamily,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: fontFamily,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fontFamilyMedium,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  label: {
    fontFamily: fontFamilySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  eyebrow: {
    fontFamily: fontFamilySemiBold,
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export { fontFamily, fontFamilyMedium, fontFamilySemiBold, fontFamilyBold };

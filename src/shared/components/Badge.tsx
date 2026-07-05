import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontFamilySemiBold } from '../theme';

interface BadgeProps { label: string; color?: 'blue' | 'green' | 'red' | 'yellow' | 'slate' }

const colorMap = {
  blue: { bg: colors.primaryLight, text: colors.primary },
  green: { bg: colors.successBg, text: colors.success },
  red: { bg: colors.errorBg, text: colors.error },
  yellow: { bg: colors.warningBg, text: colors.warning },
  slate: { bg: colors.surfaceMuted, text: colors.textSecondary },
} as const;

export function Badge({ label, color = 'blue' }: BadgeProps) {
  const c = colorMap[color];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: spacing.sm + 2, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
  text: { fontFamily: fontFamilySemiBold, fontSize: 11, letterSpacing: 0.3 },
});

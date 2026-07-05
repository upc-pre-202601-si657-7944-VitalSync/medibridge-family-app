import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily } from '../theme';

interface BannerProps { type: 'success' | 'error'; message: string }

export function Banner({ type, message }: BannerProps) {
  const success = type === 'success';
  return (
    <View style={[styles.banner, { backgroundColor: success ? colors.successBg : colors.errorBg, borderColor: success ? colors.successBorder : colors.errorBorder }]}>
      <Feather name={success ? 'check-circle' : 'alert-circle'} size={18} color={success ? colors.success : colors.error} />
      <Text style={[styles.text, { color: success ? colors.success : colors.error }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md + 2, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.lg },
  text: { flex: 1, fontFamily, fontSize: 14 },
});

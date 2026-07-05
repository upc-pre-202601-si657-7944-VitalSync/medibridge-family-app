import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontFamily } from '../theme';

interface EmptyStateProps { icon: keyof typeof Feather.glyphMap; message: string }

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={32} color={colors.textMuted} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl + 20 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  message: { fontFamily, fontSize: 15, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
});

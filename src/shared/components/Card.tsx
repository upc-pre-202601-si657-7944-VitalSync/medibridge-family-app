import { View, StyleSheet, type ViewStyle, type ViewProps } from 'react-native';
import { colors, radius, shadows } from '../theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Card({ variant = 'default', style, children, ...props }: CardProps) {
  return (
    <View {...props} style={[styles.base, variant === 'elevated' && shadows.elevated, variant === 'default' && shadows.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
});

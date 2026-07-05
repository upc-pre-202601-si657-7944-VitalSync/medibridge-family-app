import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, type ViewStyle, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamilySemiBold } from '../theme';

type FeatherName = keyof typeof Feather.glyphMap;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: FeatherName;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, icon, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  const bgColor = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.error : 'transparent';
  const borderColor = variant === 'outline' ? colors.border : variant === 'danger' ? colors.error : 'transparent';
  const textColor = variant === 'primary' || variant === 'danger' ? '#fff' : colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[styles.base, { backgroundColor: bgColor, borderColor, borderWidth: variant === 'outline' ? 2 : 0, opacity: isDisabled ? 0.5 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <Feather name={icon} size={18} color={textColor} style={styles.icon} />}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm },
  text: { fontFamily: fontFamilySemiBold, fontSize: 16 },
});

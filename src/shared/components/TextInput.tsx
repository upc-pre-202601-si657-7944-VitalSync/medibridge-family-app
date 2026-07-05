import { View, TextInput as RNTextInput, Text, StyleSheet, type TextInputProps as RNTextInputProps } from 'react-native';
import { colors, radius, spacing, fontFamily, fontFamilySemiBold } from '../theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, style, ...props }: TextInputProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        {...props}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && styles.inputError, { fontFamily: fontFamily! }, style]}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 13,
    fontSize: 16, color: colors.textPrimary,
  },
  inputError: { borderColor: colors.error, borderWidth: 1.5 },
  error: { fontFamily, fontSize: 13, color: colors.error, marginTop: spacing.xs },
});

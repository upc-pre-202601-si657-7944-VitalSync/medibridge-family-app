import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { colors, fontFamily } from '../theme';

interface LoadingSpinnerProps { message?: string }

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { fontFamily, marginTop: 14, fontSize: 14, color: colors.textMuted },
});

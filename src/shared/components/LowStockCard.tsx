import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLowStockAlerts } from '../../features/medication/application/use-medication';
import { Card } from './Card';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold } from '../theme';

export function LowStockCard() {
  const { alerts } = useLowStockAlerts();

  if (alerts.length === 0) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
          <Feather name="alert-triangle" size={20} color={colors.error} />
        </View>
        <Text style={styles.title}>Stock Bajo</Text>
        <TouchableOpacity onPress={() => router.push('/(family)/medication')}>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        {alerts.map((alert) => (
          <View key={alert.medicationId} style={styles.alertRow}>
            <Feather name="box" size={14} color={colors.error} />
            <View style={styles.alertInfo}>
              <Text style={styles.medName}>{alert.medicationName}</Text>
              <Text style={styles.stockText}>
                <Text style={styles.stockValue}>{alert.currentStock}</Text>
                {' '}restantes (umbral: {alert.threshold})
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.error },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconCircle: { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  title: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, flex: 1 },
  list: { gap: spacing.sm },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  alertInfo: { flex: 1 },
  medName: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary },
  stockText: { fontFamily, fontSize: 12, color: colors.textMuted },
  stockValue: { fontFamily: fontFamilySemiBold, color: colors.error },
});

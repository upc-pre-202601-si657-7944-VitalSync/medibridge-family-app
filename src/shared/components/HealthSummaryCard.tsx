import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useHealthSummary } from '../../features/monitoring/application/use-monitoring';
import { Card } from './Card';
import { PremiumLockOverlay } from './PremiumGate';
import { useSubscriptionStore } from '../../core/storage/subscription-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

export function HealthSummaryCard() {
  const { summary, loading } = useHealthSummary();
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  if (loading) return null;

  return (
    <Card style={styles.card}>
      {!isPremium && <PremiumLockOverlay featureName="Resumen de salud" />}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
          <Feather name="activity" size={20} color="#2563eb" />
        </View>
        <Text style={styles.title}>Resumen de Salud</Text>
        <TouchableOpacity onPress={() => router.push('/(family)/monitoring')}>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      {summary ? (
        <View style={styles.grid}>
          <VitalBox label="Presion" value={summary.latestBloodPressure} unit="mmHg" color="#2563eb" />
          <VitalBox label="Temp. Promedio" value={String(summary.averageTemperature)} unit="°C" color="#db2777" />
          <VitalBox label="Dolor" value={summary.painTrend === 'DESCENDING' ? 'Bajando' : summary.painTrend === 'STABLE' ? 'Estable' : 'Subiendo'} color="#d97706" />
          <VitalBox label="Alertas" value={String(summary.activeAlerts)} color={summary.activeAlerts > 0 ? colors.error : '#059669'} />
        </View>
      ) : (
        <Text style={styles.empty}>Sin datos de salud registrados</Text>
      )}
    </Card>
  );
}

function VitalBox({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <View style={[styles.vitalBox, { borderLeftColor: color }]}>
      <Text style={styles.vitalLabel}>{label}</Text>
      <Text style={[styles.vitalValue, { color }]}>
        {value}{unit ? <Text style={styles.vitalUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconCircle: { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  title: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  vitalBox: { width: '47%', backgroundColor: colors.background, padding: spacing.md, borderRadius: 10, borderLeftWidth: 3 },
  vitalLabel: { fontFamily, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  vitalValue: { fontFamily: fontFamilyBold, fontSize: 16 },
  vitalUnit: { fontFamily, fontSize: 11, color: colors.textMuted },
  empty: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
});

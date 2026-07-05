import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useClinicalAlerts } from '../../features/monitoring/application/use-monitoring';
import { Card } from './Card';
import { PremiumLockOverlay } from './PremiumGate';
import { useSubscriptionStore } from '../../core/storage/subscription-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: '#fef2f2', text: '#dc2626', border: '#dc2626' },
  HIGH: { bg: '#fff7ed', text: '#ea580c', border: '#ea580c' },
  MEDIUM: { bg: '#fefce8', text: '#ca8a04', border: '#ca8a04' },
  LOW: { bg: '#f0fdf4', text: '#16a34a', border: '#16a34a' },
};

export function ActiveAlertsCard() {
  const { alerts } = useClinicalAlerts();
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  if (alerts.length === 0) return null;

  return (
    <Card style={styles.card}>
      {!isPremium && <PremiumLockOverlay featureName="Alertas clinicas" />}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
          <Feather name="alert-circle" size={20} color={colors.error} />
        </View>
        <Text style={styles.title}>Alertas Activas</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{alerts.length}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(family)/monitoring')}>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        {alerts.slice(0, 3).map((alert) => {
          const sev = severityColors[alert.severity] || severityColors.LOW;
          return (
            <View key={alert.id} style={[styles.alertRow, { borderLeftColor: sev.border }]}>
              <View style={styles.alertContent}>
                <View style={styles.alertHeader}>
                  <View style={[styles.severityPill, { backgroundColor: sev.bg }]}>
                    <Text style={[styles.severityText, { color: sev.text }]}>{alert.severity}</Text>
                  </View>
                  <Text style={styles.alertTime}>
                    {new Date(alert.triggeredAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconCircle: { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  title: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, flex: 1 },
  countBadge: { backgroundColor: colors.error, borderRadius: radius.full, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginRight: spacing.sm },
  countText: { fontFamily: fontFamilyBold, fontSize: 11, color: '#fff' },
  list: { gap: spacing.sm },
  alertRow: { borderLeftWidth: 3, paddingLeft: spacing.md, paddingVertical: spacing.xs },
  alertContent: { flex: 1 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  severityPill: { paddingHorizontal: spacing.sm, paddingVertical: 1, borderRadius: radius.full },
  severityText: { fontFamily: fontFamilyBold, fontSize: 10, letterSpacing: 0.5 },
  alertTime: { fontFamily, fontSize: 11, color: colors.textMuted },
  alertMessage: { fontFamily, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});

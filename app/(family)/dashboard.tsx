import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Card, LoadingSpinner, PatientHeader, HealthSummaryCard, NextAppointmentCard, TodayMedicationsCard, LowStockCard, ActiveAlertsCard } from '../../src/shared/components';
import { appointmentsApi, medicationApi, healthApi, communicationApi } from '../../src/core/api/services';
import { useAuthStore } from '../../src/core/auth/auth-store';
import { profilesStore } from '../../src/core/storage/profiles-store';
import { useSubscriptionStore } from '../../src/core/storage/subscription-store';
import { usePullToRefresh } from '../../src/shared/hooks/use-pull-to-refresh';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

type FeatherName = keyof typeof Feather.glyphMap;

const ACCENT_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#db2777'];

interface MetricCard {
  labelKey: string;
  icon: FeatherName;
  value: number;
  route: string;
  color: string;
  bgColor: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const loadMetrics = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); setRefreshing(false); return; }
    try {
      const [appts, meds, obs, notifs] = await Promise.allSettled([
        appointmentsApi.get(`/appointments/patient/${patientId}`),
        medicationApi.get(`/medications/patients/${patientId}`),
        healthApi.get(`/health-monitoring/patients/${patientId}/observations`),
        communicationApi.get(`/notifications/recipients/${currentUser?.id}/unread`),
      ]);

      const notifCount = notifs.status === 'fulfilled' ? (Array.isArray(notifs.value.data) ? notifs.value.data.length : 0) : 0;
      setNotificationCount(notifCount);

      const items: MetricCard[] = [
        { labelKey: 'dashboard.appointments', icon: 'calendar',
          value: appts.status === 'fulfilled' ? (Array.isArray(appts.value.data) ? appts.value.data.length : 0) : 0,
          route: '/(family)/appointments', color: ACCENT_COLORS[0], bgColor: '#dbeafe' },
        { labelKey: 'dashboard.medications', icon: 'box',
          value: meds.status === 'fulfilled' ? (Array.isArray(meds.value.data) ? meds.value.data.length : 0) : 0,
          route: '/(family)/medication', color: ACCENT_COLORS[1], bgColor: '#ccfbf1' },
        { labelKey: 'dashboard.observations', icon: 'heart',
          value: obs.status === 'fulfilled' ? (Array.isArray(obs.value.data) ? obs.value.data.length : 0) : 0,
          route: '/(family)/monitoring', color: ACCENT_COLORS[2], bgColor: '#ede9fe' },
        { labelKey: 'dashboard.messages', icon: 'message-circle',
          value: notifCount,
          route: '/(family)/messages', color: ACCENT_COLORS[3], bgColor: '#fce7f3' },
      ];
      setMetrics(items);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.id]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMetrics();
  }, [loadMetrics]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <PatientHeader
        notificationCount={notificationCount}
        onNotificationPress={() => router.push('/(family)/messages')}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {isPremium ? (
          <>
            <ActiveAlertsCard />
            <HealthSummaryCard />
          </>
        ) : null}
        <NextAppointmentCard />
        <TodayMedicationsCard />
        <LowStockCard />

        <Text style={styles.sectionTitle}>{t('dashboard.quickAccess')}</Text>
        <View style={styles.grid}>
          {metrics.map((m) => (
            <TouchableOpacity key={m.labelKey} style={styles.metricCard}
              onPress={() => router.push(m.route as any)} activeOpacity={0.7}>
              <Card style={styles.cardInner}>
                <View style={[styles.iconCircle, { backgroundColor: m.bgColor }]}>
                  <Feather name={m.icon} size={24} color={m.color} />
                </View>
                <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.metricLabel}>{t(m.labelKey)}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.md },
  sectionTitle: {
    fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary,
    letterSpacing: -0.3, marginBottom: spacing.md, marginTop: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metricCard: { width: '47%', flexGrow: 1 },
  cardInner: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.md },
  iconCircle: {
    width: 52, height: 52, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  metricValue: { fontFamily: fontFamilyBold, fontSize: 32, marginBottom: 2 },
  metricLabel: { fontFamily, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});

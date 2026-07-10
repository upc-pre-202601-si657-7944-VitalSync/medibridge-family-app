import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { Card, LoadingSpinner, EmptyState, TabBar, Button, TextInput, Select, PremiumGate } from '../../src/shared/components';
import { healthApi } from '../../src/core/api/services';
import { profilesStore } from '../../src/core/storage/profiles-store';
import { useHealthSummary, useClinicalAlerts, useRecordObservation } from '../../src/features/monitoring/application/use-monitoring';
import { usePullToRefresh } from '../../src/shared/hooks/use-pull-to-refresh';
import { EmotionalState, HealthSummary } from '../../src/features/monitoring/domain/models';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

interface Observation { id: number; recordedAt: string; systolicBloodPressure: number; diastolicBloodPressure: number; bodyTemperature: number; painLevel: number; emotionalState: string; clinicalNotes: string }

type TabKey = 'observations' | 'summary' | 'alerts';

export default function MonitoringPage() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('observations');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const tabs = [
    { key: 'observations' as TabKey, label: t('monitoring.tabs.observations') },
    { key: 'summary' as TabKey, label: t('monitoring.tabs.summary') },
    { key: 'alerts' as TabKey, label: t('monitoring.tabs.alerts') },
  ];

  const loadObs = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); setRefreshing(false); return; }
    try {
      const { data } = await healthApi.get(`/health-monitoring/patients/${patientId}/observations`);
      setObservations(Array.isArray(data) ? data : []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[monitoring] load failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setObservations([]);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadObs(); }, [loadObs]);

  const { refreshing: refreshObs, onRefresh: onRefreshObs } = usePullToRefresh(loadObs);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('monitoring.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('monitoring.form.title')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>{t('monitoring.form.shortAction')}</Text>
        </TouchableOpacity>
      </View>

      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={(key) => setActiveTab(key as TabKey)} />

      {activeTab === 'observations' && (
        <ObservationsTab
          observations={observations}
          refreshing={refreshObs}
          onRefresh={onRefreshObs}
          emptyMessage={t('monitoring.empty')}
          onAddPress={() => setShowForm(true)}
        />
      )}
      {activeTab === 'summary' && <SummaryTab />}
      {activeTab === 'alerts' && <AlertsTab />}

      <ObservationFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSaved={() => { setShowForm(false); loadObs(); }}
      />
    </View>
  );
}

function ObservationsTab({ observations, refreshing, onRefresh, emptyMessage, onAddPress }: {
  observations: Observation[]; refreshing: boolean; onRefresh: () => void; emptyMessage: string; onAddPress: () => void;
}) {
  const { t, i18n } = useTranslation();

  if (observations.length === 0) {
    return (
      <View style={tabStyles.container}>
        <EmptyState icon="heart" message={emptyMessage} actionLabel={t('monitoring.form.title')} onAction={onAddPress} />
      </View>
    );
  }

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
      {observations.map((o) => (
        <Card key={o.id} style={tabStyles.obsCard}>
          <Text style={tabStyles.obsDate}>{new Date(o.recordedAt).toLocaleString(i18n.language, { dateStyle: 'long', timeStyle: 'short' })}</Text>
          <View style={tabStyles.vitalsGrid}>
            <VitalItem label={t('monitoring.bloodPressure')} value={`${o.systolicBloodPressure}/${o.diastolicBloodPressure}`} unit={t('monitoring.mmHg')} color="#2563eb" />
            <VitalItem label={t('monitoring.temperature')} value={o.bodyTemperature != null ? String(o.bodyTemperature) : '---'} unit={t('monitoring.celsius')} color="#db2777" />
            <VitalItem label={t('monitoring.painLevel')} value={o.painLevel != null ? String(o.painLevel) : '---'} unit={t('monitoring.outOf10')} color="#d97706" />
            <VitalItem label={t('monitoring.emotionalState')} value={o.emotionalState ?? '---'} color="#7c3aed" />
          </View>
          {o.clinicalNotes ? (
            <View style={tabStyles.notes}>
              <Text style={tabStyles.notesLabel}>{t('monitoring.notes')}</Text>
              <Text style={tabStyles.notesText}>{o.clinicalNotes}</Text>
            </View>
          ) : null}
        </Card>
      ))}
    </ScrollView>
  );
}

function SummaryTab() {
  const { t } = useTranslation();
  const { summary, loading } = useHealthSummary();
  const hasObservations = (summary?.observationsCount ?? 0) > 0;

  if (loading) return <LoadingSpinner />;

  return (
    <PremiumGate featureName={t('monitoring.tabs.summary')}>
      <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}>
        <Card style={tabStyles.summaryCard}>
          <Text style={tabStyles.summaryTitle}>{t('monitoring.summary.title')}</Text>
          {summary && hasObservations ? (
            <View style={tabStyles.summaryGrid}>
              <SummaryItem label={t('monitoring.summary.latestBP')} value={summary.latestBloodPressure ?? '---'} icon="heart" color="#2563eb" />
              <SummaryItem label={t('monitoring.summary.avgTemp')} value={formatSummaryTemperature(summary.averageTemperature)} icon="thermometer" color="#db2777" />
              <SummaryItem label={t('monitoring.summary.painTrend')} value={formatSummaryTrend(summary.painTrend, t)} icon="trending-up" color="#d97706" />
              <SummaryItem label={t('monitoring.summary.emotionalTrend')} value={formatSummaryTrend(summary.emotionalTrend, t)} icon="smile" color="#7c3aed" />
              <SummaryItem label={t('monitoring.summary.activeAlerts')} value={String(summary.activeAlerts)} icon="alert-circle" color={summary.activeAlerts > 0 ? colors.error : '#059669'} />
              <SummaryItem label={t('monitoring.summary.totalObs')} value={String(summary.observationsCount)} icon="clipboard" color="#0d9488" />
            </View>
          ) : (
            <Text style={tabStyles.empty}>{t('monitoring.summary.noData')}</Text>
          )}
        </Card>
      </ScrollView>
    </PremiumGate>
  );
}

function formatSummaryTemperature(value: number | null) {
  return value == null ? '---' : `${value.toFixed(1)}°C`;
}

function formatSummaryTrend(value: HealthSummary['painTrend'], t: (key: string) => string) {
  if (value === 'DESCENDING') return t('monitoring.summary.trendDown');
  if (value === 'STABLE') return t('monitoring.summary.trendStable');
  return t('monitoring.summary.trendUp');
}

function AlertsTab() {
  const { t } = useTranslation();
  const { alerts, loading } = useClinicalAlerts();

  if (loading) return <LoadingSpinner />;

  return (
    <PremiumGate featureName={t('monitoring.tabs.alerts')}>
      <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}>
        {alerts.length === 0 ? (
          <EmptyState icon="check-circle" message={t('monitoring.alerts.noAlerts')} />
        ) : (
          alerts.map((alert) => {
            const sevColor = alert.severity === 'CRITICAL' ? '#dc2626' : alert.severity === 'HIGH' ? '#ea580c' : alert.severity === 'MEDIUM' ? '#ca8a04' : '#16a34a';
            return (
              <Card key={alert.id} style={[tabStyles.alertCard, { borderLeftColor: sevColor }] as any}>
                <View style={tabStyles.alertHeader}>
                  <View style={[tabStyles.severityPill, { backgroundColor: `${sevColor}20` }]}>
                    <Text style={[tabStyles.severityText, { color: sevColor }]}>{alert.severity}</Text>
                  </View>
                  <Text style={tabStyles.alertTime}>
                    {new Date(alert.triggeredAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={tabStyles.alertMessage}>{alert.message}</Text>
              </Card>
            );
          })
        )}
      </ScrollView>
    </PremiumGate>
  );
}

function ObservationFormModal({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const { record, submitting } = useRecordObservation();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [temperature, setTemperature] = useState('');
  const [painLevel, setPainLevel] = useState('5');
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('CALM');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const emotionalStateOptions = [
    { value: 'CALM', label: t('monitoring.emotional.CALM') },
    { value: 'ANXIOUS', label: t('monitoring.emotional.ANXIOUS') },
    { value: 'SAD', label: t('monitoring.emotional.SAD') },
    { value: 'IRRITABLE', label: t('monitoring.emotional.IRRITABLE') },
    { value: 'CONFUSED', label: t('monitoring.emotional.CONFUSED') },
    { value: 'APATHETIC', label: t('monitoring.emotional.APATHETIC') },
  ];

  const handleSave = async () => {
    const success = await record({
      recordedByDoctorProfileId: null,
      systolicBloodPressure: Number(systolic),
      diastolicBloodPressure: Number(diastolic),
      bodyTemperature: Number(temperature),
      painLevel: Number(painLevel),
      emotionalState,
      emotionalNotes: '',
      clinicalNotes,
      recordedAt: new Date().toISOString(),
    });
    if (success) {
      setSystolic(''); setDiastolic(''); setTemperature(''); setPainLevel('5');
      setEmotionalState('CALM'); setClinicalNotes('');
      onSaved();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>{t('monitoring.form.title')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <Text style={modalStyles.sectionTitle}>{t('monitoring.form.vitals')}</Text>
          <View style={modalStyles.row}>
            <View style={modalStyles.half}>
              <TextInput label={t('monitoring.form.systolic')} value={systolic} onChangeText={setSystolic} placeholder="120" keyboardType="numeric" />
            </View>
            <View style={modalStyles.half}>
              <TextInput label={t('monitoring.form.diastolic')} value={diastolic} onChangeText={setDiastolic} placeholder="80" keyboardType="numeric" />
            </View>
          </View>
          <View style={modalStyles.row}>
            <View style={modalStyles.half}>
              <TextInput label={t('monitoring.form.temperature')} value={temperature} onChangeText={setTemperature} placeholder="36.5" keyboardType="decimal-pad" />
            </View>
            <View style={modalStyles.half}>
              <TextInput label={t('monitoring.form.painLevel')} value={painLevel} onChangeText={setPainLevel} placeholder="0-10" keyboardType="numeric" />
            </View>
          </View>

          <Text style={modalStyles.sectionTitle}>{t('monitoring.form.emotional')}</Text>
          <Select label={t('monitoring.form.emotionalState')} options={emotionalStateOptions} value={emotionalState} onChange={(v) => setEmotionalState(v as EmotionalState)} />

          <Text style={modalStyles.sectionTitle}>{t('monitoring.form.notes')}</Text>
          <TextInput label={t('monitoring.form.clinicalNotes')} value={clinicalNotes} onChangeText={setClinicalNotes} placeholder={t('monitoring.form.clinicalNotesPlaceholder')} multiline numberOfLines={3} />

          <Button
            title={submitting ? t('profiles.common.saving') : t('monitoring.form.save')}
            onPress={handleSave}
            loading={submitting}
            disabled={!systolic || !diastolic || !temperature}
            style={modalStyles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function VitalItem({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <View style={[vitalStyles.item, { borderLeftColor: color }]}>
      <Text style={vitalStyles.label}>{label}</Text>
      <Text style={vitalStyles.value}>
        {value}{unit ? <Text style={vitalStyles.unit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function SummaryItem({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={summaryStyles.item}>
      <View style={[summaryStyles.iconCircle, { backgroundColor: `${color}15` }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={summaryStyles.itemLabel}>{label}</Text>
      <Text style={[summaryStyles.itemValue, { color }]}>{value}</Text>
    </View>
  );
}

const vitalStyles = StyleSheet.create({
  item: {
    width: '46%', backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: 10, borderLeftWidth: 3, marginBottom: 0,
  },
  label: { fontFamily, fontSize: 11, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary },
  unit: { fontFamily, fontSize: 12, color: colors.textMuted },
});

const summaryStyles = StyleSheet.create({
  item: { width: '47%', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg },
  iconCircle: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  itemLabel: { fontFamily, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' },
  itemValue: { fontFamily: fontFamilyBold, fontSize: 16 },
});

const tabStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  obsCard: { marginBottom: spacing.md },
  obsDate: {
    fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.primary,
    backgroundColor: colors.primaryLight, alignSelf: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 6, marginBottom: spacing.md, overflow: 'hidden',
  },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  notes: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  notesLabel: { fontFamily: fontFamilySemiBold, fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  notesText: { fontFamily, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  summaryCard: { padding: spacing.lg },
  summaryTitle: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.lg },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  alertCard: { marginBottom: spacing.md, borderLeftWidth: 3, padding: spacing.lg },
  alertHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  severityPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  severityText: { fontFamily: fontFamilyBold, fontSize: 11, letterSpacing: 0.5 },
  alertTime: { fontFamily, fontSize: 12, color: colors.textMuted },
  alertMessage: { fontFamily, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  empty: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary },
  content: { padding: spacing.lg },
  sectionTitle: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  saveButton: { marginTop: spacing.xxl },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md,
  },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5 },
  addButton: {
    minHeight: 40, borderRadius: radius.full, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    gap: spacing.xs, paddingHorizontal: spacing.md,
  },
  addButtonText: { fontFamily: fontFamilySemiBold, fontSize: 13, color: '#fff' },
});

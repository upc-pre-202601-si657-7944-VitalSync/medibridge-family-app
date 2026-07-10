import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { Card, Badge, LoadingSpinner, EmptyState, TabBar, MedicationFormModal, DoseFormModal, SkipDoseModal, UpdateStockModal, ScheduleFormModal } from '../../src/shared/components';
import { medicationApi } from '../../src/core/api/services';
import { profilesStore } from '../../src/core/storage/profiles-store';
import { useMedications, useMedicationSchedules, useDoseHistory } from '../../src/features/medication/application/use-medication';
import { usePullToRefresh } from '../../src/shared/hooks/use-pull-to-refresh';
import { Medication, MedicationSchedule } from '../../src/features/medication/domain/models';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

type TabKey = 'inventory' | 'schedules' | 'history';

export default function MedicationPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('inventory');
  const [showMedForm, setShowMedForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showDoseForm, setShowDoseForm] = useState(false);
  const [showSkipForm, setShowSkipForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<MedicationSchedule | null>(null);

  const { medications, loading, refetch } = useMedications();
  const { schedules, loading: loadingSchedules, refetch: refetchSchedules } = useMedicationSchedules();
  const { refreshing, onRefresh } = usePullToRefresh(async () => {
    await refetch();
    await refetchSchedules();
  });

  const tabs = [
    { key: 'inventory' as TabKey, label: t('medication.tabs.inventory') },
    { key: 'schedules' as TabKey, label: t('medication.tabs.schedules') },
    { key: 'history' as TabKey, label: t('medication.tabs.history') },
  ];

  if (loading) return <LoadingSpinner />;

  const handleMedSaved = () => {
    setShowMedForm(false);
    refetch();
  };

  const handleScheduleSaved = () => {
    setShowScheduleForm(false);
    refetchSchedules();
  };

  const handleDoseSaved = () => {
    setShowDoseForm(false);
    refetch();
    refetchSchedules();
  };

  const handleSkipSaved = () => {
    setShowSkipForm(false);
    refetch();
    refetchSchedules();
  };

  const handleStockSaved = () => {
    setShowStockModal(false);
    refetch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('medication.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowMedForm(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('medication.form.title')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>{t('medication.form.shortAction')}</Text>
        </TouchableOpacity>
      </View>

      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={(key) => setActiveTab(key as TabKey)} />

      {activeTab === 'inventory' && (
        <InventoryTab
          medications={medications}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onMedPress={(med) => { setSelectedMed(med); setShowDetailModal(true); }}
          onAddSchedule={(med) => { setSelectedMed(med); setShowScheduleForm(true); }}
          onUpdateStock={(med) => { setSelectedMed(med); setShowStockModal(true); }}
          emptyMessage={t('medication.empty')}
          onAddMedication={() => setShowMedForm(true)}
        />
      )}
      {activeTab === 'schedules' && (
        <SchedulesTab
          schedules={schedules}
          medications={medications}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onSchedulePress={(schedule) => {
            setSelectedSchedule(schedule);
            setShowDoseForm(true);
          }}
          onSkipPress={(schedule) => {
            setSelectedSchedule(schedule);
            setShowSkipForm(true);
          }}
          emptyMessage={t('medication.schedule.empty')}
        />
      )}
      {activeTab === 'history' && (
        <HistoryTab medications={medications} />
      )}

      <MedicationFormModal visible={showMedForm} onClose={() => setShowMedForm(false)} onSaved={handleMedSaved} />
      <ScheduleFormModal
        visible={showScheduleForm}
        onClose={() => setShowScheduleForm(false)}
        onSaved={handleScheduleSaved}
        medicationId={selectedMed?.id || 0}
        medicationName={selectedMed?.name}
      />
      <DoseFormModal
        visible={showDoseForm}
        onClose={() => setShowDoseForm(false)}
        onSaved={handleDoseSaved}
        medicationId={selectedSchedule ? medications.find(m => m.id === selectedSchedule.medicationId)?.id || 0 : 0}
        scheduleId={selectedSchedule?.id || 0}
        medicationName={selectedSchedule ? medications.find(m => m.id === selectedSchedule.medicationId)?.name : undefined}
      />
      <SkipDoseModal
        visible={showSkipForm}
        onClose={() => setShowSkipForm(false)}
        onSaved={handleSkipSaved}
        medicationId={selectedSchedule ? medications.find(m => m.id === selectedSchedule.medicationId)?.id || 0 : 0}
        scheduleId={selectedSchedule?.id || 0}
        medicationName={selectedSchedule ? medications.find(m => m.id === selectedSchedule.medicationId)?.name : undefined}
      />
      <UpdateStockModal
        visible={showStockModal}
        onClose={() => setShowStockModal(false)}
        onSaved={handleStockSaved}
        medicationId={selectedMed?.id || 0}
        currentStock={selectedMed?.stockQuantity || 0}
        medicationName={selectedMed?.name}
      />

      {selectedMed && (
        <MedicationDetailModal
          visible={showDetailModal}
          medication={selectedMed}
          onClose={() => { setShowDetailModal(false); setSelectedMed(null); }}
          onAddSchedule={() => { setShowDetailModal(false); setShowScheduleForm(true); }}
          onUpdateStock={() => { setShowDetailModal(false); setShowStockModal(true); }}
        />
      )}
    </View>
  );
}

function InventoryTab({ medications, refreshing, onRefresh, onMedPress, onAddSchedule, onUpdateStock, emptyMessage, onAddMedication }: {
  medications: Medication[]; refreshing: boolean; onRefresh: () => void;
  onMedPress: (med: Medication) => void; onAddSchedule: (med: Medication) => void; onUpdateStock: (med: Medication) => void; emptyMessage: string;
  onAddMedication: () => void;
}) {
  const { t } = useTranslation();

  if (medications.length === 0) {
    return (
      <View style={tabStyles.container}>
        <EmptyState icon="box" message={emptyMessage} actionLabel={t('medication.form.title')} onAction={onAddMedication} />
      </View>
    );
  }

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
      {medications.map((m) => {
        const low = m.stockQuantity <= m.lowStockThreshold;
        return (
          <Card key={m.id} style={[tabStyles.medCard, low && tabStyles.lowCard] as any}>
            <TouchableOpacity onPress={() => onMedPress(m)} activeOpacity={0.7}>
              <View style={tabStyles.medHeader}>
                <View style={[tabStyles.iconCircle, { backgroundColor: low ? '#fef2f2' : '#ccfbf1' }]}>
                  <Feather name="box" size={20} color={low ? colors.error : '#0d9488'} />
                </View>
                <View style={tabStyles.medInfo}>
                  <Text style={tabStyles.medName}>{m.name}</Text>
                  <Text style={tabStyles.medDetail}>{m.dosageAmount} {t(`medication.unit.${m.dosageUnit}` as any)} · {m.administrationRoute}</Text>
                </View>
              </View>
              <View style={tabStyles.medFooter}>
                <View style={tabStyles.stockRow}>
                  <Text style={tabStyles.stockLabel}>{t('medication.stock')}:</Text>
                  <Text style={[tabStyles.stockValue, low && tabStyles.lowStock]}>{m.stockQuantity}</Text>
                  {low && <Badge label={t('medication.lowStock')} color="red" />}
                </View>
                <Text style={tabStyles.expiry}>{t('medication.expires')}: {new Date(m.expirationDate).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
            <View style={tabStyles.actions}>
              <TouchableOpacity style={tabStyles.actionBtn} onPress={() => onAddSchedule(m)}>
                <Feather name="clock" size={16} color={colors.primary} />
                <Text style={tabStyles.actionText}>{t('medication.addSchedule')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tabStyles.actionBtn} onPress={() => onUpdateStock(m)}>
                <Feather name="edit" size={16} color={colors.primary} />
                <Text style={tabStyles.actionText}>{t('medication.updateStock')}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function SchedulesTab({ schedules, medications, refreshing, onRefresh, onSchedulePress, onSkipPress, emptyMessage }: {
  schedules: MedicationSchedule[]; medications: Medication[]; refreshing: boolean; onRefresh: () => void;
  onSchedulePress: (schedule: MedicationSchedule) => void; onSkipPress: (schedule: MedicationSchedule) => void; emptyMessage: string;
}) {
  const { t } = useTranslation();

  if (schedules.length === 0) {
    return (
      <View style={tabStyles.container}>
        <EmptyState icon="clock" message={emptyMessage} />
      </View>
    );
  }

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
      {schedules.map((s) => {
        const med = medications.find(m => m.id === s.medicationId);
        return (
          <Card key={s.id} style={tabStyles.scheduleCard}>
            <View style={tabStyles.scheduleHeader}>
              <View style={[tabStyles.iconCircle, { backgroundColor: '#ede9fe' }]}>
                <Feather name="clock" size={20} color="#7c3aed" />
              </View>
              <View style={tabStyles.scheduleInfo}>
                <Text style={tabStyles.medName}>{med?.name || 'Medicamento'}</Text>
                <Text style={tabStyles.scheduleDetail}>
                  {s.administrationTime} · {t(`medication.schedule.frequency.${s.frequencyType}` as any)}
                </Text>
              </View>
            </View>
            <View style={tabStyles.scheduleFooter}>
              <Text style={tabStyles.scheduleDates}>
                {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
              </Text>
              <View style={tabStyles.scheduleActions}>
                <TouchableOpacity style={tabStyles.doseBtn} onPress={() => onSchedulePress(s)}>
                  <Feather name="check" size={14} color="#fff" />
                  <Text style={tabStyles.doseBtnText}>{t('medication.dose.register')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={tabStyles.skipBtn} onPress={() => onSkipPress(s)}>
                  <Feather name="x" size={14} color={colors.error} />
                  <Text style={tabStyles.skipBtnText}>{t('medication.skip.action')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function HistoryTab({ medications }: { medications: Medication[] }) {
  const { t } = useTranslation();
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const { doses, loading } = useDoseHistory(selectedMedId);

  useEffect(() => {
    if (!selectedMedId && medications.length > 0) setSelectedMedId(medications[0].id);
  }, [medications, selectedMedId]);

  if (medications.length === 0) {
    return (
      <View style={tabStyles.container}>
        <EmptyState icon="box" message={t('medication.noMedications')} />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tabStyles.medSelectorScroll}
        contentContainerStyle={tabStyles.medSelector}
      >
        {medications.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[tabStyles.medChip, selectedMedId === m.id && tabStyles.medChipActive]}
            onPress={() => setSelectedMedId(m.id)}
          >
            <Text
              style={[tabStyles.medChipText, selectedMedId === m.id && tabStyles.medChipTextActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {m.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedMedId ? (
        loading ? <LoadingSpinner /> : (
          <FlatList
            data={doses}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={tabStyles.doseList}
            renderItem={({ item }) => (
              <Card style={tabStyles.doseCard}>
                <View style={tabStyles.doseHeader}>
                  <View style={[tabStyles.doseIcon, { backgroundColor: item.status === 'ADMINISTERED' ? '#dcfce7' : '#fef2f2' }]}>
                    <Feather
                      name={item.status === 'ADMINISTERED' ? 'check' : 'x'}
                      size={16}
                      color={item.status === 'ADMINISTERED' ? '#16a34a' : colors.error}
                    />
                  </View>
                  <View style={tabStyles.doseInfo}>
                    <Text style={tabStyles.doseStatus}>
                      {item.status === 'ADMINISTERED' ? t('medication.dose.administered') : t('medication.dose.skipped')}
                    </Text>
                    <Text style={tabStyles.doseDate}>
                      {new Date(item.occurredAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
                {item.notes && <Text style={tabStyles.doseNotes}>{item.notes}</Text>}
              </Card>
            )}
            ListEmptyComponent={<EmptyState icon="clipboard" message={t('medication.noDoses')} />}
          />
        )
      ) : (
        <View style={tabStyles.selectPrompt}>
          <Feather name="arrow-up" size={24} color={colors.textMuted} />
          <Text style={tabStyles.selectText}>{t('medication.selectMedication')}</Text>
        </View>
      )}
    </View>
  );
}

function MedicationDetailModal({ visible, medication, onClose, onAddSchedule, onUpdateStock }: {
  visible: boolean; medication: Medication; onClose: () => void; onAddSchedule: () => void; onUpdateStock: () => void;
}) {
  const { t } = useTranslation();
  const low = medication.stockQuantity <= medication.lowStockThreshold;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={detailStyles.container}>
        <View style={detailStyles.header}>
          <Text style={detailStyles.headerTitle}>{medication.name}</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={detailStyles.content}>
          <Card style={detailStyles.infoCard}>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('medication.dosage')}</Text>
              <Text style={detailStyles.infoValue}>{medication.dosageAmount} {t(`medication.unit.${medication.dosageUnit}` as any)}</Text>
            </View>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('medication.route')}</Text>
              <Text style={detailStyles.infoValue}>{medication.administrationRoute}</Text>
            </View>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('medication.stock')}</Text>
              <View style={detailStyles.stockInfo}>
                <Text style={[detailStyles.infoValue, low && detailStyles.lowStock]}>{medication.stockQuantity}</Text>
                {low && <Badge label={t('medication.lowStock')} color="red" />}
              </View>
            </View>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('medication.threshold')}</Text>
              <Text style={detailStyles.infoValue}>{medication.lowStockThreshold}</Text>
            </View>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('medication.expires')}</Text>
              <Text style={detailStyles.infoValue}>{new Date(medication.expirationDate).toLocaleDateString()}</Text>
            </View>
          </Card>

          <View style={detailStyles.actions}>
            <Button title={t('medication.addSchedule')} onPress={onAddSchedule} icon="clock" />
            <Button title={t('medication.updateStock')} onPress={onUpdateStock} icon="edit" variant="outline" />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

import { Button } from '../../src/shared/components';

const tabStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  medCard: { marginBottom: spacing.md },
  lowCard: { borderLeftWidth: 4, borderLeftColor: colors.error },
  medHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  iconCircle: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  medInfo: { flex: 1 },
  medName: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 2 },
  medDetail: { fontFamily, fontSize: 13, color: colors.textMuted },
  medFooter: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  stockLabel: { fontFamily, fontSize: 13, color: colors.textMuted },
  stockValue: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary },
  lowStock: { color: colors.error },
  expiry: { fontFamily, fontSize: 12, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  actionText: { fontFamily, fontSize: 13, color: colors.primary },
  scheduleCard: { marginBottom: spacing.md },
  scheduleHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  scheduleInfo: { flex: 1 },
  scheduleDetail: { fontFamily, fontSize: 13, color: colors.textMuted },
  scheduleFooter: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  scheduleDates: { fontFamily, fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  scheduleActions: { flexDirection: 'row', gap: spacing.md },
  doseBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  doseBtnText: { fontFamily, fontSize: 12, color: '#fff' },
  skipBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  skipBtnText: { fontFamily, fontSize: 12, color: colors.error },
  medSelectorScroll: { flexGrow: 0, maxHeight: 76 },
  medSelector: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm, alignItems: 'center' },
  medChip: { maxWidth: 180, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, marginRight: spacing.sm },
  medChipActive: { backgroundColor: colors.primary },
  medChipText: { fontFamily, fontSize: 13, color: colors.textPrimary },
  medChipTextActive: { color: '#fff' },
  doseList: { padding: spacing.lg },
  doseCard: { marginBottom: spacing.md },
  doseHeader: { flexDirection: 'row', gap: spacing.md },
  doseIcon: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  doseInfo: { flex: 1 },
  doseStatus: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary },
  doseDate: { fontFamily, fontSize: 12, color: colors.textMuted },
  doseNotes: { fontFamily, fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: 'italic' },
  selectPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  selectText: { fontFamily, fontSize: 14, color: colors.textMuted },
});

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontFamily: fontFamilyBold, fontSize: 20, color: colors.textPrimary },
  content: { padding: spacing.lg },
  infoCard: { marginBottom: spacing.xl },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
  infoLabel: { fontFamily, fontSize: 14, color: colors.textMuted },
  infoValue: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary },
  lowStock: { color: colors.error },
  stockInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actions: { gap: spacing.md },
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

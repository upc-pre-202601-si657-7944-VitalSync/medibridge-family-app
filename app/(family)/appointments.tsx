import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { Button, TextInput, Card, Badge, LoadingSpinner, EmptyState, TabBar, Select } from '../../src/shared/components';
import { appointmentsApi } from '../../src/core/api/services';
import { profilesStore } from '../../src/core/storage/profiles-store';
import { useAppointments, useScheduleFamilyVisit } from '../../src/features/appointments/application/use-appointments';
import { usePullToRefresh } from '../../src/shared/hooks/use-pull-to-refresh';
import { Appointment } from '../../src/features/appointments/domain/models';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

type TabKey = 'all' | 'family' | 'medical';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { appointments, familyVisits, medicalAppointments, upcoming, loading, refetch } = useAppointments();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const tabs = [
    { key: 'all' as TabKey, label: t('appointments.tabs.all'), badge: appointments.length },
    { key: 'family' as TabKey, label: t('appointments.tabs.family'), badge: familyVisits.length },
    { key: 'medical' as TabKey, label: t('appointments.tabs.medical'), badge: medicalAppointments.length },
  ];

  if (loading) return <LoadingSpinner />;

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'family': return familyVisits;
      case 'medical': return medicalAppointments;
      default: return appointments;
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'family': return t('appointments.emptyFamily');
      case 'medical': return t('appointments.emptyMedical');
      default: return t('appointments.empty');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('appointments.title')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)} activeOpacity={0.7}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={(key) => setActiveTab(key as TabKey)} />

      {upcoming.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingTitle}>{t('appointments.upcoming')}</Text>
          <TouchableOpacity onPress={() => setSelectedAppointment(upcoming[0])} activeOpacity={0.7}>
            <Card style={styles.nextCard}>
              <View style={styles.nextHeader}>
                <View style={[styles.iconCircle, { backgroundColor: '#ede9fe' }]}>
                  <Feather name="calendar" size={20} color="#7c3aed" />
                </View>
                <View style={styles.nextInfo}>
                  <Text style={styles.nextReason}>{upcoming[0].reason}</Text>
                  <Text style={styles.nextDate}>
                    {new Date(upcoming[0].startsAt).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Text>
                  <Text style={styles.nextTime}>
                    {new Date(upcoming[0].startsAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(upcoming[0].endsAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <View style={styles.nextFooter}>
                <Badge label={upcoming[0].appointmentType === 'FAMILY_VISIT' ? t('appointments.type.FAMILY_VISIT') : t('appointments.type.MEDICAL')} />
                <Badge label={t(`appointments.status.${upcoming[0].status}` as any)} color={getStatusColor(upcoming[0].status)} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      )}

      <AppointmentsList
        appointments={getFilteredAppointments()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onAppointmentPress={(apt) => setSelectedAppointment(apt)}
        emptyMessage={getEmptyMessage()}
      />

      <ScheduleAppointmentModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSaved={() => { setShowForm(false); refetch(); }}
      />

      {selectedAppointment && (
        <AppointmentDetailModal
          visible={!!selectedAppointment}
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </View>
  );
}

function AppointmentsList({ appointments, refreshing, onRefresh, onAppointmentPress, emptyMessage }: {
  appointments: Appointment[]; refreshing: boolean; onRefresh: () => void;
  onAppointmentPress: (apt: Appointment) => void; emptyMessage: string;
}) {
  const { t } = useTranslation();

  if (appointments.length === 0) {
    return (
      <View style={listStyles.container}>
        <EmptyState icon="calendar" message={emptyMessage} />
      </View>
    );
  }

  const groupedByMonth = appointments.reduce((acc, apt) => {
    const month = new Date(apt.startsAt).toLocaleDateString('es', { year: 'numeric', month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <ScrollView style={listStyles.container} contentContainerStyle={listStyles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
      {Object.entries(groupedByMonth).map(([month, apts]) => (
        <View key={month} style={listStyles.monthSection}>
          <Text style={listStyles.monthTitle}>{month}</Text>
          {apts.map((a) => (
            <TouchableOpacity key={a.id} onPress={() => onAppointmentPress(a)} activeOpacity={0.7}>
              <Card style={listStyles.apptCard}>
                <View style={listStyles.apptHeader}>
                  <Badge label={a.appointmentType === 'FAMILY_VISIT' ? t('appointments.type.FAMILY_VISIT') : t('appointments.type.MEDICAL')} />
                  <Badge label={t(`appointments.status.${a.status}` as any)} color={getStatusColor(a.status)} />
                </View>
                <Text style={listStyles.apptReason}>{a.reason}</Text>
                <View style={listStyles.apptTime}>
                  <Feather name="clock" size={14} color={colors.textMuted} />
                  <Text style={listStyles.apptDate}>
                    {new Date(a.startsAt).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}
                    {new Date(a.startsAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function ScheduleAppointmentModal({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const { schedule, submitting } = useScheduleFamilyVisit();

  const [appointmentType, setAppointmentType] = useState<'FAMILY_VISIT' | 'MEDICAL'>('FAMILY_VISIT');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appointmentTypeOptions = [
    { value: 'FAMILY_VISIT', label: t('appointments.type.FAMILY_VISIT') },
    { value: 'MEDICAL', label: t('appointments.type.MEDICAL') },
  ];

  const handleSchedule = async () => {
    const patientId = profilesStore.getLinkedPatientId();
    const familyMemberId = profilesStore.getFamilyMemberId();
    const startsAt = appointmentDate && appointmentTime ? `${appointmentDate}T${appointmentTime}:00` : '';
    if (!patientId || !startsAt) return;

    setError(null);

    if (appointmentType === 'MEDICAL') {
      const doctor = profilesStore.getReferenceDoctor();
      if (!doctor) {
        setError(t('appointments.form.medicalRequiresDoctor'));
        return;
      }

      try {
        await appointmentsApi.post('/appointments/medical', {
          patientId,
          doctorProfileId: doctor.id,
          startsAt,
          durationInMinutes: Number(duration),
          reason,
        });
        setSuccess(true);
        setTimeout(() => {
          setAppointmentDate(''); setAppointmentTime(''); setDuration('60'); setReason(''); setAppointmentType('FAMILY_VISIT');
          setSuccess(false);
          onSaved();
        }, 1500);
        return;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError(t('appointments.form.medicalRequiresAssignment'));
          return;
        }

        setError(t('appointments.form.scheduleFailed'));
        return;
      }
    }

    if (!familyMemberId) return;

    const result = await schedule({
      patientId,
      familyMemberProfileId: familyMemberId,
      startsAt,
      durationInMinutes: Number(duration),
      reason,
    });

    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setAppointmentDate(''); setAppointmentTime(''); setDuration('60'); setReason(''); setAppointmentType('FAMILY_VISIT');
        setSuccess(false);
        onSaved();
      }, 1500);
    } else {
      setError(t('appointments.form.scheduleFailed'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.headerTitle}>{t('appointments.form.title')}</Text>
          <Button title={t('common.cancel')} onPress={onClose} variant="ghost" />
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          {success ? (
            <View style={modalStyles.successContainer}>
              <View style={modalStyles.successIcon}>
                <Feather name="check" size={32} color="#16a34a" />
              </View>
              <Text style={modalStyles.successTitle}>{t('appointments.form.success')}</Text>
              <Text style={modalStyles.successText}>{t('appointments.form.successText')}</Text>
            </View>
          ) : (
            <>
              <Select
                label={t('appointments.form.appointmentType')}
                options={appointmentTypeOptions}
                value={appointmentType}
                onChange={(value) => setAppointmentType(value as 'FAMILY_VISIT' | 'MEDICAL')}
              />
              <TextInput
                label={t('appointments.form.date')}
                value={appointmentDate}
                onChangeText={setAppointmentDate}
                placeholder="2026-07-10"
              />
              <TextInput
                label={t('appointments.form.time')}
                value={appointmentTime}
                onChangeText={setAppointmentTime}
                placeholder="14:00"
              />
              <TextInput
                label={t('appointments.form.duration')}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="60"
              />
              <TextInput
                label={t('appointments.form.reason')}
                value={reason}
                onChangeText={setReason}
                placeholder={t('appointments.form.reasonPlaceholder')}
                multiline
                numberOfLines={3}
              />
              {error ? <Text style={modalStyles.errorText}>{error}</Text> : null}
              <Button
                title={submitting ? t('common.saving') : t('appointments.form.submit')}
                onPress={handleSchedule}
                loading={submitting}
                disabled={!appointmentDate || !appointmentTime || !reason}
                style={modalStyles.submitButton}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AppointmentDetailModal({ visible, appointment, onClose }: { visible: boolean; appointment: Appointment; onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={detailStyles.container}>
        <View style={detailStyles.header}>
          <Text style={detailStyles.headerTitle}>{t('appointments.detail.title')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={detailStyles.content}>
          <Card style={detailStyles.infoCard}>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('appointments.detail.type')}</Text>
              <Badge label={appointment.appointmentType === 'FAMILY_VISIT' ? t('appointments.type.FAMILY_VISIT') : t('appointments.type.MEDICAL')} />
            </View>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('appointments.detail.status')}</Text>
              <Badge label={t(`appointments.status.${appointment.status}` as any)} color={getStatusColor(appointment.status)} />
            </View>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('appointments.detail.reason')}</Text>
              <Text style={detailStyles.infoValue}>{appointment.reason}</Text>
            </View>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('appointments.detail.start')}</Text>
              <Text style={detailStyles.infoValue}>{new Date(appointment.startsAt).toLocaleString()}</Text>
            </View>
            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.infoLabel}>{t('appointments.detail.end')}</Text>
              <Text style={detailStyles.infoValue}>{new Date(appointment.endsAt).toLocaleString()}</Text>
            </View>
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

function getStatusColor(status: string): 'green' | 'red' | 'blue' | 'yellow' {
  switch (status) {
    case 'COMPLETED': return 'green';
    case 'CANCELLED': return 'red';
    case 'IN_PROGRESS': return 'blue';
    default: return 'yellow';
  }
}

const listStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  monthSection: { marginBottom: spacing.xl },
  monthTitle: { fontFamily: fontFamilyBold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.md, textTransform: 'capitalize' },
  apptCard: { marginBottom: spacing.md },
  apptHeader: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  apptReason: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.xs },
  apptTime: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  apptDate: { fontFamily, fontSize: 13, color: colors.textMuted },
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
  submitButton: { marginTop: spacing.xl },
  errorText: { fontFamily, fontSize: 13, color: colors.error, lineHeight: 18, marginTop: spacing.sm },
  successContainer: { alignItems: 'center', paddingVertical: spacing.xxxl },
  successIcon: { width: 64, height: 64, borderRadius: radius.full, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  successTitle: { fontFamily: fontFamilyBold, fontSize: 18, color: '#16a34a', marginBottom: spacing.sm },
  successText: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
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
  infoValue: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary, flex: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md,
  },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5 },
  addButton: {
    width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  upcomingSection: { padding: spacing.lg, paddingBottom: 0 },
  upcomingTitle: { fontFamily: fontFamilyBold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.md },
  nextCard: { marginBottom: spacing.lg },
  nextHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  iconCircle: { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  nextInfo: { flex: 1 },
  nextReason: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  nextDate: { fontFamily, fontSize: 13, color: colors.textMuted, marginBottom: 2, textTransform: 'capitalize' },
  nextTime: { fontFamily, fontSize: 13, color: colors.textMuted },
  nextFooter: { flexDirection: 'row', gap: spacing.sm },
});

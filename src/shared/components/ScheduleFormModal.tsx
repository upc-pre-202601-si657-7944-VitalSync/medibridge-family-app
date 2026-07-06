import { useState } from 'react';
import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { Select } from './Select';
import { useCreateSchedule } from '../../features/medication/application/use-medication';
import { profilesStore } from '../../core/storage/profiles-store';
import { FrequencyType } from '../../features/medication/domain/models';
import { colors, spacing, fontFamily, fontFamilyBold } from '../theme';

interface ScheduleFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  medicationId: number;
  medicationName?: string;
}

export function ScheduleFormModal({ visible, onClose, onSaved, medicationId, medicationName }: ScheduleFormModalProps) {
  const { t } = useTranslation();
  const { create, submitting } = useCreateSchedule();

  const [frequency, setFrequency] = useState<FrequencyType>('DAILY');
  const [timesPerDay, setTimesPerDay] = useState('1');
  const [time, setTime] = useState('08:00');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const frequencyOptions = [
    { value: 'DAILY', label: t('medication.schedule.frequency.DAILY') },
    { value: 'WEEKLY', label: t('medication.schedule.frequency.WEEKLY') },
    { value: 'MONTHLY', label: t('medication.schedule.frequency.MONTHLY') },
    { value: 'EVERY_12_HOURS', label: t('medication.schedule.frequency.EVERY_12_HOURS') },
    { value: 'EVERY_8_HOURS', label: t('medication.schedule.frequency.EVERY_8_HOURS') },
    { value: 'EVERY_6_HOURS', label: t('medication.schedule.frequency.EVERY_6_HOURS') },
    { value: 'AS_NEEDED', label: t('medication.schedule.frequency.AS_NEEDED') },
  ];

  const handleSave = async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) return;

    const success = await create({
      medicationId,
      patientId,
      frequencyType: frequency,
      timesPerDay: Number(timesPerDay),
      administrationTime: time,
      startDate,
      endDate: endDate || startDate,
    });

    if (success) {
      setFrequency('DAILY');
      setTimesPerDay('1');
      setTime('08:00');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      onSaved();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('medication.schedule.title')}</Text>
          <Button title={t('common.cancel')} onPress={onClose} variant="ghost" />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {medicationName && (
            <Text style={styles.medName}>{medicationName}</Text>
          )}

          <Select
            label={t('medication.schedule.frequencyLabel')}
            value={frequency}
            onChange={(v) => setFrequency(v as FrequencyType)}
            options={frequencyOptions}
          />

          <TextInput
            label={t('medication.schedule.timesPerDay')}
            value={timesPerDay}
            onChangeText={setTimesPerDay}
            keyboardType="numeric"
          />

          <TextInput
            label={t('medication.schedule.time')}
            value={time}
            onChangeText={setTime}
            placeholder="08:00"
          />

          <TextInput
            label={t('medication.schedule.startDate')}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2026-07-01"
          />

          <TextInput
            label={t('medication.schedule.endDate')}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="2026-12-31"
          />

          <Button
            title={submitting ? t('common.saving') : t('common.save')}
            onPress={handleSave}
            loading={submitting}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary },
  content: { padding: spacing.lg },
  medName: { fontFamily: fontFamilyBold, fontSize: 16, color: colors.primary, marginBottom: spacing.lg },
  saveButton: { marginTop: spacing.xl },
});

import { useState } from 'react';
import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { Select } from './Select';
import { useRecordDose } from '../../features/medication/application/use-medication';
import { profilesStore } from '../../core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

interface DoseFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  medicationId: number;
  scheduleId: number;
  medicationName?: string;
}

export function DoseFormModal({ visible, onClose, onSaved, medicationId, scheduleId, medicationName }: DoseFormModalProps) {
  const { t } = useTranslation();
  const { record, submitting } = useRecordDose();

  const [notes, setNotes] = useState('');
  const [administeredAt, setAdministeredAt] = useState(new Date().toISOString().slice(0, 16));

  const handleSave = async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) return;

    const success = await record({
      medicationId,
      scheduleId,
      patientId,
      administeredAt: new Date(administeredAt).toISOString(),
      notes,
    });

    if (success) {
      setNotes('');
      setAdministeredAt(new Date().toISOString().slice(0, 16));
      onSaved();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('medication.dose.title')}</Text>
          <Button title={t('common.cancel')} onPress={onClose} variant="ghost" />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {medicationName && (
            <View style={styles.medInfo}>
              <Feather name="box" size={20} color={colors.primary} />
              <Text style={styles.medName}>{medicationName}</Text>
            </View>
          )}

          <TextInput
            label={t('medication.dose.administeredAt')}
            value={administeredAt}
            onChangeText={setAdministeredAt}
            placeholder="2026-07-05T08:00"
          />

          <TextInput
            label={t('medication.dose.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('medication.dose.notesPlaceholder')}
            multiline
            numberOfLines={3}
          />

          <Button
            title={submitting ? t('common.saving') : t('medication.dose.register')}
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
  medInfo: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primaryLight, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.lg,
  },
  medName: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.primary },
  saveButton: { marginTop: spacing.xl },
});

import { useState } from 'react';
import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { Select } from './Select';
import { useRegisterMedication } from '../../features/medication/application/use-medication';
import { profilesStore } from '../../core/storage/profiles-store';
import { DosageUnit, AdministrationRoute } from '../../features/medication/domain/models';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

interface MedicationFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function MedicationFormModal({ visible, onClose, onSaved }: MedicationFormModalProps) {
  const { t } = useTranslation();
  const { register, submitting } = useRegisterMedication();

  const [name, setName] = useState('');
  const [dosageAmount, setDosageAmount] = useState('');
  const [dosageUnit, setDosageUnit] = useState<DosageUnit>('TABLET');
  const [route, setRoute] = useState<AdministrationRoute>('ORAL');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('');
  const [expiration, setExpiration] = useState('');

  const dosageUnitOptions = [
    { value: 'TABLET', label: t('medication.units.TABLET') },
    { value: 'MG', label: t('medication.units.MG') },
    { value: 'ML', label: t('medication.units.ML') },
    { value: 'CAPSULE', label: t('medication.units.CAPSULE') },
    { value: 'DROP', label: t('medication.units.DROP') },
  ];

  const routeOptions = [
    { value: 'ORAL', label: t('medication.routes.ORAL') },
    { value: 'INTRAVENOUS', label: t('medication.routes.INTRAVENOUS') },
    { value: 'INTRAMUSCULAR', label: t('medication.routes.INTRAMUSCULAR') },
    { value: 'SUBCUTANEOUS', label: t('medication.routes.SUBCUTANEOUS') },
    { value: 'TOPICAL', label: t('medication.routes.TOPICAL') },
  ];

  const handleSave = async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) return;

    const success = await register({
      patientId,
      name,
      dosageAmount: Number(dosageAmount),
      dosageUnit,
      administrationRoute: route,
      stockQuantity: Number(stock),
      lowStockThreshold: Number(threshold),
      expirationDate: expiration,
    });

    if (success) {
      setName(''); setDosageAmount(''); setDosageUnit('TABLET');
      setRoute('ORAL'); setStock(''); setThreshold(''); setExpiration('');
      onSaved();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('medication.form.title')}</Text>
          <Button title={t('common.cancel')} onPress={onClose} variant="ghost" />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            label={t('medication.form.name')}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Losartán 50mg"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <TextInput
                label={t('medication.form.dosage')}
                value={dosageAmount}
                onChangeText={setDosageAmount}
                placeholder="1"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.half}>
              <Select
                label={t('medication.form.unit')}
                value={dosageUnit}
                onChange={(v) => setDosageUnit(v as DosageUnit)}
                options={dosageUnitOptions}
              />
            </View>
          </View>

          <Select
            label={t('medication.form.route')}
            value={route}
            onChange={(v) => setRoute(v as AdministrationRoute)}
            options={routeOptions}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <TextInput
                label={t('medication.form.stock')}
                value={stock}
                onChangeText={setStock}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.half}>
              <TextInput
                label={t('medication.form.threshold')}
                value={threshold}
                onChangeText={setThreshold}
                placeholder="10"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TextInput
            label={t('medication.form.expiration')}
            value={expiration}
            onChangeText={setExpiration}
            placeholder="2027-12-31"
          />

          <Button
            title={submitting ? t('common.saving') : t('common.save')}
            onPress={handleSave}
            loading={submitting}
            disabled={!name || !dosageAmount || !stock}
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
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  saveButton: { marginTop: spacing.xl },
});

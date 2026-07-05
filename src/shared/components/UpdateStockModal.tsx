import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { useUpdateStock } from '../../features/medication/application/use-medication';
import { colors, spacing, fontFamily, fontFamilyBold } from '../theme';

interface UpdateStockModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  medicationId: number;
  currentStock: number;
  medicationName?: string;
}

export function UpdateStockModal({ visible, onClose, onSaved, medicationId, currentStock, medicationName }: UpdateStockModalProps) {
  const { t } = useTranslation();
  const { update, submitting } = useUpdateStock();
  const [stock, setStock] = useState(String(currentStock));

  useEffect(() => {
    if (visible) setStock(String(currentStock));
  }, [visible, currentStock]);

  const handleSave = async () => {
    const success = await update(medicationId, Number(stock));
    if (success) onSaved();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>{t('medication.stock.title')}</Text>
            {medicationName && (
              <Text style={styles.medName}>{medicationName}</Text>
            )}
            <Text style={styles.current}>
              {t('medication.stock.current')}: {currentStock}
            </Text>
            <TextInput
              label={t('medication.stock.new')}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
            <View style={styles.buttons}>
              <Button
                title={t('common.cancel')}
                onPress={onClose}
                variant="outline"
                style={styles.button}
              />
              <Button
                title={submitting ? t('common.saving') : t('common.save')}
                onPress={handleSave}
                loading={submitting}
                style={styles.button}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
  },
  container: { width: '100%', maxWidth: 400 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
  title: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.md },
  medName: { fontFamily: fontFamilyBold, fontSize: 16, color: colors.primary, marginBottom: spacing.sm },
  current: { fontFamily, fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  buttons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  button: { flex: 1 },
});

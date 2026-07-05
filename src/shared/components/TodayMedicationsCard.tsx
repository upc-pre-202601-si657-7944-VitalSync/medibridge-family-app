import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMedications, useMedicationSchedules } from '../../features/medication/application/use-medication';
import { Card } from './Card';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

export function TodayMedicationsCard() {
  const { medications } = useMedications();
  const { schedules } = useMedicationSchedules();

  const todaySchedules = schedules.slice(0, 3);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: '#ccfbf1' }]}>
          <Feather name="clock" size={20} color="#0d9488" />
        </View>
        <Text style={styles.title}>Medicamentos Hoy</Text>
        <TouchableOpacity onPress={() => router.push('/(family)/medication')}>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      {todaySchedules.length > 0 ? (
        <View style={styles.list}>
          {todaySchedules.map((schedule) => {
            const med = medications.find(m => m.id === schedule.medicationId);
            return (
              <View key={schedule.id} style={styles.medRow}>
                <View style={[styles.dot, { backgroundColor: '#0d9488' }]} />
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med?.name || 'Medicamento'}</Text>
                  <Text style={styles.medTime}>{schedule.administrationTime}</Text>
                </View>
                <View style={styles.dosePill}>
                  <Text style={styles.doseText}>{med?.dosageAmount} {med?.dosageUnit}</Text>
                </View>
              </View>
            );
          })}
          {schedules.length > 3 && (
            <Text style={styles.more}>+{schedules.length - 3} mas hoy</Text>
          )}
        </View>
      ) : (
        <Text style={styles.empty}>No hay horarios activos</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconCircle: { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  title: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, flex: 1 },
  list: { gap: spacing.sm },
  medRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: radius.full, marginRight: spacing.sm },
  medInfo: { flex: 1 },
  medName: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary },
  medTime: { fontFamily, fontSize: 12, color: colors.textMuted },
  dosePill: { backgroundColor: '#ccfbf1', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  doseText: { fontFamily, fontSize: 11, color: '#0d9488' },
  more: { fontFamily, fontSize: 12, color: colors.primary, textAlign: 'center', marginTop: spacing.sm },
  empty: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
});

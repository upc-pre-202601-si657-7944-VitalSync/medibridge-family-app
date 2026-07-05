import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppointments } from '../../features/appointments/application/use-appointments';
import { Card } from './Card';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

export function NextAppointmentCard() {
  const { nextAppointment, loading } = useAppointments();

  if (loading) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: '#ede9fe' }]}>
          <Feather name="calendar" size={20} color="#7c3aed" />
        </View>
        <Text style={styles.title}>Proxima Cita</Text>
        <TouchableOpacity onPress={() => router.push('/(family)/appointments')}>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      {nextAppointment ? (
        <View style={styles.content}>
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>{new Date(nextAppointment.startsAt).getDate()}</Text>
            <Text style={styles.dateMonth}>
              {new Date(nextAppointment.startsAt).toLocaleDateString('es', { month: 'short' })}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.reason}>{nextAppointment.reason}</Text>
            <Text style={styles.time}>
              {new Date(nextAppointment.startsAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              {' - '}
              {new Date(nextAppointment.endsAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={styles.typePill}>
              <Text style={styles.typeText}>
                {nextAppointment.appointmentType === 'FAMILY_VISIT' ? 'Visita Familiar' : 'Cita Medica'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.empty}>No hay citas programadas</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconCircle: { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  title: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, flex: 1 },
  content: { flexDirection: 'row', gap: spacing.md },
  dateBox: {
    width: 56, height: 60, backgroundColor: '#7c3aed', borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  dateDay: { fontFamily: fontFamilyBold, fontSize: 22, color: '#fff' },
  dateMonth: { fontFamily, fontSize: 12, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  info: { flex: 1 },
  reason: { fontFamily: fontFamilySemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: 4 },
  time: { fontFamily, fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  typePill: {
    alignSelf: 'flex-start', backgroundColor: '#ede9fe',
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full,
  },
  typeText: { fontFamily, fontSize: 11, color: '#7c3aed' },
  empty: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
});

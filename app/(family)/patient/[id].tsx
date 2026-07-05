import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Card, LoadingSpinner } from '../../../src/shared/components';
import { profilesApi } from '../../../src/core/api/services';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold } from '../../../src/shared/theme';

export default function PatientDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<{ id: number; fullName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      profilesApi.get(`/profiles/patients/${id}`)
        .then(({ data }) => setPatient(data))
        .catch((error) => {
          if (axios.isAxiosError(error)) {
            console.error('[patient-detail] load failed', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            });
          }
        })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!patient) {
    return <View style={styles.container}><Text style={styles.empty}>Paciente no encontrado.</Text></View>;
  }

  const initials = patient.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{patient.fullName}</Text>
        <View style={styles.pill}><Text style={styles.pillText}>ID: {patient.id}</Text></View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  empty: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxxl },
  card: { alignItems: 'center', paddingVertical: spacing.xxl },
  avatar: {
    width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  avatarText: { fontFamily: fontFamilySemiBold, fontSize: 28, color: '#fff' },
  name: { fontFamily: fontFamilySemiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.md },
  pill: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  pillText: { fontFamily, fontSize: 13, color: colors.primary },
});

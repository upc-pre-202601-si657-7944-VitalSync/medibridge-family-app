import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Card, LoadingSpinner, EmptyState } from '../../../src/shared/components';
import { profilesApi } from '../../../src/core/api/services';
import { profilesStore } from '../../../src/core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../../src/shared/theme';

interface DoctorInfo { id: number; userId: number; fullName: string }

export default function DoctorPage() {
  const { t } = useTranslation();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo | null>(profilesStore.getReferenceDoctor());
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDoctors = useCallback(async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, index) => profilesApi.get(`/profiles/doctors/${index + 1}`)),
    );

    setDoctors(results.flatMap((result) => (
      result.status === 'fulfilled' && result.value.data ? [result.value.data as DoctorInfo] : []
    )));
    setSelectedDoctor(profilesStore.getReferenceDoctor());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadDoctors(); }, [loadDoctors]);

  const handleSelectDoctor = (doctor: DoctorInfo) => {
    profilesStore.setReferenceDoctor(doctor);
    setSelectedDoctor(doctor);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
      <Text style={styles.title}>{t('profiles.doctor.title')}</Text>
      <Text style={styles.subtitle}>{t('profiles.doctor.description')}</Text>

      {selectedDoctor ? (
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-md" size={34} color="#fff" />
          </View>
          <Text style={styles.profileName}>{selectedDoctor.fullName}</Text>
          <Text style={styles.referenceText}>{t('profiles.doctor.referenceSelected')}</Text>
        </Card>
      ) : (
        <EmptyState icon="activity" message={t('profiles.doctor.empty')} />
      )}

      <Text style={styles.sectionTitle}>{t('profiles.doctor.availableTitle')}</Text>
      <Text style={styles.sectionDescription}>{t('profiles.doctor.availableDescription')}</Text>

      {doctors.length === 0 ? (
        <Card style={styles.gapCard}>
          <Text style={styles.gapText}>{t('profiles.doctor.noAvailable')}</Text>
        </Card>
      ) : doctors.map((doctor) => {
        const selected = selectedDoctor?.id === doctor.id;
        return (
          <TouchableOpacity key={doctor.id} activeOpacity={0.75} onPress={() => handleSelectDoctor(doctor)}>
            <Card style={selected ? { ...styles.doctorCard, ...styles.doctorCardSelected } : styles.doctorCard}>
              <View style={styles.doctorAvatar}>
                <FontAwesome5 name="user-md" size={18} color="#0d9488" />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.fullName}</Text>
                <Text style={styles.doctorMeta}>{t('profiles.doctor.availableRole')}</Text>
              </View>
              {selected ? <Feather name="check-circle" size={22} color="#16a34a" /> : <Feather name="chevron-right" size={20} color={colors.textMuted} />}
            </Card>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing.xs },
  subtitle: { fontFamily, fontSize: 14, color: colors.textMuted, marginBottom: spacing.xl },
  profileCard: { alignItems: 'center', paddingVertical: spacing.xxl },
  avatar: {
    width: 80, height: 80, borderRadius: radius.full, backgroundColor: '#0d9488',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  profileName: { fontFamily: fontFamilySemiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.md },
  referenceText: { fontFamily, fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  sectionTitle: { fontFamily: fontFamilySemiBold, fontSize: 18, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.xs },
  sectionDescription: { fontFamily, fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: spacing.md },
  doctorCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, marginBottom: spacing.md },
  doctorCardSelected: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  doctorAvatar: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center' },
  doctorInfo: { flex: 1, marginLeft: spacing.md },
  doctorName: { fontFamily: fontFamilySemiBold, fontSize: 15, color: colors.textPrimary },
  doctorMeta: { fontFamily, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  gapCard: { marginTop: spacing.xl, padding: spacing.lg, backgroundColor: '#fefce8', borderRadius: radius.lg },
  gapText: { fontFamily, fontSize: 13, color: colors.warning, textAlign: 'center' },
});

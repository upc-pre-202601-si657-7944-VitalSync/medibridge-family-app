import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { router, useSegments } from 'expo-router';
import axios from 'axios';
import { Banner, Button, Card, LoadingSpinner, EmptyState } from '../../../src/shared/components';
import { profilesApi } from '../../../src/core/api/services';
import { profilesStore } from '../../../src/core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../../src/shared/theme';

interface DoctorInfo { id: number; userId: number; fullName: string }

const DOCTOR_DISCOVERY_LIMIT = 50;

function uniqueDoctors(doctors: DoctorInfo[]): DoctorInfo[] {
  const byId = new Map<number, DoctorInfo>();
  doctors.forEach((doctor) => {
    if (doctor.id > 0 && doctor.fullName?.trim()) byId.set(doctor.id, doctor);
  });
  return Array.from(byId.values());
}

function looksLikeDemoDoctor(doctor: DoctorInfo): boolean {
  const name = doctor.fullName.trim().toLowerCase();
  return /\b(demo|smoke|duplicate)\b/.test(name)
    || /\btest\s*\d{6,}\b/.test(name)
    || /\bdoctor\s+[a-f0-9]{6,}\b/.test(name)
    || /\bcare doctor\s+[a-f0-9]{6,}\b/.test(name);
}

async function fetchDoctorsByIds(ids: number[]): Promise<DoctorInfo[]> {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id) && id > 0)));
  if (uniqueIds.length === 0) return [];

  const results = await Promise.allSettled(
    uniqueIds.map((id) => profilesApi.get(`/profiles/doctors/${id}`)),
  );

  return uniqueDoctors(results.flatMap((result) => (
    result.status === 'fulfilled' && result.value.data ? [result.value.data as DoctorInfo] : []
  )));
}

async function discoverSetupDoctors(): Promise<DoctorInfo[]> {
  const results = await Promise.allSettled(
    Array.from({ length: DOCTOR_DISCOVERY_LIMIT }, (_, index) => profilesApi.get(`/profiles/doctors/${index + 1}`)),
  );

  return uniqueDoctors(results.flatMap((result) => (
    result.status === 'fulfilled' && result.value.data ? [result.value.data as DoctorInfo] : []
  ))).filter((doctor) => !looksLikeDemoDoctor(doctor));
}

export default function DoctorPage() {
  const { t } = useTranslation();
  const segments = useSegments();
  const isSetup = segments.includes('setup');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo | null>(profilesStore.getReferenceDoctor());
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    const storedReference = profilesStore.getReferenceDoctor();

    try {
      let availableDoctors: DoctorInfo[] = [];

      if (patientId) {
        const { data } = await profilesApi.get(`/profiles/patients/${patientId}/care-team-members`);
        const doctorProfileIds = Array.isArray(data?.doctorProfileIds) ? data.doctorProfileIds : [];
        availableDoctors = await fetchDoctorsByIds(doctorProfileIds);
      }

      if ((!patientId || (isSetup && availableDoctors.length === 0))) {
        availableDoctors = uniqueDoctors([
          ...(storedReference ? [storedReference] : []),
          ...(await discoverSetupDoctors()),
        ]);
      }

      const selected = storedReference && availableDoctors.some((doctor) => doctor.id === storedReference.id)
        ? availableDoctors.find((doctor) => doctor.id === storedReference.id) ?? null
        : availableDoctors[0] ?? null;

      if (selected) {
        profilesStore.setReferenceDoctor(selected);
      } else {
        profilesStore.clearReferenceDoctor();
      }
      setDoctors(availableDoctors);
      setSelectedDoctor(selected);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('[doctor] load failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      const fallbackDoctors = storedReference ? [storedReference] : [];
      setDoctors(fallbackDoctors);
      setSelectedDoctor(storedReference);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSetup]);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadDoctors(); }, [loadDoctors]);

  const handleSelectDoctor = async (doctor: DoctorInfo) => {
    if (assigning) return;
    profilesStore.setReferenceDoctor(doctor);
    setSelectedDoctor(doctor);
    setAssignmentError(null);

    if (!isSetup) return;

    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) {
      setAssignmentError(t('profiles.errors.patientLinkFailed'));
      return;
    }

    setAssigning(true);
    try {
      await profilesApi.post(`/profiles/patients/${patientId}/doctors/${doctor.id}`, {});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) return;
        console.warn('[doctor] assign failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setAssignmentError(t('profiles.errors.doctorAssignFailed'));
    } finally {
      setAssigning(false);
    }
  };

  const handleBackToSetup = () => {
    router.replace('/(auth)/setup' as any);
  };

  const handleFinishSetup = () => {
    profilesStore.setSetupFinished(true);
    router.replace('/(family)/dashboard' as any);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, isSetup && styles.setupContent]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <Text style={styles.title}>{t('profiles.doctor.title')}</Text>
        <Text style={styles.subtitle}>{t('profiles.doctor.description')}</Text>
        {assignmentError ? <Banner type="error" message={assignmentError} /> : null}
        {isSetup && selectedDoctor && !assignmentError ? (
          <Banner type="success" message={t('profiles.doctor.assignmentSaved')} />
        ) : null}

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
            <TouchableOpacity
              key={doctor.id}
              activeOpacity={0.75}
              onPress={() => { void handleSelectDoctor(doctor); }}
              disabled={assigning}
            >
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

      {isSetup ? (
        <View style={styles.setupFooter}>
          <Button
            title={t('common.back')}
            variant="outline"
            icon="arrow-left"
            onPress={handleBackToSetup}
            disabled={assigning}
            style={styles.footerButton}
          />
          <Button
            title={t('setup.finish')}
            icon="check-circle"
            onPress={handleFinishSetup}
            loading={assigning}
            style={styles.footerButton}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  setupContent: { paddingBottom: 120 },
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
  setupFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  footerButton: { flex: 1 },
});

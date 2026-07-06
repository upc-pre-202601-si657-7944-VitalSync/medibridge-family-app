import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Card, LoadingSpinner, EmptyState } from '../../src/shared/components';
import { profilesApi } from '../../src/core/api/services';
import { profilesStore } from '../../src/core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

interface DoctorInfo {
  id: number;
  userId: number;
  fullName: string;
  specialty?: string;
}

interface FamilyMemberInfo {
  id: number;
  userId: number;
  fullName: string;
  relationship?: string;
}

export default function CareTeamPage() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCareTeam = async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const loadOwnFamilyProfile = async () => {
      const familyMemberId = profilesStore.getFamilyMemberId();
      if (!familyMemberId) return;

      const { data } = await profilesApi.get(`/profiles/family-members/${familyMemberId}`);
      setFamilyMembers(data ? [data] : []);
    };

    try {
      const { data } = await profilesApi.get(`/internal/profiles/patients/${patientId}/care-team-members`);
      const doctorProfileIds = Array.isArray(data?.doctorProfileIds) ? data.doctorProfileIds : [];
      const familyMemberProfileIds = Array.isArray(data?.familyMemberProfileIds) ? data.familyMemberProfileIds : [];

      const [doctorProfiles, familyProfiles] = await Promise.all([
        Promise.allSettled(doctorProfileIds.map((id: number) => profilesApi.get(`/profiles/doctors/${id}`))),
        Promise.allSettled(familyMemberProfileIds.map((id: number) => profilesApi.get(`/profiles/family-members/${id}`))),
      ]);

      setDoctors(doctorProfiles
        .filter((result): result is PromiseFulfilledResult<{ data: DoctorInfo }> => result.status === 'fulfilled')
        .map((result) => result.value.data));

      setFamilyMembers(familyProfiles
        .filter((result): result is PromiseFulfilledResult<{ data: FamilyMemberInfo }> => result.status === 'fulfilled')
        .map((result) => result.value.data));
    } catch {
      await loadOwnFamilyProfile();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCareTeam();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCareTeam();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>{t('careTeam.title')}</Text>
      <Text style={styles.subtitle}>{t('careTeam.subtitle')}</Text>

      {/* Doctores */}
      <Text style={styles.sectionTitle}>{t('careTeam.doctors')}</Text>
      {doctors.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EmptyState icon="activity" message={t('careTeam.noDoctors')} />
        </Card>
      ) : (
        doctors.map((doctor) => (
          <Card key={doctor.id} style={styles.memberCard}>
            <View style={[styles.avatar, { backgroundColor: '#0d9488' }]}>
              <Text style={styles.avatarText}>
                {doctor.fullName?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{doctor.fullName}</Text>
              {doctor.specialty && (
                <Text style={styles.memberRole}>{doctor.specialty}</Text>
              )}
              <View style={styles.badge}>
                <Feather name="activity" size={12} color="#0d9488" />
                <Text style={styles.badgeText}>{t('careTeam.doctor')}</Text>
              </View>
            </View>
          </Card>
        ))
      )}

      {/* Familiares */}
      <Text style={styles.sectionTitle}>{t('careTeam.familyMembers')}</Text>
      {familyMembers.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EmptyState icon="users" message={t('careTeam.noFamilyMembers')} />
        </Card>
      ) : (
        familyMembers.map((member) => (
          <Card key={member.id} style={styles.memberCard}>
            <View style={[styles.avatar, { backgroundColor: '#7c3aed' }]}>
              <Text style={styles.avatarText}>
                {member.fullName?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.fullName}</Text>
              {member.relationship && (
                <Text style={styles.memberRole}>{member.relationship}</Text>
              )}
              <View style={styles.badge}>
                <Feather name="users" size={12} color="#7c3aed" />
                <Text style={styles.badgeText}>{t('careTeam.family')}</Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing.xs },
  subtitle: { fontFamily, fontSize: 14, color: colors.textMuted, marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fontFamilySemiBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.lg },
  emptyCard: { marginBottom: spacing.md },
  memberCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { fontFamily: fontFamilySemiBold, fontSize: 22, color: '#fff' },
  memberInfo: { flex: 1 },
  memberName: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 2 },
  memberRole: { fontFamily, fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, alignSelf: 'flex-start' },
  badgeText: { fontFamily, fontSize: 11, color: colors.primary },
});

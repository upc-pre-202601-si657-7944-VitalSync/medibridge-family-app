import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, LoadingSpinner, EmptyState } from '../../../src/shared/components';
import { profilesApi } from '../../../src/core/api/services';
import { profilesStore } from '../../../src/core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../../src/shared/theme';

interface DoctorInfo { id: number; userId: number; fullName: string }

export default function DoctorPage() {
  const { t } = useTranslation();
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const linkedPatientId = profilesStore.getLinkedPatientId();

  const loadDoctor = useCallback(async () => {
    if (!linkedPatientId) { setLoading(false); setRefreshing(false); return; }
    try {
      const familyMemberId = profilesStore.getFamilyMemberId();
      if (!familyMemberId) { setLoading(false); setRefreshing(false); return; }
      const { data } = await profilesApi.get(`/profiles/family-members/${familyMemberId}/doctor`);
      if (data) setDoctor(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[doctor] load failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setDoctor(null);
    } finally { setLoading(false); setRefreshing(false); }
  }, [linkedPatientId]);

  useEffect(() => { loadDoctor(); }, [loadDoctor]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadDoctor(); }, [loadDoctor]);

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
      <Text style={styles.title}>{t('profiles.doctor.title')}</Text>
      <Text style={styles.subtitle}>{t('profiles.doctor.description')}</Text>

      {doctor ? (
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{doctor.fullName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.profileName}>{doctor.fullName}</Text>
          <View style={styles.metaPill}><Text style={styles.metaText}>ID: {doctor.id}</Text></View>
        </Card>
      ) : (
        <EmptyState icon="activity" message={t('profiles.doctor.empty')} />
      )}

      <Card style={styles.gapCard}>
        <Text style={styles.gapText}>{t('profiles.doctor.backendGap')}</Text>
      </Card>
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
  avatarText: { fontFamily: fontFamilySemiBold, fontSize: 28, color: '#fff' },
  profileName: { fontFamily: fontFamilySemiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.md },
  metaPill: { backgroundColor: '#ccfbf1', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  metaText: { fontFamily, fontSize: 13, color: '#0d9488' },
  gapCard: { marginTop: spacing.xl, padding: spacing.lg, backgroundColor: '#fefce8', borderRadius: radius.lg },
  gapText: { fontFamily, fontSize: 13, color: colors.warning, textAlign: 'center' },
});

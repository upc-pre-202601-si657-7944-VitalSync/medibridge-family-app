import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { Button, TextInput, Card, Banner, LoadingSpinner, EmptyState } from '../../../src/shared/components';
import { profilesApi } from '../../../src/core/api/services';
import { profilesStore } from '../../../src/core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../../src/shared/theme';

interface PatientInfo { id: number; fullName: string }

export default function PatientPage() {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatient = useCallback(async () => {
    const linkedPatientId = profilesStore.getLinkedPatientId();
    if (!linkedPatientId) { setLoading(false); setRefreshing(false); return; }
    try {
      const { data } = await profilesApi.get(`/profiles/patients/${linkedPatientId}`);
      if (data) setPatient(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[patient] load failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setPatient(null);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadPatient(); }, [loadPatient]);

  const handleLink = async () => {
    const familyMemberId = profilesStore.getFamilyMemberId();
    if (!familyMemberId || !patientIdInput.trim()) return;
    setLinking(true); setError(null);
    try {
      await profilesApi.post(`/profiles/patients/${patientIdInput}/family-members/${familyMemberId}`, {});
      profilesStore.setLinkedPatientId(Number(patientIdInput));
      await loadPatient();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[patient] link failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setError(t('profiles.errors.patientLinkFailed'));
    }
    finally { setLinking(false); }
  };

  const onRefresh = useCallback(() => { setRefreshing(true); loadPatient(); }, [loadPatient]);

  if (loading) return <LoadingSpinner message={t('profiles.patient.loading')} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
      <Text style={styles.title}>{t('profiles.patient.title')}</Text>
      <Text style={styles.subtitle}>{t('profiles.patient.description')}</Text>
      {error ? <Banner type="error" message={error} /> : null}

      {!profilesStore.getFamilyMemberId() ? (
        <Card style={styles.warningCard}>
          <Feather name="alert-triangle" size={22} color={colors.warning} />
          <Text style={styles.warningText}>{t('profiles.patient.profileRequired')}</Text>
        </Card>
      ) : patient ? (
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patient.fullName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.profileName}>{patient.fullName}</Text>
          <View style={styles.metaPill}><Text style={styles.metaText}>ID: {patient.id}</Text></View>
        </Card>
      ) : (
        <View>
          <EmptyState icon="heart" message={t('profiles.patient.empty')} />
          <Card style={styles.linkCard}>
            <Text style={styles.linkLabel}>{t('profiles.patient.manualLinkLabel')}</Text>
            <TextInput value={patientIdInput} onChangeText={setPatientIdInput}
              placeholder="123" keyboardType="numeric" />
            <Button title={t('profiles.patient.linkSubmit')} onPress={handleLink}
              loading={linking} disabled={!patientIdInput.trim()} />
          </Card>
        </View>
      )}
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
    width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  avatarText: { fontFamily: fontFamilySemiBold, fontSize: 28, color: '#fff' },
  profileName: { fontFamily: fontFamilySemiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.md },
  metaPill: { backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  metaText: { fontFamily, fontSize: 13, color: colors.primary },
  warningCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.warningBg },
  warningText: { flex: 1, fontFamily, fontSize: 14, color: colors.warning },
  linkCard: { padding: spacing.lg, marginTop: spacing.md },
  linkLabel: { fontFamily, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
});

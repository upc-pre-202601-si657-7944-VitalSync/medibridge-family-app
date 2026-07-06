import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { router, useSegments } from 'expo-router';
import axios from 'axios';
import { Button, TextInput, Card, Banner, LoadingSpinner, EmptyState } from '../../../src/shared/components';
import { profilesApi } from '../../../src/core/api/services';
import { profilesStore } from '../../../src/core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../../src/shared/theme';

interface PatientInfo { id: number; fullName: string }

export default function PatientPage() {
  const { t } = useTranslation();
  const segments = useSegments();
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [patientFullName, setPatientFullName] = useState('');
  const [existingPatientId, setExistingPatientId] = useState('');
  const [existingPatient, setExistingPatient] = useState<PatientInfo | null>(null);
  const [existingPatientLookupFailed, setExistingPatientLookupFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [linking, setLinking] = useState(false);
  const [searching, setSearching] = useState(false);
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

  const handleCreateAndLink = async () => {
    const familyMemberId = profilesStore.getFamilyMemberId();
    const fullName = patientFullName.trim();
    if (!familyMemberId || !fullName) return;
    setLinking(true); setError(null);
    try {
      const { data } = await profilesApi.post('/profiles/patients', { fullName });
      await profilesApi.post(`/profiles/patients/${data.id}/family-members/${familyMemberId}`, {});
      profilesStore.setLinkedPatientId(data.id);
      setPatient(data);
      setPatientFullName('');
      if (segments.includes('setup')) {
        router.replace('/(auth)/setup' as any);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[patient] create/link failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setError(t('profiles.errors.patientLinkFailed'));
    }
    finally { setLinking(false); }
  };

  const handleLinkExisting = async () => {
    const familyMemberId = profilesStore.getFamilyMemberId();
    const patientId = existingPatient?.id ?? Number(existingPatientId.trim());
    if (!familyMemberId || !Number.isFinite(patientId) || patientId <= 0) return;
    setLinking(true); setError(null);
    try {
      await profilesApi.post(`/profiles/patients/${patientId}/family-members/${familyMemberId}`, {});
      const { data } = await profilesApi.get(`/profiles/patients/${patientId}`);
      profilesStore.setLinkedPatientId(patientId);
      setPatient(data);
      setExistingPatientId('');
      setExistingPatient(null);
      if (segments.includes('setup')) {
        router.replace('/(auth)/setup' as any);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[patient] link existing failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setError(t('profiles.errors.patientLinkFailed'));
    }
    finally { setLinking(false); }
  };

  useEffect(() => {
    const patientId = Number(existingPatientId.trim());
    setExistingPatient(null);
    setExistingPatientLookupFailed(false);

    if (!Number.isFinite(patientId) || patientId <= 0) return;

    let cancelled = false;
    const timeout = setTimeout(() => {
      setSearching(true);
      profilesApi.get(`/profiles/patients/${patientId}`)
        .then(({ data }) => { if (!cancelled) setExistingPatient(data); })
        .catch(() => { if (!cancelled) setExistingPatientLookupFailed(true); })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 450);

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [existingPatientId]);

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
            <Text style={styles.linkTitle}>{t('profiles.patient.createAndLinkTitle')}</Text>
            <Text style={styles.linkLabel}>{t('profiles.patient.createAndLinkLabel')}</Text>
            <TextInput
              label={t('profiles.patient.fullName')}
              value={patientFullName}
              onChangeText={setPatientFullName}
              placeholder={t('profiles.patient.fullNamePlaceholder')}
            />
            <Button title={t('profiles.patient.createAndLinkSubmit')} onPress={handleCreateAndLink}
              loading={linking} disabled={!patientFullName.trim()} />
          </Card>
          <Card style={styles.linkCard}>
            <Text style={styles.linkTitle}>{t('profiles.patient.linkExistingTitle')}</Text>
            <Text style={styles.linkLabel}>{t('profiles.patient.linkExistingLabel')}</Text>
            <TextInput
              label={t('profiles.patient.existingPatientId')}
              value={existingPatientId}
              onChangeText={setExistingPatientId}
              placeholder="1"
              keyboardType="numeric"
            />
            {searching ? <Text style={styles.lookupText}>{t('profiles.patient.searchingExisting')}</Text> : null}
            {existingPatient ? (
              <View style={styles.foundBox}>
                <Text style={styles.foundLabel}>{t('profiles.patient.foundExisting')}</Text>
                <Text style={styles.foundName}>{existingPatient.fullName}</Text>
                <Text style={styles.foundId}>ID: {existingPatient.id}</Text>
              </View>
            ) : null}
            {existingPatientLookupFailed ? (
              <Text style={styles.lookupError}>{t('profiles.patient.existingNotFound')}</Text>
            ) : null}
            <Button title={t('profiles.patient.linkExistingSubmit')} onPress={handleLinkExisting}
              loading={linking} disabled={!existingPatient} />
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
  linkTitle: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.xs },
  linkLabel: { fontFamily, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  foundBox: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  foundLabel: { fontFamily, fontSize: 12, color: colors.primary, marginBottom: 2 },
  foundName: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary },
  foundId: { fontFamily, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  lookupText: { fontFamily, fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
  lookupError: { fontFamily, fontSize: 13, color: colors.error, marginBottom: spacing.md },
});

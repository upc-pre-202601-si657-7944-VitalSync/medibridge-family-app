import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { Button, TextInput, Card, Banner, LoadingSpinner } from '../../src/shared/components';
import { profilesApi } from '../../src/core/api/services';
import { useAuthStore } from '../../src/core/auth/auth-store';
import { profilesStore } from '../../src/core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

interface FamilyProfile { id: number; userId: number; fullName: string }

export default function ProfilePage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const storedProfile = profilesStore.getFamilyProfile();
      if (storedProfile) {
        setProfile(storedProfile);
        setFullName(storedProfile.fullName);
      }

      const storedId = profilesStore.getFamilyMemberId();
      if (storedId) {
        const { data } = await profilesApi.get(`/profiles/family-members/${storedId}`);
        if (data) {
          profilesStore.setFamilyProfile(data);
          setProfile(data);
          setFullName(data.fullName ?? '');
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[profile] load failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      profilesStore.setFamilyMemberId(0);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true); setError(null);
    try {
      const { data } = await profilesApi.post('/profiles/family-members', { fullName });
      setProfile(data);
      profilesStore.setFamilyProfile(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[profile] create failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setError(t('profiles.errors.createFailed'));
    }
    finally { savingRef.current = false; setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  const initials = profile?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('profiles.family.title')}</Text>
      {error ? <Banner type="error" message={error} /> : null}

      {profile ? (
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{profile.fullName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>ID: {profile.id}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{t('auth.register.roles.FAMILY_MEMBER')}</Text>
            </View>
          </View>
          <Banner type="success" message={t('profiles.family.created')} />
        </Card>
      ) : (
        <Card style={styles.formCard}>
          <TextInput label={t('profiles.family.fullName')} value={fullName}
            onChangeText={setFullName} placeholder="Ej. María García" />
          <Button title={saving ? t('profiles.common.saving') : t('profiles.family.submit')}
            onPress={handleSave} loading={saving} disabled={!fullName.trim()} />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing.xl },
  profileCard: { alignItems: 'center', paddingVertical: spacing.xxl },
  avatar: {
    width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  avatarText: { fontFamily: fontFamilySemiBold, fontSize: 28, color: '#fff' },
  profileName: { fontFamily: fontFamilySemiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  metaPill: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  metaText: { fontFamily, fontSize: 13, color: colors.primary },
  formCard: { padding: spacing.lg },
});

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../../src/shared/components';
import { useAuthStore } from '../../src/core/auth/auth-store';
import { useAuth } from '../../src/features/iam/application/use-auth';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const setLocale = useAuthStore((s) => s.setLocale);
  const { logout } = useAuth();

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setLocale(lang);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/(auth)/login');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      {/* Cuenta */}
      <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
      
      <TouchableOpacity onPress={() => router.push('/(family)/profile')} activeOpacity={0.7}>
        <Card style={styles.settingCard}>
          <View style={[styles.icon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="user" size={20} color={colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{t('settings.profile')}</Text>
            <Text style={styles.desc}>{t('settings.profileDesc')}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(family)/care-team')} activeOpacity={0.7}>
        <Card style={styles.settingCard}>
          <View style={[styles.icon, { backgroundColor: '#ede9fe' }]}>
            <Feather name="users" size={20} color="#7c3aed" />
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{t('settings.careTeam')}</Text>
            <Text style={styles.desc}>{t('settings.careTeamDesc')}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(family)/patient')} activeOpacity={0.7}>
        <Card style={styles.settingCard}>
          <View style={[styles.icon, { backgroundColor: '#fce7f3' }]}>
            <Feather name="heart" size={20} color="#db2777" />
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{t('profiles.sidebar.patient')}</Text>
            <Text style={styles.desc}>{t('profiles.patient.description')}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </Card>
      </TouchableOpacity>

      {/* Suscripción */}
      <Text style={styles.sectionTitle}>{t('settings.subscription')}</Text>

      <TouchableOpacity onPress={() => router.push('/(family)/subscription')} activeOpacity={0.7}>
        <Card style={styles.settingCard}>
          <View style={[styles.icon, { backgroundColor: '#dbeafe' }]}>
            <Feather name="credit-card" size={20} color={colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{t('settings.subscriptionStatus')}</Text>
            <Text style={styles.desc}>{t('settings.subscriptionStatusDesc')}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(family)/subscription')} activeOpacity={0.7}>
        <Card style={styles.settingCard}>
          <View style={[styles.icon, { backgroundColor: '#fef3c7' }]}>
            <Feather name="file-text" size={20} color="#d97706" />
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{t('settings.invoices')}</Text>
            <Text style={styles.desc}>{t('settings.invoicesDesc')}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </Card>
      </TouchableOpacity>

      {/* Preferencias */}
      <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>

      <Card style={styles.settingCard}>
        <View style={[styles.icon, { backgroundColor: colors.primaryLight }]}>
          <Feather name="globe" size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{t('settings.language')}</Text>
          <View style={styles.langOptions}>
            <TouchableOpacity
              onPress={() => { void changeLanguage('es'); }}
              activeOpacity={0.7}
              style={[styles.langBtn, i18n.language === 'es' && styles.langBtnActive]}
            >
              <Text style={[styles.langBtnText, i18n.language === 'es' && styles.langBtnTextActive]}>Español</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { void changeLanguage('en'); }}
              activeOpacity={0.7}
              style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}
            >
              <Text style={[styles.langBtnText, i18n.language === 'en' && styles.langBtnTextActive]}>English</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Cerrar sesión */}
      <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.logoutButton}>
        <Card style={styles.logoutCard}>
          <View style={[styles.icon, { backgroundColor: '#fef2f2' }]}>
            <Feather name="log-out" size={20} color={colors.error} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.label, { color: colors.error }]}>{t('settings.logout')}</Text>
            <Text style={styles.desc}>{t('settings.logoutDesc')}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fontFamilySemiBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.lg },
  settingCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, marginBottom: spacing.md },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: spacing.lg },
  label: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 2 },
  desc: { fontFamily, fontSize: 13, color: colors.textMuted },
  logoutButton: { marginTop: spacing.xl },
  logoutCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: '#fef2f2', borderColor: colors.errorBorder },
  langOptions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  langBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surfaceMuted },
  langBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  langBtnText: { fontFamily: fontFamilySemiBold, fontSize: 13, color: colors.textMuted },
  langBtnTextActive: { color: colors.primary },
});

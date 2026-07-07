import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, TextInput, Select, Banner, Logo } from '../../src/shared/components';
import { useAuth } from '../../src/features/iam/application/use-auth';
import { UserRole } from '../../src/features/iam/domain/enums';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold } from '../../src/shared/theme';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register, isSubmitting, error } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>(UserRole.FAMILY_MEMBER);

  const roleOptions = [
    { value: UserRole.FAMILY_MEMBER, label: t('auth.register.segments.familySupportNetwork') },
    { value: UserRole.CAREGIVER, label: t('auth.register.segments.careStaff') },
  ];

  const handleRegister = async () => {
    const ok = await register({ username, password, role });
    if (ok) router.replace({ pathname: '/(auth)/login', params: { registered: 'true' } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <LinearGradient
          colors={[colors.primary, colors.gradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.brandPanel}
        >
          <View style={styles.logoWrap}>
            <Logo size={64} />
          </View>
          <Text style={styles.brandName}>MediBridge</Text>
          <Text style={styles.brandSub}>{t('auth.register.subtitle')}</Text>
        </LinearGradient>

        <View style={styles.formPanel}>
          <Text style={styles.formTitle}>{t('auth.register.title')}</Text>

          {error ? <Banner type="error" message={t(error)} /> : null}

          <TextInput
            label={t('auth.register.username')}
            placeholder={t('auth.register.placeholderUsername')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            label={t('auth.register.password')}
            placeholder={t('auth.register.placeholderPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Select
            label={t('auth.register.role')}
            options={roleOptions}
            value={role}
            onChange={setRole}
          />
          <Text style={styles.hint}>{t('auth.register.roleHint')}</Text>

          <Button
            title={isSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
            onPress={handleRegister}
            loading={isSubmitting}
            style={styles.submitBtn}
          />

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>{t('auth.register.hasAccount')} </Text>
            <Link href="/(auth)/login" style={styles.link}>{t('auth.register.signIn')}</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1 },
  brandPanel: {
    paddingTop: 70, paddingBottom: spacing.xxxl, paddingHorizontal: spacing.xl,
    alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  logoWrap: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full,
    padding: spacing.md, marginBottom: spacing.md,
  },
  brandName: { fontFamily: fontFamilySemiBold, fontSize: 28, color: '#fff', letterSpacing: -0.5 },
  brandSub: { fontFamily: fontFamily, fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  formPanel: { flex: 1, padding: spacing.xl, paddingTop: spacing.xxl },
  formTitle: { fontFamily: fontFamilySemiBold, fontSize: 26, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing.xl },
  hint: { fontFamily: fontFamily, fontSize: 13, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.lg },
  submitBtn: {
    marginTop: spacing.sm,
    ...Platform.select({
      web: { boxShadow: `0 4px 8px ${colors.primary}4d` },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxl },
  linkText: { fontFamily: fontFamily, fontSize: 14, color: colors.textMuted },
  link: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.primary },
});

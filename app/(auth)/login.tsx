import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, TextInput, Banner, Logo } from '../../src/shared/components';
import { useAuth } from '../../src/features/iam/application/use-auth';
import { subscriptionCheckoutStore } from '../../src/core/storage/subscription-checkout-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold } from '../../src/shared/theme';

export default function LoginPage() {
  const { t } = useTranslation();
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const { login, isSubmitting, error } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const ok = await login({ username, password });
    if (!ok) return;

    if (subscriptionCheckoutStore.getPending()) {
      router.replace('/(family)/subscription');
      return;
    }

    router.replace('/(family)/dashboard');
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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandPanel}
        >
          <View style={styles.logoWrap}>
            <Logo size={72} />
          </View>
          <Text style={styles.brandName}>MediBridge</Text>
          <Text style={styles.brandSub}>{t('auth.brand.headline')}</Text>
        </LinearGradient>

        <View style={styles.formPanel}>
          <Text style={styles.formTitle}>{t('auth.login.title')}</Text>
          <Text style={styles.formEyebrow}>{t('auth.login.eyebrow')}</Text>

          {registered === 'true' && (
            <Banner type="success" message={t('auth.login.registeredSuccess')} />
          )}
          {error ? <Banner type="error" message={t(error)} /> : null}

          <TextInput
            label={t('auth.login.username')}
            placeholder={t('auth.login.placeholderUsername')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            label={t('auth.login.password')}
            placeholder={t('auth.login.placeholderPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
            onPress={handleLogin}
            loading={isSubmitting}
            style={styles.submitBtn}
          />

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>{t('auth.login.noAccount')} </Text>
            <Link href="/(auth)/register" style={styles.link}>{t('auth.login.createAccount')}</Link>
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
    paddingTop: 70,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoWrap: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  brandName: {
    fontFamily: fontFamilySemiBold,
    fontSize: 28,
    color: '#fff',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontFamily: fontFamily,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  formPanel: { flex: 1, padding: spacing.xl, paddingTop: spacing.xxl },
  formTitle: {
    fontFamily: fontFamilySemiBold,
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  formEyebrow: {
    fontFamily: fontFamily,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
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

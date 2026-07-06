import { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscriptionStore } from '../../core/storage/subscription-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

interface PremiumGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

export function PremiumGate({ children, fallback, featureName }: PremiumGateProps) {
  const { t } = useTranslation();
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.lockCircle}>
        <Feather name="lock" size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>{t('premium.title')}</Text>
      {featureName ? (
        <Text style={styles.description}>
          {t('premium.featureDescription', { featureName })}
        </Text>
      ) : (
        <Text style={styles.description}>
          {t('premium.description')}
        </Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(family)/subscription')}
        activeOpacity={0.7}
      >
        <Feather name="star" size={18} color="#fff" />
        <Text style={styles.buttonText}>{t('premium.viewPlans')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PremiumBadge() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  if (!isPremium) return null;

  return (
    <View style={styles.badge}>
      <Feather name="star" size={12} color="#d97706" />
      <Text style={styles.badgeText}>PREMIUM</Text>
    </View>
  );
}

export function PremiumLockOverlay({ featureName }: { featureName?: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.overlayContent}>
        <Feather name="lock" size={24} color={colors.primary} />
        <Text style={styles.overlayText}>
          {t('premium.overlay', { featureName: featureName || t('premium.thisFeature') })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamilyBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  buttonText: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    color: '#fff',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontFamily: fontFamilySemiBold,
    fontSize: 10,
    color: '#d97706',
    letterSpacing: 0.5,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  overlayContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  overlayText: {
    fontFamily,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});

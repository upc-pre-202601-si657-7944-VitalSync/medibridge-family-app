import { useEffect, useState } from 'react';
import { Alert, Linking, View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { Card, Badge, LoadingSpinner } from '../../src/shared/components';
import { paymentsApi } from '../../src/core/api/services';
import { useAuthStore } from '../../src/core/auth/auth-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

interface Subscription {
  id: number;
  userId: number;
  plan: {
    displayName: string;
    commercialLine: string;
    price: number;
    currency: string;
  };
  status: string;
  startedAt: string;
  currentPeriodEnd: string;
}

const demoPlans = [
  { planType: 'FREE', billingCycle: 'MONTHLY', price: 0, labelKey: 'subscription.plans.free' },
  { planType: 'FAMILY_PREMIUM', billingCycle: 'MONTHLY', price: 19.9, labelKey: 'subscription.plans.premiumMonthly' },
  { planType: 'FAMILY_PREMIUM', billingCycle: 'ANNUALLY', price: 199, labelKey: 'subscription.plans.premiumAnnual' },
] as const;

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s: { currentUser: { id: string } | null }) => s.currentUser);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscription = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data } = await paymentsApi.get(`/subscriptions/users/${currentUser.id}/active`);
      if (data) {
        setSubscription(data);
      }
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        console.error('[subscription] load failed', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCheckout = async (plan: typeof demoPlans[number]) => {
    if (!currentUser?.id) return;

    try {
      const { data } = await paymentsApi.post('/subscriptions/checkout', {
        userId: Number(currentUser.id),
        commercialLine: 'FAMILY',
        planType: plan.planType,
        billingCycle: plan.billingCycle,
      });

      if (data?.checkoutUrl) {
        await Linking.openURL(data.checkoutUrl);
        return;
      }

      Alert.alert(t('common.error'), t('subscription.checkoutUnavailable'));
    } catch (error) {
      Alert.alert(t('subscription.checkoutUnavailable'), t('subscription.checkoutUnavailableDesc'));
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSubscription();
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
      <Text style={styles.title}>{t('subscription.title')}</Text>
      <Text style={styles.subtitle}>{t('subscription.subtitle')}</Text>

      {subscription ? (
        <>
          <Card style={styles.subscriptionCard}>
            <View style={styles.header}>
              <View style={[styles.icon, { backgroundColor: '#dbeafe' }]}>
                <Feather name="credit-card" size={24} color={colors.primary} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.planName}>{subscription.plan?.displayName}</Text>
                <Badge
                  label={subscription.status}
                  color={subscription.status === 'ACTIVE' ? 'green' : 'red'}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('subscription.commercialLine')}</Text>
              <Text style={styles.infoValue}>{subscription.plan?.commercialLine}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('subscription.price')}</Text>
              <Text style={styles.infoValue}>
                {subscription.plan?.price} {subscription.plan?.currency}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('subscription.startDate')}</Text>
              <Text style={styles.infoValue}>
                {new Date(subscription.startedAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('subscription.endDate')}</Text>
              <Text style={styles.infoValue}>
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </Text>
            </View>
          </Card>

          <TouchableOpacity style={styles.manageButton}>
            <Card style={styles.manageCard}>
              <View style={[styles.icon, { backgroundColor: '#fef3c7' }]}>
                <Feather name="settings" size={20} color="#d97706" />
              </View>
              <View style={styles.manageInfo}>
                <Text style={styles.manageLabel}>{t('subscription.manage')}</Text>
                <Text style={styles.manageDesc}>{t('subscription.manageDesc')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </Card>
          </TouchableOpacity>
        </>
      ) : (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Feather name="alert-circle" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>{t('subscription.noSubscription')}</Text>
          <Text style={styles.emptyDesc}>{t('subscription.noSubscriptionDesc')}</Text>
          <View style={styles.planList}>
            {demoPlans.map((plan) => (
              <TouchableOpacity key={`${plan.planType}-${plan.billingCycle}`} activeOpacity={0.75} onPress={() => handleCheckout(plan)}>
                <View style={styles.planCard}>
                  <View>
                    <Text style={styles.planTitle}>{t(plan.labelKey)}</Text>
                    <Text style={styles.planMeta}>{plan.billingCycle}</Text>
                  </View>
                  <Text style={styles.planPrice}>{plan.price === 0 ? t('subscription.free') : `$${plan.price}`}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing.xs },
  subtitle: { fontFamily, fontSize: 14, color: colors.textMuted, marginBottom: spacing.xl },
  subscriptionCard: { marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  icon: { width: 48, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planName: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  infoLabel: { fontFamily, fontSize: 14, color: colors.textMuted },
  infoValue: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary },
  manageButton: { marginBottom: spacing.lg },
  manageCard: { flexDirection: 'row', alignItems: 'center' },
  manageInfo: { flex: 1, marginLeft: spacing.md },
  manageLabel: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 2 },
  manageDesc: { fontFamily, fontSize: 13, color: colors.textMuted },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyIcon: { marginBottom: spacing.lg },
  emptyTitle: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  emptyDesc: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 },
  planList: { width: '100%', gap: spacing.md },
  planCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.lg, backgroundColor: colors.surface },
  planTitle: { fontFamily: fontFamilySemiBold, fontSize: 15, color: colors.textPrimary },
  planMeta: { fontFamily, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  planPrice: { fontFamily: fontFamilyBold, fontSize: 16, color: colors.primary },
});

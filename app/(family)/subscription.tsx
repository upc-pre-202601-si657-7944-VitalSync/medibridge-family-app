import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Card, Badge, Banner, LoadingSpinner } from '../../src/shared/components';
import { useSubscriptionStore } from '../../src/core/storage/subscription-store';
import { subscriptionCheckoutStore } from '../../src/core/storage/subscription-checkout-store';
import { paymentsApi } from '../../src/core/api/services';
import { useAuthStore } from '../../src/core/auth/auth-store';
import {
  CheckoutSessionResponse,
  CreateCheckoutSessionPayload,
  Subscription,
} from '../../src/features/payments/domain/models';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

const demoPlans = [
  { planType: 'FREE', billingCycle: 'MONTHLY', price: 0, labelKey: 'subscription.plans.free' },
  { planType: 'FAMILY_PREMIUM', billingCycle: 'MONTHLY', price: 19.9, labelKey: 'subscription.plans.premiumMonthly' },
  { planType: 'FAMILY_PREMIUM', billingCycle: 'ANNUALLY', price: 199, labelKey: 'subscription.plans.premiumAnnual' },
] as const;

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<{ checkout?: string | string[]; session_id?: string | string[] }>();
  const confirmingSessionRef = useRef<string | null>(null);
  const currentUser = useAuthStore((s) => s.currentUser);
  const subscription = useSubscriptionStore((s) => s.subscription);
  const loading = useSubscriptionStore((s) => s.isLoading);
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);
  const storeSubscription = useSubscriptionStore((s) => s.storeSubscription);
  const cancelRemoteSubscription = useSubscriptionStore((s) => s.cancelRemoteSubscription);
  const [refreshing, setRefreshing] = useState(false);
  const [showPlanManager, setShowPlanManager] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingPlanKey, setProcessingPlanKey] = useState<string | null>(null);
  const [confirmingCheckout, setConfirmingCheckout] = useState(false);

  const loadSubscription = async () => {
    await fetchSubscription();
    setRefreshing(false);
  };

  const getApiErrorMessage = (requestError: unknown) => {
    if (axios.isAxiosError(requestError)) {
      const payload = requestError.response?.data as { message?: string; error?: string } | undefined;
      const apiMessage = payload?.message || payload?.error || requestError.message;
      if (apiMessage.startsWith('Stripe checkout session circuit breaker fallback: ')) {
        return apiMessage.replace('Stripe checkout session circuit breaker fallback: ', '');
      }
      return apiMessage;
    }

    return requestError instanceof Error ? requestError.message : t('subscription.checkoutUnavailableDesc');
  };

  const openCheckoutUrl = async (checkoutUrl: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign(checkoutUrl);
      return;
    }

    await Linking.openURL(checkoutUrl);
  };

  const handlePlanSelection = async (plan: typeof demoPlans[number]) => {
    if (!currentUser?.id) return;

    const planKey = `${plan.planType}-${plan.billingCycle}`;
    setProcessingPlanKey(planKey);
    setMessage(null);
    setError(null);

    try {
      if (plan.price === 0) {
        const { data } = await paymentsApi.post<Subscription>('/subscriptions', {
          userId: Number(currentUser.id),
          commercialLine: 'FAMILY',
          planType: plan.planType,
          billingCycle: plan.billingCycle,
        });
        storeSubscription(data);
        setShowPlanManager(false);
        setMessage(t('subscription.activatedDesc'));
        return;
      }

      const payload: CreateCheckoutSessionPayload = {
        userId: Number(currentUser.id),
        commercialLine: 'FAMILY',
        planType: plan.planType,
        billingCycle: plan.billingCycle,
      };
      const { data } = await paymentsApi.post<CheckoutSessionResponse>('/subscriptions/checkout', payload);
      await openCheckoutUrl(data.checkoutUrl);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setProcessingPlanKey(null);
    }
  };

  const handleManagePress = () => {
    setMessage(null);
    setShowPlanManager((visible) => !visible);
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;

    setMessage(null);
    setError(null);
    setProcessingPlanKey('cancel');

    cancelRemoteSubscription(subscription.id)
      .then((cancelled) => {
        if (cancelled) {
          setShowPlanManager(false);
          setMessage(t('subscription.cancelledDesc'));
          return;
        }

        setError(t('subscription.cancelFailed'));
      })
      .finally(() => {
        setProcessingPlanKey(null);
      });
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  useEffect(() => {
    const checkout = Array.isArray(searchParams.checkout) ? searchParams.checkout[0] : searchParams.checkout;
    const sessionId = Array.isArray(searchParams.session_id) ? searchParams.session_id[0] : searchParams.session_id;
    const pendingCheckout = subscriptionCheckoutStore.getPending();
    const checkoutStatus = checkout ?? pendingCheckout?.checkout;
    const checkoutSessionId = sessionId ?? pendingCheckout?.sessionId;

    if (checkoutStatus === 'cancelled') {
      subscriptionCheckoutStore.clearPending();
      setError(t('subscription.checkoutCancelled'));
      router.replace('/(family)/subscription' as any);
      return;
    }

    if (checkoutStatus !== 'success' || !currentUser?.id) return;

    if (!checkoutSessionId) {
      subscriptionCheckoutStore.clearPending();
      setMessage(t('subscription.checkoutConfirmed'));
      fetchSubscription();
      router.replace('/(family)/subscription' as any);
      return;
    }

    if (confirmingSessionRef.current === checkoutSessionId) return;
    confirmingSessionRef.current = checkoutSessionId;
    setConfirmingCheckout(true);
    setError(null);
    setMessage(null);

    paymentsApi.post<Subscription>('/subscriptions/checkout/confirm', { sessionId: checkoutSessionId })
      .then(({ data }) => {
        subscriptionCheckoutStore.clearPending();
        storeSubscription(data);
        setShowPlanManager(false);
        setMessage(t('subscription.checkoutConfirmed'));
        router.replace('/(family)/subscription' as any);
      })
      .catch((requestError) => {
        confirmingSessionRef.current = null;
        setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        setConfirmingCheckout(false);
      });
  }, [currentUser?.id, fetchSubscription, searchParams.checkout, searchParams.session_id, storeSubscription, t]);

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
      {message ? <Banner type="success" message={message} /> : null}
      {error ? <Banner type="error" message={error} /> : null}
      {confirmingCheckout ? <Banner type="success" message={t('subscription.checkoutConfirming')} /> : null}

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

          <TouchableOpacity style={styles.manageButton} activeOpacity={0.75} onPress={handleManagePress}>
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

          {showPlanManager ? (
            <View style={styles.managerPanel}>
              <Text style={styles.managerTitle}>{t('subscription.changePlan')}</Text>
              <Text style={styles.managerDesc}>{t('subscription.changePlanDesc')}</Text>
              <View style={styles.planList}>
                {demoPlans.filter((plan) => (
                  subscription.plan?.planType === 'FREE' || plan.planType !== 'FREE'
                )).map((plan) => {
                  const selected = subscription.plan?.planType === plan.planType
                    && subscription.plan?.billingCycle === plan.billingCycle;
                  const planKey = `${plan.planType}-${plan.billingCycle}`;
                  const isProcessing = processingPlanKey === planKey;

                  return (
                    <TouchableOpacity
                      key={`${plan.planType}-${plan.billingCycle}`}
                      activeOpacity={0.75}
                      onPress={() => { void handlePlanSelection(plan); }}
                      disabled={selected || Boolean(processingPlanKey) || confirmingCheckout}
                    >
                      <View style={[styles.planCard, selected && styles.planCardSelected]}>
                        <View>
                          <Text style={styles.planTitle}>{t(plan.labelKey)}</Text>
                          <Text style={styles.planMeta}>
                            {selected
                              ? t('subscription.currentPlan')
                              : plan.price > 0
                                ? t('subscription.stripeCheckout')
                                : plan.billingCycle}
                          </Text>
                        </View>
                        <View style={styles.planAction}>
                          <Text style={styles.planPrice}>
                            {isProcessing ? t('common.loading') : plan.price === 0 ? t('subscription.free') : `$${plan.price}`}
                          </Text>
                          {selected ? (
                            <Feather name="check-circle" size={20} color="#16a34a" />
                          ) : (
                            <Feather name="chevron-right" size={20} color={colors.textMuted} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleCancelSubscription}
                disabled={Boolean(processingPlanKey) || confirmingCheckout}
              >
                <View style={styles.cancelAction}>
                  <Feather name="x-circle" size={20} color={colors.error} />
                  <Text style={styles.cancelText}>
                    {processingPlanKey === 'cancel' ? t('common.loading') : t('subscription.cancel')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}
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
              <TouchableOpacity
                key={`${plan.planType}-${plan.billingCycle}`}
                activeOpacity={0.75}
                onPress={() => { void handlePlanSelection(plan); }}
                disabled={Boolean(processingPlanKey) || confirmingCheckout}
              >
                <View style={styles.planCard}>
                  <View>
                    <Text style={styles.planTitle}>{t(plan.labelKey)}</Text>
                    <Text style={styles.planMeta}>
                      {plan.price > 0 ? t('subscription.stripeCheckout') : plan.billingCycle}
                    </Text>
                  </View>
                  <Text style={styles.planPrice}>
                    {processingPlanKey === `${plan.planType}-${plan.billingCycle}`
                      ? t('common.loading')
                      : plan.price === 0 ? t('subscription.free') : `$${plan.price}`}
                  </Text>
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
  managerPanel: { marginBottom: spacing.lg },
  managerTitle: { fontFamily: fontFamilySemiBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.xs },
  managerDesc: { fontFamily, fontSize: 14, color: colors.textMuted, marginBottom: spacing.md },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyIcon: { marginBottom: spacing.lg },
  emptyTitle: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  emptyDesc: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 },
  planList: { width: '100%', gap: spacing.md },
  planCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.lg, backgroundColor: colors.surface },
  planCardSelected: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  planTitle: { fontFamily: fontFamilySemiBold, fontSize: 15, color: colors.textPrimary },
  planMeta: { fontFamily, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  planAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  planPrice: { fontFamily: fontFamilyBold, fontSize: 16, color: colors.primary },
  cancelAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radius.lg,
    backgroundColor: colors.errorBg,
  },
  cancelText: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.error },
});

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

interface Invoice {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
}

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const loadInvoices = async () => {
    if (!currentUser?.id) return;
    setInvoicesLoading(true);
    try {
      const { data } = await paymentsApi.get(`/invoices/users/${currentUser.id}`);
      if (Array.isArray(data)) setInvoices(data);
    } catch {
      // silencioso
    } finally {
      setInvoicesLoading(false);
    }
  };

  const loadSubscription = async () => {
    await fetchSubscription();
    setRefreshing(false);
  };

  const getInvoiceStatusColor = (status: string): 'green' | 'yellow' | 'red' => {
    if (status === 'PAID') return 'green';
    if (status === 'FAILED') return 'red';
    return 'yellow';
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
    loadInvoices();
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

          <View style={styles.invoicesSection}>
            <View style={styles.invoicesSectionHeader}>
              <View style={[styles.icon, { backgroundColor: '#dbeafe' }]}>
                <Feather name="file-text" size={20} color={colors.primary} />
              </View>
              <Text style={styles.invoicesSectionTitle}>{t('invoices.title')}</Text>
            </View>

            {invoicesLoading ? (
              <Text style={styles.invoicesLoadingText}>{t('common.loading')}</Text>
            ) : invoices.length === 0 ? (
              <Card style={styles.invoicesEmpty}>
                <Feather name="inbox" size={32} color={colors.textMuted} style={{ alignSelf: 'center', marginBottom: spacing.sm }} />
                <Text style={styles.invoicesEmptyText}>{t('invoices.empty')}</Text>
              </Card>
            ) : (
              invoices.map((invoice) => (
                <Card key={invoice.id} style={styles.invoiceCard}>
                  <View style={styles.invoiceRow}>
                    <View style={styles.invoiceLeft}>
                      <Text style={styles.invoiceId}>{t('invoices.invoiceId')} #{invoice.id}</Text>
                      <Text style={styles.invoiceDate}>{new Date(invoice.issuedAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.invoiceRight}>
                      <Text style={styles.invoiceAmount}>{invoice.amount} {invoice.currency}</Text>
                      <Badge label={invoice.status} color={getInvoiceStatusColor(invoice.status)} />
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        </>
      ) : (
        <View style={styles.pricingContainer}>
          <View style={styles.heroSection}>
            <View style={styles.heroIconWrap}>
              <Feather name="zap" size={32} color={colors.primary} />
            </View>
            <Text style={styles.heroTitle}>{t('subscription.noSubscription')}</Text>
            <Text style={styles.heroDesc}>{t('subscription.noSubscriptionDesc')}</Text>
          </View>

          <View style={styles.pricingList}>
            {demoPlans.map((plan, index) => {
              const planKey = `${plan.planType}-${plan.billingCycle}`;
              const isProcessing = processingPlanKey === planKey;
              const isFeatured = index === 1;

              return (
                <TouchableOpacity
                  key={planKey}
                  activeOpacity={0.8}
                  onPress={() => { void handlePlanSelection(plan); }}
                  disabled={Boolean(processingPlanKey) || confirmingCheckout}
                >
                  <View style={[styles.pricingCard, isFeatured && styles.pricingCardFeatured]}>
                    {isFeatured ? (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>{t('subscription.mostPopular') ?? 'Más popular'}</Text>
                      </View>
                    ) : null}

                    <View style={styles.pricingCardHeader}>
                      <View style={[styles.pricingIcon, isFeatured && styles.pricingIconFeatured]}>
                        <Feather
                          name={plan.price === 0 ? 'gift' : plan.billingCycle === 'ANNUALLY' ? 'star' : 'shield'}
                          size={20}
                          color={isFeatured ? colors.surface : colors.primary}
                        />
                      </View>
                      <View style={styles.pricingCardInfo}>
                        <Text style={[styles.pricingCardTitle, isFeatured && styles.pricingCardTitleFeatured]}>
                          {t(plan.labelKey)}
                        </Text>
                        <Text style={[styles.pricingCardMeta, isFeatured && styles.pricingCardMetaFeatured]}>
                          {plan.price > 0 ? t('subscription.stripeCheckout') : plan.billingCycle}
                        </Text>
                      </View>
                      <View style={styles.pricingCardPriceWrap}>
                        <Text style={[styles.pricingCardPrice, isFeatured && styles.pricingCardPriceFeatured]}>
                          {isProcessing
                            ? t('common.loading')
                            : plan.price === 0
                              ? t('subscription.free')
                              : `$${plan.price}`}
                        </Text>
                        {plan.price > 0 ? (
                          <Text style={[styles.pricingCardPeriod, isFeatured && styles.pricingCardPeriodFeatured]}>
                            /{plan.billingCycle === 'ANNUALLY' ? t('subscription.year') ?? 'año' : t('subscription.month') ?? 'mes'}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={[styles.pricingCta, isFeatured && styles.pricingCtaFeatured]}>
                      <Text style={[styles.pricingCtaText, isFeatured && styles.pricingCtaTextFeatured]}>
                        {isProcessing ? t('common.loading') : t('subscription.selectPlan') ?? 'Seleccionar plan'}
                      </Text>
                      {!isProcessing ? <Feather name="arrow-right" size={16} color={isFeatured ? colors.surface : colors.primary} /> : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
  pricingContainer: { gap: spacing.xl },
  heroSection: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderLight },
  heroIconWrap: { width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  heroTitle: { fontFamily: fontFamilyBold, fontSize: 20, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  heroDesc: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  pricingList: { gap: spacing.md },
  pricingCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderLight, padding: spacing.lg, overflow: 'hidden' },
  pricingCardFeatured: { backgroundColor: colors.primary, borderColor: colors.primary },
  featuredBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginBottom: spacing.md },
  featuredBadgeText: { fontFamily: fontFamilySemiBold, fontSize: 11, color: colors.surface, letterSpacing: 0.5 },
  pricingCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pricingIcon: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  pricingIconFeatured: { backgroundColor: 'rgba(255,255,255,0.2)' },
  pricingCardInfo: { flex: 1 },
  pricingCardTitle: { fontFamily: fontFamilySemiBold, fontSize: 15, color: colors.textPrimary },
  pricingCardTitleFeatured: { color: colors.surface },
  pricingCardMeta: { fontFamily, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pricingCardMetaFeatured: { color: 'rgba(255,255,255,0.7)' },
  pricingCardPriceWrap: { alignItems: 'flex-end' },
  pricingCardPrice: { fontFamily: fontFamilyBold, fontSize: 20, color: colors.primary },
  pricingCardPriceFeatured: { color: colors.surface },
  pricingCardPeriod: { fontFamily, fontSize: 11, color: colors.textMuted },
  pricingCardPeriodFeatured: { color: 'rgba(255,255,255,0.7)' },
  pricingCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.primaryLight },
  pricingCtaFeatured: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' },
  pricingCtaText: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.primary },
  pricingCtaTextFeatured: { color: colors.surface },
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
  invoicesSection: { marginTop: spacing.xl },
  invoicesSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  invoicesSectionTitle: { fontFamily: fontFamilySemiBold, fontSize: 17, color: colors.textPrimary },
  invoicesLoadingText: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  invoicesEmpty: { alignItems: 'center', paddingVertical: spacing.xl },
  invoicesEmptyText: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  invoiceCard: { marginBottom: spacing.sm },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceLeft: { flex: 1 },
  invoiceId: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary },
  invoiceDate: { fontFamily, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  invoiceRight: { alignItems: 'flex-end', gap: spacing.xs },
  invoiceAmount: { fontFamily: fontFamilyBold, fontSize: 15, color: colors.textPrimary },
});

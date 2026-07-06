import { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Card, Badge, LoadingSpinner } from '../../src/shared/components';
import { useSubscriptionStore } from '../../src/core/storage/subscription-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

const demoPlans = [
  { planType: 'FREE', billingCycle: 'MONTHLY', price: 0, labelKey: 'subscription.plans.free' },
  { planType: 'FAMILY_PREMIUM', billingCycle: 'MONTHLY', price: 19.9, labelKey: 'subscription.plans.premiumMonthly' },
  { planType: 'FAMILY_PREMIUM', billingCycle: 'ANNUALLY', price: 199, labelKey: 'subscription.plans.premiumAnnual' },
] as const;

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const subscription = useSubscriptionStore((s) => s.subscription);
  const loading = useSubscriptionStore((s) => s.isLoading);
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);
  const activateLocalSubscription = useSubscriptionStore((s) => s.activateLocalSubscription);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscription = async () => {
    await fetchSubscription();
    setRefreshing(false);
  };

  const handlePlanSelection = (plan: typeof demoPlans[number]) => {
    activateLocalSubscription({
      ...plan,
      displayName: t(plan.labelKey),
    });
    Alert.alert(t('subscription.activatedTitle'), t('subscription.activatedDesc'));
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
              <TouchableOpacity key={`${plan.planType}-${plan.billingCycle}`} activeOpacity={0.75} onPress={() => handlePlanSelection(plan)}>
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

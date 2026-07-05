import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Card, Badge, Button, LoadingSpinner } from '../../src/shared/components';
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
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

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
      console.error('[subscription] load failed', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
                {new Date(subscription.startDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('subscription.endDate')}</Text>
              <Text style={styles.infoValue}>
                {new Date(subscription.endDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('subscription.autoRenew')}</Text>
              <View style={styles.autoRenewBadge}>
                <Feather
                  name={subscription.autoRenew ? 'check' : 'x'}
                  size={14}
                  color={subscription.autoRenew ? '#16a34a' : colors.error}
                />
                <Text
                  style={[
                    styles.autoRenewText,
                    { color: subscription.autoRenew ? '#16a34a' : colors.error },
                  ]}
                >
                  {subscription.autoRenew ? t('common.yes') : t('common.no')}
                </Text>
              </View>
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
          <Button
            title={t('subscription.viewPlans')}
            onPress={() => {}}
            style={styles.emptyButton}
          />
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
  autoRenewBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  autoRenewText: { fontFamily: fontFamilySemiBold, fontSize: 14 },
  manageButton: { marginBottom: spacing.lg },
  manageCard: { flexDirection: 'row', alignItems: 'center' },
  manageInfo: { flex: 1, marginLeft: spacing.md },
  manageLabel: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 2 },
  manageDesc: { fontFamily, fontSize: 13, color: colors.textMuted },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyIcon: { marginBottom: spacing.lg },
  emptyTitle: { fontFamily: fontFamilyBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  emptyDesc: { fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 },
  emptyButton: { width: '100%' },
});

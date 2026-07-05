import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../src/shared/components';
import { paymentsApi } from '../../src/core/api/services';
import { useAuthStore } from '../../src/core/auth/auth-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

interface Invoice {
  id: number;
  userId: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
  paidAt: string | null;
  pdfUrl: string;
}

export default function InvoicesPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s: { currentUser: { id: string } | null }) => s.currentUser);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvoices = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data } = await paymentsApi.get(`/invoices/users/${currentUser.id}`);
      if (Array.isArray(data)) {
        setInvoices(data);
      }
    } catch (error) {
      console.error('[invoices] load failed', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const handleDownloadPdf = async (pdfUrl: string) => {
    try {
      await Linking.openURL(pdfUrl);
    } catch (error) {
      console.error('[invoices] download failed', error);
    }
  };

  const getStatusColor = (status: string): 'green' | 'yellow' | 'red' => {
    switch (status) {
      case 'PAID':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'FAILED':
        return 'red';
      default:
        return 'yellow';
    }
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
      <Text style={styles.title}>{t('invoices.title')}</Text>
      <Text style={styles.subtitle}>{t('invoices.subtitle')}</Text>

      {invoices.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EmptyState icon="file-text" message={t('invoices.empty')} />
        </Card>
      ) : (
        invoices.map((invoice) => (
          <Card key={invoice.id} style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <View style={[styles.icon, { backgroundColor: '#dbeafe' }]}>
                <Feather name="file-text" size={20} color={colors.primary} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.invoiceId}>{t('invoices.invoiceId')} #{invoice.id}</Text>
                <Badge label={invoice.status} color={getStatusColor(invoice.status)} />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('invoices.amount')}</Text>
              <Text style={styles.infoValue}>
                {invoice.amount} {invoice.currency}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('invoices.issuedAt')}</Text>
              <Text style={styles.infoValue}>
                {new Date(invoice.issuedAt).toLocaleDateString()}
              </Text>
            </View>

            {invoice.paidAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('invoices.paidAt')}</Text>
                <Text style={styles.infoValue}>
                  {new Date(invoice.paidAt).toLocaleDateString()}
                </Text>
              </View>
            )}

            {invoice.pdfUrl && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownloadPdf(invoice.pdfUrl)}
              >
                <Feather name="download" size={16} color={colors.primary} />
                <Text style={styles.downloadText}>{t('invoices.downloadPdf')}</Text>
              </TouchableOpacity>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing.xs },
  subtitle: { fontFamily, fontSize: 14, color: colors.textMuted, marginBottom: spacing.xl },
  emptyCard: { paddingVertical: spacing.xxxl },
  invoiceCard: { marginBottom: spacing.lg },
  invoiceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  icon: { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  invoiceId: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  infoLabel: { fontFamily, fontSize: 14, color: colors.textMuted },
  infoValue: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary },
  downloadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primaryLight, paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.md },
  downloadText: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.primary },
});

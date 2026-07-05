import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Button, Card, Badge, LoadingSpinner, EmptyState, Select, PremiumGate, TabBar } from '../../src/shared/components';
import { reportsApi } from '../../src/core/api/services';
import { profilesStore } from '../../src/core/storage/profiles-store';
import { useClinicalReports, useGenerateReport, useAnalyticsDashboard } from '../../src/features/reports/application/use-reports';
import { usePullToRefresh } from '../../src/shared/hooks/use-pull-to-refresh';
import { ClinicalReport, ReportType } from '../../src/features/reports/domain/models';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

type TabKey = 'reports' | 'analytics';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('reports');
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null);

  const tabs = [
    { key: 'reports' as TabKey, label: t('reports.tabs.reports') },
    { key: 'analytics' as TabKey, label: t('reports.tabs.analytics') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('reports.title')}</Text>
      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={(key) => setActiveTab(key as TabKey)} />

      {activeTab === 'reports' && (
        <ReportsTab
          onReportPress={(report) => setSelectedReport(report)}
        />
      )}
      {activeTab === 'analytics' && (
        <AnalyticsTab />
      )}

      {selectedReport && (
        <ReportDetailModal
          visible={!!selectedReport}
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </View>
  );
}

function ReportsTab({ onReportPress }: { onReportPress: (report: ClinicalReport) => void }) {
  const { t } = useTranslation();
  const { reports, loading, refetch } = useClinicalReports();
  const { generate, submitting } = useGenerateReport();
  const [reportType, setReportType] = useState<ReportType>('VITAL_SIGNS');
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const reportTypeOptions = [
    { value: 'VITAL_SIGNS', label: t('reports.types.VITAL_SIGNS') },
    { value: 'MEDICATION', label: t('reports.types.MEDICATION') },
    { value: 'FULL_CLINICAL', label: t('reports.types.FULL_CLINICAL') },
  ];

  const handleGenerate = async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) return;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const success = await generate({
      patientId,
      reportType,
      startDate,
      endDate,
    });

    if (success) {
      refetch();
    }
  };

  return (
    <PremiumGate featureName={t('reports.premium')}>
      <ScrollView
        style={tabStyles.container}
        contentContainerStyle={tabStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {profilesStore.getLinkedPatientId() ? (
          <Card style={tabStyles.formCard}>
            <Text style={tabStyles.formTitle}>{t('reports.generate')}</Text>
            <Select
              label={t('reports.type')}
              options={reportTypeOptions}
              value={reportType}
              onChange={(v) => setReportType(v as ReportType)}
            />
            <Button
              title={submitting ? t('common.saving') : t('reports.generateBtn')}
              onPress={handleGenerate}
              loading={submitting}
              style={tabStyles.generateButton}
            />
          </Card>
        ) : null}

        {reports.length === 0 ? (
          <EmptyState icon="file-text" message={t('reports.empty')} />
        ) : (
          reports.map((r) => (
            <TouchableOpacity key={r.id} onPress={() => onReportPress(r)} activeOpacity={0.7}>
              <Card style={tabStyles.reportCard}>
                <View style={tabStyles.reportHeader}>
                  <Badge label={t(`reports.types.${r.reportType}` as any, { defaultValue: r.reportType })} color="green" />
                  <Feather name="chevron-right" size={20} color={colors.textMuted} />
                </View>
                <Text style={tabStyles.reportPeriod}>
                  {t('reports.period')}: {new Date(r.periodStartDate).toLocaleDateString()} — {new Date(r.periodEndDate).toLocaleDateString()}
                </Text>
                <Text style={tabStyles.reportSummary} numberOfLines={2}>{r.summary}</Text>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </PremiumGate>
  );
}

function AnalyticsTab() {
  const { t } = useTranslation();
  const { metrics, loading } = useAnalyticsDashboard();

  if (loading) return <LoadingSpinner />;

  return (
    <PremiumGate featureName={t('reports.analytics.premium')}>
      <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}>
        {metrics ? (
          <>
            <Card style={tabStyles.analyticsCard}>
              <Text style={tabStyles.analyticsTitle}>{t('reports.analytics.overview')}</Text>
              <View style={tabStyles.metricRow}>
                <View style={tabStyles.metricItem}>
                  <Text style={tabStyles.metricValue}>{metrics.totalObservations}</Text>
                  <Text style={tabStyles.metricLabel}>{t('reports.analytics.observations')}</Text>
                </View>
                <View style={tabStyles.metricItem}>
                  <Text style={tabStyles.metricValue}>{metrics.activeAlerts}</Text>
                  <Text style={tabStyles.metricLabel}>{t('reports.analytics.alerts')}</Text>
                </View>
                <View style={tabStyles.metricItem}>
                  <Text style={tabStyles.metricValue}>{metrics.reportsGenerated}</Text>
                  <Text style={tabStyles.metricLabel}>{t('reports.analytics.reports')}</Text>
                </View>
              </View>
            </Card>

            <Card style={tabStyles.analyticsCard}>
              <Text style={tabStyles.analyticsTitle}>{t('reports.analytics.medication')}</Text>
              <View style={tabStyles.adherenceContainer}>
                <Text style={tabStyles.adherenceValue}>{metrics.medicationAdherence}%</Text>
                <Text style={tabStyles.adherenceLabel}>{t('reports.analytics.adherence')}</Text>
              </View>
              <View style={tabStyles.statRow}>
                <Text style={tabStyles.statLabel}>{t('reports.analytics.skippedDoses')}</Text>
                <Text style={tabStyles.statValue}>{metrics.skippedDoses}</Text>
              </View>
            </Card>

            <Card style={tabStyles.analyticsCard}>
              <Text style={tabStyles.analyticsTitle}>{t('reports.analytics.health')}</Text>
              <View style={tabStyles.statRow}>
                <Text style={tabStyles.statLabel}>{t('reports.analytics.avgBP')}</Text>
                <Text style={tabStyles.statValue}>{metrics.averageBloodPressure}</Text>
              </View>
              <View style={tabStyles.statRow}>
                <Text style={tabStyles.statLabel}>{t('reports.analytics.lastObservation')}</Text>
                <Text style={tabStyles.statValue}>
                  {new Date(metrics.lastObservation).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </Card>
          </>
        ) : (
          <EmptyState icon="bar-chart-2" message={t('reports.analytics.noData')} />
        )}
      </ScrollView>
    </PremiumGate>
  );
}

function ReportDetailModal({ visible, report, onClose }: { visible: boolean; report: ClinicalReport; onClose: () => void }) {
  const { t } = useTranslation();

  const handleDownloadPdf = async () => {
    try {
      const response = await reportsApi.get(`/clinical-reports/${report.id}/pdf`, {
        responseType: 'blob',
      });
      
      const url = URL.createObjectURL(new Blob([response.data]));
      Linking.openURL(url);
    } catch (error) {
      Alert.alert(t('common.error'), t('reports.downloadError'));
    }
  };

  return (
    <PremiumGate featureName={t('reports.detail.premium')}>
      {visible && (
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>{t('reports.detail.title')}</Text>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={modalStyles.content}>
              <Card style={modalStyles.infoCard}>
                <View style={modalStyles.infoRow}>
                  <Text style={modalStyles.infoLabel}>{t('reports.detail.type')}</Text>
                  <Badge label={t(`reports.types.${report.reportType}` as any, { defaultValue: report.reportType })} color="green" />
                </View>
                <View style={modalStyles.infoRow}>
                  <Text style={modalStyles.infoLabel}>{t('reports.detail.period')}</Text>
                  <Text style={modalStyles.infoValue}>
                    {new Date(report.periodStartDate).toLocaleDateString()} — {new Date(report.periodEndDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={modalStyles.infoRow}>
                  <Text style={modalStyles.infoLabel}>{t('reports.detail.generated')}</Text>
                  <Text style={modalStyles.infoValue}>
                    {new Date(report.generatedAt).toLocaleString('es', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </Card>

              <Card style={modalStyles.summaryCard}>
                <Text style={modalStyles.summaryTitle}>{t('reports.detail.summary')}</Text>
                <Text style={modalStyles.summaryText}>{report.summary}</Text>
              </Card>

              <Button
                title={t('reports.detail.downloadPdf')}
                onPress={handleDownloadPdf}
                icon="download"
                style={modalStyles.downloadButton}
              />
            </ScrollView>
          </View>
        </View>
      )}
    </PremiumGate>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontFamily: fontFamilySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  generateButton: {
    marginTop: spacing.lg,
  },
  reportCard: {
    marginBottom: spacing.md,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportPeriod: {
    fontFamily,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  reportSummary: {
    fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  analyticsCard: {
    marginBottom: spacing.lg,
  },
  analyticsTitle: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: fontFamilyBold,
    fontSize: 24,
    color: colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily,
    fontSize: 12,
    color: colors.textMuted,
  },
  adherenceContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  adherenceValue: {
    fontFamily: fontFamilyBold,
    fontSize: 48,
    color: '#16a34a',
  },
  adherenceLabel: {
    fontFamily,
    fontSize: 14,
    color: colors.textMuted,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  statLabel: {
    fontFamily,
    fontSize: 14,
    color: colors.textMuted,
  },
  statValue: {
    fontFamily: fontFamilySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontFamily: fontFamilyBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontFamily,
    fontSize: 14,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: fontFamilySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryText: {
    fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  downloadButton: {
    marginTop: spacing.md,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fontFamilyBold,
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});

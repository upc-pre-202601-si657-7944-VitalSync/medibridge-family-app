export type ReportType = 'VITAL_SIGNS' | 'MEDICATION' | 'FULL_CLINICAL' | 'CLINICAL_SUMMARY' | 'MONTHLY_SUMMARY';
export type ReportStatus = 'GENERATING' | 'GENERATED' | 'FAILED';

export interface ClinicalReport {
  readonly id: number;
  readonly patientId: number;
  readonly reportType: ReportType;
  readonly periodStartDate: string;
  readonly periodEndDate: string;
  readonly status: ReportStatus;
  readonly generatedAt: string;
  readonly summary: string;
  readonly pdfPath: string;
  readonly sections: ReportSection[];
}

export interface ReportSection {
  readonly title: string;
  readonly content: string;
  readonly order: number;
}

export interface GenerateReportPayload {
  readonly patientId: number;
  readonly reportType: ReportType;
  readonly startDate: string;
  readonly endDate: string;
}

export interface DashboardMetrics {
  readonly id: number;
  readonly patientId: number;
  readonly totalObservations: number;
  readonly averageBloodPressure: string;
  readonly medicationAdherence: number;
  readonly skippedDoses: number;
  readonly activeAlerts: number;
  readonly reportsGenerated: number;
  readonly lastObservation: string;
  readonly metricSnapshots: MetricSnapshot[];
  readonly trendIndicators: TrendIndicator[];
}

export interface MetricSnapshot {
  readonly date: string;
  readonly metric: string;
  readonly value: number;
}

export interface TrendIndicator {
  readonly metric: string;
  readonly direction: 'UP' | 'DOWN' | 'STABLE';
  readonly percentage: number;
  readonly period: string;
}

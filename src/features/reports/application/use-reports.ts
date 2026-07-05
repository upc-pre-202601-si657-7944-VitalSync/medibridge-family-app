import { useState, useCallback, useEffect } from 'react';
import { reportsApi } from '../../../core/api/services';
import { profilesStore } from '../../../core/storage/profiles-store';
import { ClinicalReport, DashboardMetrics, GenerateReportPayload } from '../domain/models';
import axios from 'axios';

export function useClinicalReports() {
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await reportsApi.get(`/clinical-reports/patients/${patientId}`);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setReports([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { reports, loading, error, refetch: fetch };
}

export function useReportById(reportId: number | null) {
  const [report, setReport] = useState<ClinicalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await reportsApi.get(`/clinical-reports/${reportId}`);
      setReport(data);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setReport(null);
    } finally { setLoading(false); }
  }, [reportId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { report, loading, error, refetch: fetch };
}

export function useGenerateReport() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (payload: GenerateReportPayload): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await reportsApi.post('/clinical-reports', payload);
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return false;
    } finally { setSubmitting(false); }
  }, []);

  return { generate, submitting, error };
}

export function useAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await reportsApi.get(`/analytics-dashboards/patients/${patientId}`);
      setMetrics(data);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setMetrics(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { metrics, loading, error, refetch: fetch };
}

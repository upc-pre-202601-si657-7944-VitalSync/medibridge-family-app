import { useState, useCallback, useEffect } from 'react';
import { healthApi } from '../../../core/api/services';
import { profilesStore } from '../../../core/storage/profiles-store';
import { HealthObservation, ClinicalAlert, HealthSummary, RecordObservationPayload } from '../domain/models';
import axios from 'axios';

export function useHealthObservations() {
  const [observations, setObservations] = useState<HealthObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await healthApi.get(`/health-monitoring/patients/${patientId}/observations`);
      setObservations(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      }
      setObservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { observations, loading, error, refetch: fetch };
}

export function useClinicalAlerts() {
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await healthApi.get(`/health-monitoring/patients/${patientId}/alerts/active`);
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      }
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { alerts, loading, error, refetch: fetch };
}

export function useHealthSummary() {
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await healthApi.get(`/health-monitoring/patients/${patientId}/summary`);
      setSummary(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      }
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, loading, error, refetch: fetch };
}

export function useRecordObservation() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const record = useCallback(async (payload: RecordObservationPayload): Promise<boolean> => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) return false;
    setSubmitting(true);
    setError(null);
    try {
      await healthApi.post(`/health-monitoring/patients/${patientId}/observations`, payload);
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { record, submitting, error };
}

import { useState, useCallback, useEffect } from 'react';
import { medicationApi } from '../../../core/api/services';
import { profilesStore } from '../../../core/storage/profiles-store';
import {
  Medication, MedicationSchedule, DoseAdministration, LowStockAlert,
  RegisterMedicationPayload, CreateSchedulePayload, RecordDosePayload, SkipDosePayload
} from '../domain/models';
import axios from 'axios';

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await medicationApi.get(`/medications/patients/${patientId}`);
      setMedications(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setMedications([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { medications, loading, error, refetch: fetch };
}

export function useLowStockAlerts() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await medicationApi.get(`/medications/patients/${patientId}/low-stock`);
      setAlerts(Array.isArray(data) ? data : []);
    } catch { setAlerts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { alerts, loading, refetch: fetch };
}

export function useMedicationSchedules() {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await medicationApi.get(`/medication-schedules/patients/${patientId}/active`);
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setSchedules([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { schedules, loading, error, refetch: fetch };
}

export function useDoseHistory(medicationId: number | null) {
  const [doses, setDoses] = useState<DoseAdministration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!medicationId) return;
    setLoading(true);
    try {
      const { data } = await medicationApi.get(`/dose-administrations/medications/${medicationId}`);
      setDoses(Array.isArray(data) ? data : []);
    } catch { setDoses([]); }
    finally { setLoading(false); }
  }, [medicationId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { doses, loading, refetch: fetch };
}

export function useRegisterMedication() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (payload: RegisterMedicationPayload): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await medicationApi.post('/medications', payload);
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return false;
    } finally { setSubmitting(false); }
  }, []);

  return { register, submitting, error };
}

export function useCreateSchedule() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreateSchedulePayload): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await medicationApi.post('/medication-schedules', payload);
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return false;
    } finally { setSubmitting(false); }
  }, []);

  return { create, submitting, error };
}

export function useRecordDose() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const record = useCallback(async (payload: RecordDosePayload): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await medicationApi.post('/dose-administrations', payload);
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return false;
    } finally { setSubmitting(false); }
  }, []);

  const skip = useCallback(async (payload: SkipDosePayload): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await medicationApi.post('/dose-administrations/skip', payload);
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return false;
    } finally { setSubmitting(false); }
  }, []);

  return { record, skip, submitting, error };
}

export function useUpdateStock() {
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback(async (medicationId: number, stockQuantity: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await medicationApi.patch(`/medications/${medicationId}/stock`, { stockQuantity });
      return true;
    } catch { return false; }
    finally { setSubmitting(false); }
  }, []);

  return { update, submitting };
}

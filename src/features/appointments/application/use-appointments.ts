import { useState, useCallback, useEffect } from 'react';
import { appointmentsApi } from '../../../core/api/services';
import { profilesStore } from '../../../core/storage/profiles-store';
import { Appointment, ScheduleFamilyVisitPayload } from '../domain/models';
import axios from 'axios';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await appointmentsApi.get(`/appointments/patient/${patientId}`);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setAppointments([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const familyVisits = appointments.filter(a => a.appointmentType === 'FAMILY_VISIT');
  const medicalAppointments = appointments.filter(a => a.appointmentType === 'MEDICAL');
  const upcoming = appointments
    .filter(a => a.status === 'SCHEDULED' && new Date(a.startsAt) > new Date())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const nextAppointment = upcoming.length > 0 ? upcoming[0] : null;

  return { appointments, familyVisits, medicalAppointments, upcoming, nextAppointment, loading, error, refetch: fetch };
}

export function useAppointmentById(appointmentId: number | null) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await appointmentsApi.get(`/appointments/${appointmentId}`);
      setAppointment(data);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setAppointment(null);
    } finally { setLoading(false); }
  }, [appointmentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { appointment, loading, error, refetch: fetch };
}

export function useScheduleFamilyVisit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schedule = useCallback(async (payload: ScheduleFamilyVisitPayload): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await appointmentsApi.post('/appointments/family-visits', payload);
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return false;
    } finally { setSubmitting(false); }
  }, []);

  return { schedule, submitting, error };
}

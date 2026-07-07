import { useState, useCallback, useEffect } from 'react';
import { profilesApi } from '../../../core/api/services';
import { profilesStore } from '../../../core/storage/profiles-store';
import {
  FamilyMemberProfile, PatientProfile, DoctorProfile, CareTeamMembers,
  CreateFamilyMemberProfilePayload, CreatePatientProfilePayload
} from '../domain/models';
import axios from 'axios';

export function useFamilyProfile() {
  const [profile, setProfile] = useState<FamilyMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const storedProfile = profilesStore.getFamilyProfile();
    if (storedProfile) {
      setProfile(storedProfile);
    }

    const storedId = profilesStore.getFamilyMemberId();
    if (!storedId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await profilesApi.get(`/profiles/family-members/${storedId}`);
      profilesStore.setFamilyProfile(data);
      setProfile(data);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      profilesStore.setFamilyMemberId(0);
      setProfile(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { profile, loading, error, refetch: fetch };
}

export function useCreateFamilyProfile() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreateFamilyMemberProfilePayload): Promise<FamilyMemberProfile | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await profilesApi.post('/profiles/family-members', payload);
      profilesStore.setFamilyProfile(data);
      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return null;
    } finally { setSubmitting(false); }
  }, []);

  return { create, submitting, error };
}

export function usePatientProfile() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await profilesApi.get(`/profiles/patients/${patientId}`);
      setProfile(data);
    } catch { setProfile(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { profile, loading, refetch: fetch };
}

export function useCreatePatient() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreatePatientProfilePayload): Promise<PatientProfile | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await profilesApi.post('/profiles/patients', payload);
      profilesStore.setLinkedPatientId(data.id);
      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return null;
    } finally { setSubmitting(false); }
  }, []);

  return { create, submitting, error };
}

export function useCareTeam() {
  const [careTeam, setCareTeam] = useState<CareTeamMembers | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await profilesApi.get(`/profiles/patients/${patientId}/care-team-members`);
      setCareTeam(data);
    } catch { setCareTeam(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { careTeam, loading, refetch: fetch };
}

export function useLinkFamilyToPatient() {
  const [submitting, setSubmitting] = useState(false);

  const link = useCallback(async (patientId: number, familyMemberId: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await profilesApi.post(`/profiles/patients/${patientId}/family-members/${familyMemberId}`);
      return true;
    } catch { return false; }
    finally { setSubmitting(false); }
  }, []);

  return { link, submitting };
}

export function useAssignDoctorToPatient() {
  const [submitting, setSubmitting] = useState(false);

  const assign = useCallback(async (patientId: number, doctorProfileId: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await profilesApi.post(`/profiles/patients/${patientId}/doctors/${doctorProfileId}`);
      return true;
    } catch { return false; }
    finally { setSubmitting(false); }
  }, []);

  return { assign, submitting };
}

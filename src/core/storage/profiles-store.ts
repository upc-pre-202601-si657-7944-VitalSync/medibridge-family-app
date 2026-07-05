import { appStorage } from '../storage/storage';

const FAMILY_MEMBER_ID_KEY = 'profiles-family-member-profile-id';
const LINKED_PATIENT_ID_KEY = 'profiles-linked-patient-id';

export const profilesStore = {
  getFamilyMemberId(): number | null {
    const raw = appStorage.get(FAMILY_MEMBER_ID_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  },
  setFamilyMemberId(id: number): void {
    appStorage.set(FAMILY_MEMBER_ID_KEY, String(id));
  },
  getLinkedPatientId(): number | null {
    const raw = appStorage.get(LINKED_PATIENT_ID_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  },
  setLinkedPatientId(id: number): void {
    appStorage.set(LINKED_PATIENT_ID_KEY, String(id));
  },
  clear(): void {
    appStorage.remove(FAMILY_MEMBER_ID_KEY);
    appStorage.remove(LINKED_PATIENT_ID_KEY);
  },
};

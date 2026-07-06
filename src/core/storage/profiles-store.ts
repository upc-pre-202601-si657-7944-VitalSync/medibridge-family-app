import { appStorage } from '../storage/storage';

const FAMILY_MEMBER_ID_KEY = 'profiles-family-member-profile-id';
const FAMILY_MEMBER_PROFILE_KEY = 'profiles-family-member-profile';
const LINKED_PATIENT_ID_KEY = 'profiles-linked-patient-id';

export interface StoredFamilyMemberProfile {
  readonly id: number;
  readonly userId: number;
  readonly fullName: string;
}

function isStoredFamilyMemberProfile(value: unknown): value is StoredFamilyMemberProfile {
  if (!value || typeof value !== 'object') return false;

  const profile = value as Partial<StoredFamilyMemberProfile>;
  return Number.isFinite(profile.id)
    && Number.isFinite(profile.userId)
    && typeof profile.fullName === 'string'
    && profile.fullName.trim().length > 0;
}

export const profilesStore = {
  getFamilyProfile(): StoredFamilyMemberProfile | null {
    const raw = appStorage.get(FAMILY_MEMBER_PROFILE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return isStoredFamilyMemberProfile(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  setFamilyProfile(profile: StoredFamilyMemberProfile): void {
    appStorage.set(FAMILY_MEMBER_PROFILE_KEY, JSON.stringify(profile));
    appStorage.set(FAMILY_MEMBER_ID_KEY, String(profile.id));
  },
  getFamilyMemberId(): number | null {
    const profile = this.getFamilyProfile();
    if (profile) return profile.id;

    const raw = appStorage.get(FAMILY_MEMBER_ID_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  },
  setFamilyMemberId(id: number): void {
    if (id > 0) {
      appStorage.set(FAMILY_MEMBER_ID_KEY, String(id));
      return;
    }

    appStorage.remove(FAMILY_MEMBER_ID_KEY);
    appStorage.remove(FAMILY_MEMBER_PROFILE_KEY);
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
    appStorage.remove(FAMILY_MEMBER_PROFILE_KEY);
    appStorage.remove(LINKED_PATIENT_ID_KEY);
  },
};

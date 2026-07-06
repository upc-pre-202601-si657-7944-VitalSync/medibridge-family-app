import { appStorage } from '../storage/storage';
import { useAuthStore } from '../auth/auth-store';

const FAMILY_MEMBER_ID_KEY = 'profiles-family-member-profile-id';
const FAMILY_MEMBER_PROFILE_KEY = 'profiles-family-member-profile';
const LINKED_PATIENT_ID_KEY = 'profiles-linked-patient-id';
const SETUP_FINISHED_KEY = 'profiles-setup-finished';
const REFERENCE_DOCTOR_PROFILE_KEY = 'profiles-reference-doctor-profile';

export interface StoredFamilyMemberProfile {
  readonly id: number;
  readonly userId: number;
  readonly fullName: string;
}

export interface StoredDoctorProfile {
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

function isStoredDoctorProfile(value: unknown): value is StoredDoctorProfile {
  if (!value || typeof value !== 'object') return false;

  const profile = value as Partial<StoredDoctorProfile>;
  return Number.isFinite(profile.id)
    && Number.isFinite(profile.userId)
    && typeof profile.fullName === 'string'
    && profile.fullName.trim().length > 0;
}

function getCurrentUserId(): string | null {
  return useAuthStore.getState().currentUser?.id ?? null;
}

function scopedKey(key: string): string {
  const userId = getCurrentUserId();
  return userId ? `profiles.${userId}.${key}` : key;
}

function parsePositiveNumber(raw: string | undefined): number | null {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseFamilyProfile(raw: string | undefined): StoredFamilyMemberProfile | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return isStoredFamilyMemberProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseDoctorProfile(raw: string | undefined): StoredDoctorProfile | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return isStoredDoctorProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function belongsToCurrentUser(profile: StoredFamilyMemberProfile): boolean {
  const userId = getCurrentUserId();
  return userId === null || String(profile.userId) === userId;
}

function getLegacyFamilyProfileForCurrentUser(): StoredFamilyMemberProfile | null {
  const raw = appStorage.get(FAMILY_MEMBER_PROFILE_KEY);
  const profile = parseFamilyProfile(raw);

  if (!profile || !belongsToCurrentUser(profile)) return null;

  appStorage.set(scopedKey(FAMILY_MEMBER_PROFILE_KEY), raw!);
  appStorage.set(scopedKey(FAMILY_MEMBER_ID_KEY), String(profile.id));
  return profile;
}

function getScopedOrLegacyNumber(key: string): number | null {
  const scoped = parsePositiveNumber(appStorage.get(scopedKey(key)));
  if (scoped) return scoped;

  const legacyProfile = getLegacyFamilyProfileForCurrentUser();
  if (!legacyProfile) return null;

  const legacy = parsePositiveNumber(appStorage.get(key));
  if (legacy) appStorage.set(scopedKey(key), String(legacy));
  return legacy;
}

function getScopedOrLegacyFlag(key: string): boolean {
  const scoped = appStorage.get(scopedKey(key));
  if (scoped) return scoped === 'true';

  const legacyProfile = getLegacyFamilyProfileForCurrentUser();
  if (!legacyProfile) return false;

  const legacy = appStorage.get(key);
  if (legacy) appStorage.set(scopedKey(key), legacy);
  return legacy === 'true';
}

export const profilesStore = {
  getFamilyProfile(): StoredFamilyMemberProfile | null {
    const profile = parseFamilyProfile(appStorage.get(scopedKey(FAMILY_MEMBER_PROFILE_KEY)));
    if (profile) return profile;

    return getLegacyFamilyProfileForCurrentUser();
  },
  setFamilyProfile(profile: StoredFamilyMemberProfile): void {
    appStorage.set(scopedKey(FAMILY_MEMBER_PROFILE_KEY), JSON.stringify(profile));
    appStorage.set(scopedKey(FAMILY_MEMBER_ID_KEY), String(profile.id));
  },
  getFamilyMemberId(): number | null {
    const profile = this.getFamilyProfile();
    if (profile) return profile.id;

    return getScopedOrLegacyNumber(FAMILY_MEMBER_ID_KEY);
  },
  setFamilyMemberId(id: number): void {
    if (id > 0) {
      appStorage.set(scopedKey(FAMILY_MEMBER_ID_KEY), String(id));
      return;
    }

    appStorage.remove(scopedKey(FAMILY_MEMBER_ID_KEY));
    appStorage.remove(scopedKey(FAMILY_MEMBER_PROFILE_KEY));
  },
  getLinkedPatientId(): number | null {
    return getScopedOrLegacyNumber(LINKED_PATIENT_ID_KEY);
  },
  setLinkedPatientId(id: number): void {
    appStorage.set(scopedKey(LINKED_PATIENT_ID_KEY), String(id));
  },
  isSetupFinished(): boolean {
    return getScopedOrLegacyFlag(SETUP_FINISHED_KEY);
  },
  setSetupFinished(finished: boolean): void {
    if (finished) {
      appStorage.set(scopedKey(SETUP_FINISHED_KEY), 'true');
      return;
    }

    appStorage.remove(scopedKey(SETUP_FINISHED_KEY));
  },
  getReferenceDoctor(): StoredDoctorProfile | null {
    return parseDoctorProfile(appStorage.get(scopedKey(REFERENCE_DOCTOR_PROFILE_KEY)));
  },
  setReferenceDoctor(profile: StoredDoctorProfile): void {
    appStorage.set(scopedKey(REFERENCE_DOCTOR_PROFILE_KEY), JSON.stringify(profile));
  },
  clear(): void {
    appStorage.remove(scopedKey(FAMILY_MEMBER_ID_KEY));
    appStorage.remove(scopedKey(FAMILY_MEMBER_PROFILE_KEY));
    appStorage.remove(scopedKey(LINKED_PATIENT_ID_KEY));
    appStorage.remove(scopedKey(SETUP_FINISHED_KEY));
    appStorage.remove(scopedKey(REFERENCE_DOCTOR_PROFILE_KEY));
  },
};

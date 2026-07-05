export interface FamilyMemberProfile {
  readonly id: number;
  readonly userId: number;
  readonly fullName: string;
}

export interface PatientProfile {
  readonly id: number;
  readonly fullName: string;
}

export interface DoctorProfile {
  readonly id: number;
  readonly userId: number;
  readonly fullName: string;
  readonly specialty?: string;
  readonly licenseNumber?: string;
}

export interface DoctorPatientAssignment {
  readonly id: number;
  readonly doctorProfileId: number;
  readonly patientId: number;
  readonly active: boolean;
}

export interface FamilyPatientLink {
  readonly id: number;
  readonly familyMemberProfileId: number;
  readonly patientId: number;
  readonly active: boolean;
}

export interface CareTeamMembers {
  readonly patientId: number;
  readonly doctorProfileIds: number[];
  readonly familyMemberProfileIds: number[];
  readonly careTeamUserIds: number[];
}

export interface CreateFamilyMemberProfilePayload {
  readonly fullName: string;
}

export interface CreatePatientProfilePayload {
  readonly fullName: string;
}

export interface CreateDoctorProfilePayload {
  readonly fullName: string;
}

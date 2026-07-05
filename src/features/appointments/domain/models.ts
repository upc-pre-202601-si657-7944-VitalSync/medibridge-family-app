export type AppointmentType = 'FAMILY_VISIT' | 'MEDICAL';
export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  readonly id: number;
  readonly patientId: number;
  readonly doctorProfileId: number | null;
  readonly familyMemberProfileId: number | null;
  readonly appointmentType: AppointmentType;
  readonly status: AppointmentStatus;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly reason: string;
}

export interface FamilyVisit extends Appointment {
  readonly appointmentType: 'FAMILY_VISIT';
  readonly familyMemberProfileId: number;
}

export interface MedicalAppointment extends Appointment {
  readonly appointmentType: 'MEDICAL';
  readonly doctorProfileId: number;
}

export interface ScheduleFamilyVisitPayload {
  readonly patientId: number;
  readonly familyMemberProfileId: number;
  readonly startsAt: string;
  readonly durationInMinutes: number;
  readonly reason: string;
}

export interface ScheduleMedicalAppointmentPayload {
  readonly patientId: number;
  readonly doctorProfileId: number;
  readonly startsAt: string;
  readonly durationInMinutes: number;
  readonly reason: string;
}

export type DosageUnit = 'TABLET' | 'MG' | 'ML' | 'CAPSULE' | 'DROP' | 'UNIT';
export type AdministrationRoute = 'ORAL' | 'INTRAVENOUS' | 'INTRAMUSCULAR' | 'SUBCUTANEOUS' | 'TOPICAL' | 'INHALATORY' | 'RECTAL';
export type FrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'EVERY_12_HOURS' | 'EVERY_8_HOURS' | 'EVERY_6_HOURS' | 'AS_NEEDED';
export type DoseStatus = 'ADMINISTERED' | 'SKIPPED' | 'MISSED' | 'PENDING';

export interface Medication {
  readonly id: number;
  readonly patientId: number;
  readonly name: string;
  readonly dosageAmount: number;
  readonly dosageUnit: DosageUnit;
  readonly administrationRoute: AdministrationRoute;
  readonly stockQuantity: number;
  readonly lowStockThreshold: number;
  readonly expirationDate: string;
  readonly active: boolean;
}

export interface MedicationSchedule {
  readonly id: number;
  readonly medicationId: number;
  readonly patientId: number;
  readonly frequencyType: FrequencyType;
  readonly timesPerDay: number;
  readonly administrationTime: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly active: boolean;
}

export interface DoseAdministration {
  readonly id: number;
  readonly medicationId: number;
  readonly scheduleId: number;
  readonly patientId: number;
  readonly occurredAt: string;
  readonly status: DoseStatus;
  readonly notes: string;
}

export interface LowStockAlert {
  readonly medicationId: number;
  readonly patientId: number;
  readonly medicationName: string;
  readonly currentStock: number;
  readonly threshold: number;
}

export interface RegisterMedicationPayload {
  readonly patientId: number;
  readonly name: string;
  readonly dosageAmount: number;
  readonly dosageUnit: DosageUnit;
  readonly administrationRoute: AdministrationRoute;
  readonly stockQuantity: number;
  readonly lowStockThreshold: number;
  readonly expirationDate: string;
}

export interface CreateSchedulePayload {
  readonly medicationId: number;
  readonly patientId: number;
  readonly frequencyType: FrequencyType;
  readonly timesPerDay: number;
  readonly administrationTime: string;
  readonly startDate: string;
  readonly endDate: string;
}

export interface RecordDosePayload {
  readonly medicationId: number;
  readonly scheduleId: number;
  readonly patientId: number;
  readonly administeredAt: string;
  readonly notes: string;
}

export interface SkipDosePayload {
  readonly medicationId: number;
  readonly scheduleId: number;
  readonly patientId: number;
  readonly skippedAt: string;
  readonly reason: string;
}

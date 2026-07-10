export type EmotionalState = 
  | 'CALM' 
  | 'ANXIOUS' 
  | 'SAD' 
  | 'IRRITABLE' 
  | 'CONFUSED' 
  | 'APATHETIC';

export interface HealthObservation {
  readonly id: number;
  readonly patientId: number;
  readonly recordedByDoctorProfileId: number | null;
  readonly systolicBloodPressure: number;
  readonly diastolicBloodPressure: number;
  readonly bodyTemperature: number;
  readonly painLevel: number;
  readonly emotionalState: EmotionalState;
  readonly emotionalNotes: string;
  readonly clinicalNotes: string;
  readonly recordedAt: string;
}

export interface ClinicalAlert {
  readonly id: number;
  readonly patientId: number;
  readonly observationId?: number;
  readonly alertType: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  readonly message: string;
  readonly triggeredAt: string;
  readonly active: boolean;
}

export interface HealthSummary {
  readonly patientId: number;
  readonly latestBloodPressure: string | null;
  readonly averageTemperature: number | null;
  readonly painTrend: 'ASCENDING' | 'DESCENDING' | 'STABLE';
  readonly emotionalTrend: 'ASCENDING' | 'DESCENDING' | 'STABLE';
  readonly activeAlerts: number;
  readonly observationsCount: number;
  readonly lastObservation: string | null;
}

export interface RecordObservationPayload {
  readonly recordedByDoctorProfileId: number | null;
  readonly systolicBloodPressure: number;
  readonly diastolicBloodPressure: number;
  readonly bodyTemperature: number;
  readonly painLevel: number;
  readonly emotionalState: EmotionalState;
  readonly emotionalNotes: string;
  readonly clinicalNotes: string;
  readonly recordedAt: string;
}

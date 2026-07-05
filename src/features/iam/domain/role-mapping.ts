import { UserRole } from './enums';

export const BackendRole = {
  ROLE_USER: 'ROLE_USER',
  ROLE_ADMIN: 'ROLE_ADMIN',
} as const;

export type BackendRole = (typeof BackendRole)[keyof typeof BackendRole];

const FRONTEND_TO_BACKEND: Record<string, string> = {
  [UserRole.FAMILY_MEMBER]: BackendRole.ROLE_ADMIN,
  [UserRole.CAREGIVER]: BackendRole.ROLE_USER,
  [UserRole.DOCTOR]: BackendRole.ROLE_USER,
  [UserRole.PATIENT]: BackendRole.ROLE_USER,
};

export function mapFrontendRoleToBackend(frontendRole: UserRole): string {
  return FRONTEND_TO_BACKEND[frontendRole] ?? BackendRole.ROLE_USER;
}

const BACKEND_TO_FRONTEND: Record<string, UserRole> = {
  [BackendRole.ROLE_ADMIN]: UserRole.FAMILY_MEMBER,
  [BackendRole.ROLE_USER]: UserRole.CAREGIVER,
};

export function mapBackendRoleToFrontend(backendRole: string): UserRole {
  const upperRole = backendRole.toUpperCase();
  return BACKEND_TO_FRONTEND[upperRole] ?? UserRole.CAREGIVER;
}

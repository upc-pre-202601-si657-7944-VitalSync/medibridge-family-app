import { UserRole } from './enums';

export interface User {
  readonly id: string;
  readonly username: string;
  readonly role: UserRole;
}

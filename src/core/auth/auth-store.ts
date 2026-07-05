import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../features/iam/domain/models';
import { UserRole } from '../../features/iam/domain/enums';
import { mapBackendRoleToFrontend } from '../../features/iam/domain/role-mapping';
import { secureStorage, appStorage } from '../storage/storage';

const TOKEN_KEY = 'mb_access_token';
const USER_KEY = 'mb_user';
const LOCALE_KEY = 'app-locale';

interface JwtPayload {
  sub: string;
  roles?: string[];
  iat: number;
  exp: number;
}

interface AuthState {
  accessToken: string | null;
  currentUser: User | null;
  isLoading: boolean;
  setSession: (token: string, user: User) => Promise<void>;
  restoreSession: () => Promise<void>;
  clearSession: () => Promise<void>;
  setLocale: (locale: string) => void;
  getLocale: () => string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  currentUser: null,
  isLoading: true,

  setSession: async (token: string, user: User) => {
    await secureStorage.set(TOKEN_KEY, token);
    await secureStorage.set(USER_KEY, JSON.stringify(user));
    set({ accessToken: token, currentUser: user, isLoading: false });
  },

  restoreSession: async () => {
    try {
      const token = await secureStorage.get(TOKEN_KEY);
      const userJson = await secureStorage.get(USER_KEY);
      if (token && userJson) {
        const decoded = decodeToken(token);
        if (!decoded) {
          await secureStorage.remove(TOKEN_KEY);
          await secureStorage.remove(USER_KEY);
          set({ isLoading: false });
          return;
        }
        const user: User = JSON.parse(userJson);
        set({ accessToken: token, currentUser: user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  clearSession: async () => {
    await secureStorage.remove(TOKEN_KEY);
    await secureStorage.remove(USER_KEY);
    set({ accessToken: null, currentUser: null, isLoading: false });
  },

  setLocale: (locale: string) => {
    appStorage.set(LOCALE_KEY, locale);
  },

  getLocale: () => {
    return appStorage.get(LOCALE_KEY) ?? 'es';
  },
}));

export function decodeToken(token: string): { id: string; role: UserRole } | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }
    const role = payload.roles?.[0]
      ? mapBackendRoleToFrontend(payload.roles[0])
      : UserRole.FAMILY_MEMBER;
    return { id: payload.sub, role };
  } catch {
    return null;
  }
}

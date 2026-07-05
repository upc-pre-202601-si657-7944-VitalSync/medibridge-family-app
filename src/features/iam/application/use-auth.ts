import { useState, useRef } from 'react';
import { api } from '../../../core/api/services';
import { useAuthStore, decodeToken } from '../../../core/auth/auth-store';
import { profilesStore } from '../../../core/storage/profiles-store';
import { User } from '../domain/models';
import { mapFrontendRoleToBackend } from '../domain/role-mapping';
import axios from 'axios';

interface LoginParams {
  username: string;
  password: string;
}

interface RegisterParams {
  username: string;
  password: string;
  role: string;
}

export function useAuth() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const login = async ({ username, password }: LoginParams): Promise<boolean> => {
    if (submittingRef.current) return false;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/authentication/sign-in', {
        username,
        password,
      });
      const decoded = decodeToken(data.token);
      if (!decoded) throw new Error('Invalid token');
      const userId = String(data.id ?? decoded.id ?? '');
      const user: User = {
        id: userId,
        username: data.username,
        role: decoded.role,
      };
      await useAuthStore.getState().setSession(data.token, user);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[auth] sign-in failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error('[auth] sign-in failed', error);
      }
      setError('auth.errors.loginFailed');
      return false;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const register = async ({ username, password, role }: RegisterParams): Promise<boolean> => {
    if (submittingRef.current) return false;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const backendRole = mapFrontendRoleToBackend(
        role as Parameters<typeof mapFrontendRoleToBackend>[0],
      );
      await api.post('/authentication/sign-up', {
        username,
        password,
        roles: [backendRole],
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[auth] sign-up failed', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error('[auth] sign-up failed', error);
      }
      setError('auth.errors.registerFailed');
      return false;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    profilesStore.clear();
    await useAuthStore.getState().clearSession();
  };

  return { login, register, logout, isSubmitting, error, setError };
}

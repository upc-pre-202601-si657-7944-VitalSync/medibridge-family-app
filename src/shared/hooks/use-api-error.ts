import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
  timestamp?: string;
}

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; details?: string; timestamp?: string }>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    switch (status) {
      case 400:
        return { message: data?.message || 'Solicitud invalida', status: 400, details: data?.details, timestamp: data?.timestamp };
      case 401:
        return { message: 'Sesion expirada. Inicia sesion nuevamente.', status: 401 };
      case 403:
        return { message: data?.message || 'No tienes permiso para esta accion', status: 403, details: data?.details };
      case 404:
        return { message: 'Recurso no encontrado', status: 404 };
      case 409:
        return { message: data?.message || 'Conflicto con datos existentes', status: 409 };
      case 422:
        return { message: 'Datos invalidos. Verifica el formulario.', status: 422 };
      case 500:
        return { message: 'Error interno del servidor. Intenta mas tarde.', status: 500 };
      case 502:
      case 503:
      case 504:
        return { message: 'Servicio no disponible. Intenta en unos minutos.', status };
      default:
        if (!axiosError.response) {
          return { message: 'Error de conexion. Verifica tu internet.' };
        }
        return { message: data?.message || axiosError.message, status };
    }
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Ocurrio un error inesperado' };
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((err: unknown) => {
    setError(extractApiError(err));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response;
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

export function isPremiumRequiredError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message?.toLowerCase() || '';
    return error.response?.status === 403 && (
      message.includes('subscription') ||
      message.includes('premium') ||
      message.includes('paid')
    );
  }
  return false;
}

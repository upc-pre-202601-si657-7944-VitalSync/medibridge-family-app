import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface UseRetryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retryCount: number;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useRetry<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryResult<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setLoading(true);
      setError(null);
      setRetryCount(0);

      let lastError: Error;
      let currentDelay = retryDelay;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await asyncFunction(...args);
          setData(result);
          setLoading(false);
          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');

          if (attempt < maxRetries) {
            onRetry?.(attempt + 1, lastError);
            setRetryCount(attempt + 1);
            await sleep(currentDelay);
            currentDelay *= backoffMultiplier;
          }
        }
      }

      setError(lastError!);
      setLoading(false);
      onMaxRetriesReached?.(lastError!);
      throw lastError!;
    },
    [asyncFunction, maxRetries, retryDelay, backoffMultiplier, onRetry, onMaxRetriesReached]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    data,
    loading,
    error,
    retryCount,
    execute,
    reset,
  };
}

export function isRetryableError(error: any): boolean {
  if (!error) return false;

  // Errores de red
  if (error.message?.includes('Network Error')) return true;
  if (error.message?.includes('timeout')) return true;
  if (error.code === 'ECONNABORTED') return true;

  // Errores HTTP retryables
  if (error.response) {
    const status = error.response.status;
    // 408 Request Timeout, 429 Too Many Requests, 5xx Server Errors
    return status === 408 || status === 429 || (status >= 500 && status < 600);
  }

  return false;
}

export function calculateRetryDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Agregar jitter para evitar thundering herd
  return Math.min(exponentialDelay + jitter, maxDelay);
}

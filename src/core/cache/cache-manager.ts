import { useEffect, useState } from 'react';
import Constants from 'expo-constants';

type CacheStorageDriver = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
  getNumber: (key: string) => number | undefined;
  getAllKeys: () => string[];
  clearAll: () => void;
  delete: (key: string) => void;
};

const memoryStorage = new Map<string, string | number>();

let cacheStorage: CacheStorageDriver | null = null;

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    const { createMMKV } = require('react-native-mmkv') as {
      createMMKV: (config: { id: string }) => CacheStorageDriver;
    };
    cacheStorage = createMMKV({ id: 'api-cache-storage' });
  } catch (error) {
    console.warn('[cache] MMKV unavailable, falling back to in-memory storage.', error);
  }
} else {
  console.warn('[cache] Expo Go detected, using in-memory storage fallback instead of MMKV.');
}

// Fallback driver usando Map
const fallbackDriver: CacheStorageDriver = {
  getString: (key: string) => {
    const value = memoryStorage.get(key);
    return typeof value === 'string' ? value : undefined;
  },
  set: (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  remove: (key: string) => {
    memoryStorage.delete(key);
  },
  getNumber: (key: string) => {
    const value = memoryStorage.get(key);
    return typeof value === 'number' ? value : undefined;
  },
  getAllKeys: () => Array.from(memoryStorage.keys()),
  clearAll: () => memoryStorage.clear(),
  delete: (key: string) => {
    memoryStorage.delete(key);
  },
};

const storage = cacheStorage || fallbackDriver;

const CACHE_EXPIRY_PREFIX = 'expiry_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCachedData = (): T | null => {
    const expiryKey = CACHE_EXPIRY_PREFIX + key;
    const expiry = storage.getNumber(expiryKey);
    
    if (expiry && Date.now() < expiry) {
      const cached = storage.getString(key);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const setCachedData = (value: T) => {
    try {
      storage.set(key, JSON.stringify(value));
      storage.set(CACHE_EXPIRY_PREFIX + key, String(Date.now() + ttl));
    } catch (error) {
      console.warn('[cache] Failed to cache data:', error);
    }
  };

  const fetchData = async (forceRefresh: boolean = false) => {
    if (!forceRefresh) {
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      setCachedData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchData(true);
  };

  const clearCache = () => {
    storage.delete(key);
    storage.delete(CACHE_EXPIRY_PREFIX + key);
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  return { data, loading, error, refetch, clearCache };
}

export function clearAllCache() {
  storage.clearAll();
}

export function getCacheSize(): number {
  return storage.getAllKeys().length;
}

import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const memoryStorage = new Map<string, string>();

type AppStorageDriver = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

let mmkv: AppStorageDriver | null = null;

const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';

function getWebStorage(): Storage | null {
  if (!isWeb || typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

if (!isExpoGo) {
  try {
    const { createMMKV } = require('react-native-mmkv') as {
      createMMKV: (config: { id: string }) => AppStorageDriver;
    };
    mmkv = createMMKV({ id: 'medi-bridge-family' });
  } catch (error) {
    console.warn('[storage] MMKV unavailable, falling back to in-memory storage.', error);
  }
} else {
  console.warn('[storage] Expo Go detected, using in-memory storage fallback instead of MMKV.');
}

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    const webStorage = getWebStorage();
    if (webStorage) return webStorage.getItem(key);

    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<boolean> {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.setItem(key, value);
      return true;
    }

    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.warn(`[secureStorage] Failed to set "${key}":`, error);
      return false;
    }
  },
  async remove(key: string): Promise<boolean> {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.removeItem(key);
      return true;
    }

    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.warn(`[secureStorage] Failed to remove "${key}":`, error);
      return false;
    }
  },
};

export const appStorage = {
  get(key: string): string | undefined {
    const webStorage = getWebStorage();
    if (webStorage) {
      const persisted = webStorage.getItem(key);
      return persisted ?? memoryStorage.get(key);
    }

    if (mmkv) {
      try {
        return mmkv.getString(key);
      } catch (error) {
        console.warn(`[appStorage] Failed to get "${key}" from MMKV, using memory fallback.`, error);
      }
    }

    const persisted = SecureStore.getItem(key);
    if (persisted !== null) {
      memoryStorage.set(key, persisted);
      return persisted;
    }

    return memoryStorage.get(key);
  },
  set(key: string, value: string): void {
    const webStorage = getWebStorage();
    if (webStorage) {
      memoryStorage.set(key, value);
      webStorage.setItem(key, value);
      return;
    }

    if (mmkv) {
      try {
        mmkv.set(key, value);
        return;
      } catch (error) {
        console.warn(`[appStorage] Failed to set "${key}" in MMKV, using memory fallback.`, error);
      }
    }

    memoryStorage.set(key, value);
    SecureStore.setItem(key, value);
  },
  remove(key: string): void {
    const webStorage = getWebStorage();
    if (webStorage) {
      memoryStorage.delete(key);
      webStorage.removeItem(key);
      return;
    }

    if (mmkv) {
      try {
        mmkv.remove(key);
        return;
      } catch (error) {
        console.warn(`[appStorage] Failed to remove "${key}" from MMKV, using memory fallback.`, error);
      }
    }

    memoryStorage.delete(key);
    SecureStore.deleteItemAsync(key).catch(() => undefined);
  },
};

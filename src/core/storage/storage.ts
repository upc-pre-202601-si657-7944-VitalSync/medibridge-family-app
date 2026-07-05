import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const memoryStorage = new Map<string, string>();

type AppStorageDriver = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

let mmkv: AppStorageDriver | null = null;

const isExpoGo = Constants.appOwnership === 'expo';

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
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.warn(`[secureStorage] Failed to set "${key}":`, error);
      return false;
    }
  },
  async remove(key: string): Promise<boolean> {
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
    if (mmkv) {
      try {
        return mmkv.getString(key);
      } catch (error) {
        console.warn(`[appStorage] Failed to get "${key}" from MMKV, using memory fallback.`, error);
      }
    }

    return memoryStorage.get(key);
  },
  set(key: string, value: string): void {
    if (mmkv) {
      try {
        mmkv.set(key, value);
        return;
      } catch (error) {
        console.warn(`[appStorage] Failed to set "${key}" in MMKV, using memory fallback.`, error);
      }
    }

    memoryStorage.set(key, value);
  },
  remove(key: string): void {
    if (mmkv) {
      try {
        mmkv.remove(key);
        return;
      } catch (error) {
        console.warn(`[appStorage] Failed to remove "${key}" from MMKV, using memory fallback.`, error);
      }
    }

    memoryStorage.delete(key);
  },
};

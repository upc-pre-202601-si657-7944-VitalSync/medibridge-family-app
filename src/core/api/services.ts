import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../auth/auth-store';
import { profilesStore } from '../storage/profiles-store';

const PRODUCTION_BASE_URL = 'https://medibridge-api-gateway.onrender.com/api/v1';
const LOCAL_IOS_BASE_URL = 'http://localhost:8080/api/v1';
const LOCAL_ANDROID_EMULATOR_BASE_URL = 'http://10.0.2.2:8080/api/v1';

const customBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const isExpoGo = Constants.appOwnership === 'expo';

const BASE_URL = customBaseUrl
  || (isExpoGo
    ? PRODUCTION_BASE_URL
    : (__DEV__
      ? (Platform.OS === 'android' ? LOCAL_ANDROID_EMULATOR_BASE_URL : LOCAL_IOS_BASE_URL)
      : PRODUCTION_BASE_URL));

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const appointmentsApi = api;
export const medicationApi = api;
export const healthApi = api;
export const communicationApi = api;
export const paymentsApi = api;
export const profilesApi = api;
export const reportsApi = api;

let isClearing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isClearing) {
      isClearing = true;
      try {
        profilesStore.clear();
        await useAuthStore.getState().clearSession();
      } finally {
        isClearing = false;
      }
    }
    return Promise.reject(error);
  },
);

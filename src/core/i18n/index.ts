import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import es from './locales/es.json';
import en from './locales/en.json';
import { appStorage } from '../storage/storage';

const LOCALE_KEY = 'app-locale';

const resources = { es: { translation: es }, en: { translation: en } };

const storedLocale = appStorage.get(LOCALE_KEY);
const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'es';
const fallback = ['es', 'en'].includes(storedLocale ?? '')
  ? (storedLocale as 'es' | 'en')
  : ['es', 'en'].includes(deviceLocale)
    ? (deviceLocale as 'es' | 'en')
    : 'es';

i18n.use(initReactI18next).init({
  resources,
  lng: storedLocale ? fallback : 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;

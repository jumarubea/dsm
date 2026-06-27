import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sw from './locales/sw.json';

const STORAGE_KEY = 'dsm_lang';

// Some runtimes expose a partial `localStorage` — feature-detect before using.
const safeStorage = () => {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      return localStorage;
    }
  } catch {
    // access can throw in restricted contexts
  }
  return null;
};

const store = safeStorage();
const initialLang = (store && store.getItem(STORAGE_KEY)) || 'en';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sw: { translation: sw } },
  lng: initialLang, // English is the default
  fallbackLng: 'en', // always fall back to English
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  if (store) store.setItem(STORAGE_KEY, lng);
});

export default i18n;

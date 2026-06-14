import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
import commonEn from './en/common.json';
import authEn from './en/auth.json';
import studentEn from './en/student.json';
import mentorEn from './en/mentor.json';
import adminEn from './en/admin.json';

// Arabic translations
import commonAr from './ar/common.json';
import authAr from './ar/auth.json';
import studentAr from './ar/student.json';
import mentorAr from './ar/mentor.json';
import adminAr from './ar/admin.json';

export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    student: studentEn,
    mentor: mentorEn,
    admin: adminEn,
  },
  ar: {
    common: commonAr,
    auth: authAr,
    student: studentAr,
    mentor: mentorAr,
    admin: adminAr,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'student', 'mentor', 'admin'],
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Handle RTL styling dynamically on document element
i18n.on('languageChanged', (lng) => {
  const dir = lng.startsWith('ar') ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Set initial direction
const initialLang = i18n.language || 'en';
document.documentElement.dir = initialLang.startsWith('ar') ? 'rtl' : 'ltr';
document.documentElement.lang = initialLang;

export default i18n;

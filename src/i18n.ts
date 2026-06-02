import i18n from "i18next";
import { initReactI18next, useTranslation as useI18nTranslation } from "react-i18next";

// English namespaces
import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enDoctor from "./locales/en/doctor.json";
import enPatient from "./locales/en/patient.json";
import enAppointment from "./locales/en/appointment.json";
import enErrors from "./locales/en/errors.json";
import enTerms from "./locales/en/terms.json"
import enPrivacy from "./locales/en/privacy.json";
import enHelp from "./locales/en/help.json";
import enFaq from "./locales/en/faq.json";
import enAbout from "./locales/en/about.json";
// Amharic namespaces
import amCommon from "./locales/am/common.json";
import amAuth from "./locales/am/auth.json";
import amDashboard from "./locales/am/dashboard.json";
import amDoctor from "./locales/am/doctor.json";
import amPatient from "./locales/am/patient.json";
import amAppointment from "./locales/am/appointment.json";
import amErrors from "./locales/am/errors.json";
import amTerms from "./locales/am/terms.json";
import amPrivacy from "./locales/am/privacy.json";
import amHelp from "./locales/am/help.json";
import amFaq from "./locales/am/faq.json";
import amAbout from "./locales/am/about.json";
import { translationService } from './services/translationService';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
      doctor: enDoctor,
      patient: enPatient,
      appointment: enAppointment,
      errors: enErrors,
      terms: enTerms,
      privacy: enPrivacy,
      help: enHelp,
      faq: enFaq,
      about: enAbout,
    },
    am: {
      common: amCommon,
      auth: amAuth,
      dashboard: amDashboard,
      doctor: amDoctor,
      patient: amPatient,
      appointment: amAppointment,
      errors: amErrors,
      terms: amTerms,
      privacy: amPrivacy,
      help: amHelp,
      faq: amFaq,
      about: amAbout,
    }
  },
  lng: "en",
  fallbackLng: "en",
  ns: ['common', 'auth', 'dashboard', 'doctor', 'patient', 'appointment', 'errors'],
  defaultNS: 'common',
  fallbackNS: 'common',
  interpolation: {
    escapeValue: false
  }
});

/**
 * Enhanced useTranslation hook that intercepts standard translation calls,
 * passing them through the MedLink advanced translation service for missing key reporting
 * and graceful fallback resolution.
 */
export function useTranslation(ns?: string | string[]) {
  const { i18n: i18nInstance } = useI18nTranslation(ns);
  
  const customT = (key: string, options?: Record<string, any>): string => {
    let resolvedKey = key;
    if (ns && typeof ns === 'string' && !key.includes(':')) {
      resolvedKey = `${ns}:${key}`;
    }
    return translationService.t(resolvedKey, options);
  };
  
  return {
    t: customT,
    i18n: i18nInstance,
    translationService
  };
}

export default i18n;
import i18n from "i18next";
import { initReactI18next, useTranslation as useI18nTranslation } from "react-i18next";

// English namespaces
import enAbout from "./locales/en/about.json";
import enAppointment from "./locales/en/appointment.json";
import enAppointmentCard from "./locales/en/appointment_card.json";
import enAuth from "./locales/en/auth.json";
import enAvailability from "./locales/en/availability.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enDoctor from "./locales/en/doctor.json";
import enDoctorCard from "./locales/en/doctor_card.json";
import enDoctorProfile from "./locales/en/doctor_profile.json";
import enErrors from "./locales/en/errors.json";
import enFaq from "./locales/en/faq.json";
import enHelp from "./locales/en/help.json";
import enHomescreenComponents from "./locales/en/homescreenComponents.json";
import enMedicalInfo from "./locales/en/medicalInfo.json";
import enPatient from "./locales/en/patient.json";
import enPrivacy from "./locales/en/privacy.json";
import enTerms from "./locales/en/terms.json";
import enWallet from "./locales/en/wallet.json";
// Amharic namespaces
import amAbout from "./locales/am/about.json";
import amAppointment from "./locales/am/appointment.json";
import amAppointmentCard from "./locales/am/appointment_card.json";
import amAuth from "./locales/am/auth.json";
import amAvailability from "./locales/am/availability.json";
import amCommon from "./locales/am/common.json";
import amDashboard from "./locales/am/dashboard.json";
import amDoctor from "./locales/am/doctor.json";
import amDoctorCard from "./locales/am/doctor_card.json";
import amDoctorProfile from "./locales/am/doctor_profile.json";
import amErrors from "./locales/am/errors.json";
import amFaq from "./locales/am/faq.json";
import amHelp from "./locales/am/help.json";
import amHomescreenComponents from "./locales/am/homescreenComponents.json";
import amMedicalInfo from "./locales/am/medicalInfo.json";
import amPatient from "./locales/am/patient.json";
import amPrivacy from "./locales/am/privacy.json";
import amTerms from "./locales/am/terms.json";
import amWallet from "./locales/am/wallet.json";

import { translationService } from './services/translationService';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
      doctor: enDoctor,
      doctorCard: enDoctorCard,
      homescreenComponents: enHomescreenComponents,
      medicalInfo: enMedicalInfo,
      patient: enPatient,
      appointment: enAppointment,
      appointmentCard: enAppointmentCard,
      errors: enErrors,
      terms: enTerms,
      privacy: enPrivacy,
      help: enHelp,
      faq: enFaq,
      about: enAbout,
      availability: enAvailability,
      wallet: enWallet,
      doctorProfile: enDoctorProfile,
    },
    am: {
      common: amCommon,
      auth: amAuth,
      dashboard: amDashboard,
      doctor: amDoctor,
      doctorCard: amDoctorCard,
      homescreenComponents: amHomescreenComponents,
      medicalInfo: amMedicalInfo,
      patient: amPatient,
      appointment: amAppointment,
      appointmentCard: amAppointmentCard,
      errors: amErrors,
      terms: amTerms,
      privacy: amPrivacy,
      help: amHelp,
      faq: amFaq,
      about: amAbout,
      availability: amAvailability,
      wallet: amWallet,
      doctorProfile: amDoctorProfile,
    }
  },
  lng: "en",
  fallbackLng: "en",
  ns: [
    'common',
    'auth',
    'dashboard',
    'doctor',
    'doctorCard',
    'homescreenComponents',
    'patient',
    'appointment',
    'appointmentCard',
    'errors',
    'terms',
    'privacy',
    'help',
    'faq',
    'about',
    'medicalInfoView',
    'availability',
    'wallet',
    'doctorProfile',
  ],
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
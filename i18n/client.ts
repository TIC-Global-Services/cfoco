"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "./resources";
import {
  FALLBACK_LNG,
  DEFAULT_NS,
  NAMESPACES,
  STORAGE_KEY,
  SupportedLanguage,
} from "./config";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: FALLBACK_LNG,
      defaultNS: DEFAULT_NS,
      ns: Array.from(NAMESPACES),
      interpolation: {
        escapeValue: false, // React automatically escapes values
      },
      detection: {
        order: ["localStorage", "cookie", "navigator", "htmlTag"],
        lookupLocalStorage: STORAGE_KEY,
        lookupCookie: STORAGE_KEY,
        caches: ["localStorage", "cookie"],
      },
      react: {
        useSuspense: false, // Prevents hydration suspense issues in Next.js
      },
    });
}

/**
 * Programmatic helper to change current language and persist choice
 */
export const changeLanguage = async (lng: SupportedLanguage): Promise<void> => {
  await i18n.changeLanguage(lng);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, lng);
      document.documentElement.lang = lng;
    } catch {
      // Ignore storage access errors if in private browsing
    }
  }
};

export default i18n;

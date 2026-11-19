"use client";

import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./client";
import { FALLBACK_LNG } from "./config";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Keep document <html> lang attribute in sync with i18n
    const syncHtmlLang = (lng: string) => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = lng || FALLBACK_LNG;
      }
    };

    syncHtmlLang(i18n.language || FALLBACK_LNG);
    i18n.on("languageChanged", syncHtmlLang);

    return () => {
      i18n.off("languageChanged", syncHtmlLang);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export default I18nProvider;

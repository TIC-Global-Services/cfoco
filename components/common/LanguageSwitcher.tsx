"use client";

import React, { useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/i18n/config";
import { changeLanguage } from "@/i18n/client";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "dropdown";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "pill",
}) => {
  const { i18n, t } = useTranslation("common");
  const [, startTransition] = useTransition();

  const currentLang = (i18n.resolvedLanguage || i18n.language || "en").substring(0, 2);

  const handleSelect = (code: SupportedLanguage) => {
    if (code === currentLang) return;
    startTransition(() => {
      changeLanguage(code);
    });
  };

  if (variant === "dropdown") {
    return (
      <div className={`relative inline-block ${className}`}>
        <label htmlFor="language-select" className="sr-only">
          {t("buttons.switchLanguage", "Switch language")}
        </label>
        <select
          id="language-select"
          value={currentLang}
          onChange={(e) => handleSelect(e.target.value as SupportedLanguage)}
          className="appearance-none bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-medium py-1.5 pl-3 pr-7 rounded-full backdrop-blur-md cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-white/50"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-[#101726] text-white">
              {lang.name} ({lang.shortName})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/70">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t("buttons.switchLanguage", "Switch language")}
      className={`inline-flex items-center rounded-full border border-white/20 bg-white/5 p-1 backdrop-blur-md shadow-sm ${className}`}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleSelect(lang.code)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              isActive
                ? "bg-white text-[#101726] shadow-sm scale-100"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {lang.shortName}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;

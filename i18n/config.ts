export const FALLBACK_LNG = "en" as const;
export const DEFAULT_NS = "common" as const;

export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    name: "English",
    shortName: "EN",
    dir: "ltr",
  },
  {
    code: "fr",
    name: "Français",
    shortName: "FR",
    dir: "ltr",
  },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((lang) => lang.code) as readonly SupportedLanguage[];

export const NAMESPACES = [
  "common",
  "home",
  "about",
  "contact",
  "career",
  "location",
  "menu",
  "blog",
] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const STORAGE_KEY = "i18nextLng";

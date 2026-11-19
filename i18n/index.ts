export { default as i18n, changeLanguage } from "./client";
export { I18nProvider } from "./I18nProvider";
export {
  SUPPORTED_LANGUAGES,
  FALLBACK_LNG,
  DEFAULT_NS,
  NAMESPACES,
  STORAGE_KEY,
  type SupportedLanguage,
  type Namespace,
} from "./config";
export { resources, type AppResources } from "./resources";
export { useTranslation, Trans } from "react-i18next";

export type LocalizedValue<T = string> =
  | T
  | {
      en?: T;
      fr?: T;
      [key: string]: T | undefined;
    };

/**
 * Resolves a localized string or value safely.
 * Works seamlessly with:
 * 1. Plain strings (legacy or single-language data): "Dynamic Wings"
 * 2. Localized objects from Sanity: { en: "Dynamic Wings", fr: "Ailes Dynamiques" }
 * 3. Gracefully falls back to French or English if the requested language is missing.
 */
export function getLocalized<T = string>(
  value: LocalizedValue<T> | null | undefined,
  lang: string = "en",
  fallbackLang: string = "en"
): T | string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value as unknown as T;
  }

  if (typeof value === "object") {
    const localizedObj = value as Record<string, T | undefined>;

    // 1. Requested language
    const current = localizedObj[lang];
    if (current !== undefined && current !== null && current !== "") {
      return current;
    }

    // 2. Fallback language
    const fallback = localizedObj[fallbackLang];
    if (fallback !== undefined && fallback !== null && fallback !== "") {
      return fallback;
    }

    // 3. Alternative (e.g. if requested 'en' but only 'fr' exists, or vice versa)
    const alternativeLang = lang === "fr" ? "en" : "fr";
    const alt = localizedObj[alternativeLang];
    if (alt !== undefined && alt !== null && alt !== "") {
      return alt;
    }

    // 4. Any available value in object
    const firstAvailable = Object.values(localizedObj).find(
      (v) => v !== undefined && v !== null && v !== ""
    );
    if (firstAvailable !== undefined) {
      return firstAvailable;
    }
  }

  return "";
}

import commonEn from "./locales/en/common.json";
import homeEn from "./locales/en/home.json";
import aboutEn from "./locales/en/about.json";
import contactEn from "./locales/en/contact.json";
import careerEn from "./locales/en/career.json";
import locationEn from "./locales/en/location.json";
import menuEn from "./locales/en/menu.json";
import blogEn from "./locales/en/blog.json";
import commonFr from "./locales/fr/common.json";
import homeFr from "./locales/fr/home.json";
import aboutFr from "./locales/fr/about.json";
import contactFr from "./locales/fr/contact.json";
import careerFr from "./locales/fr/career.json";
import locationFr from "./locales/fr/location.json";
import menuFr from "./locales/fr/menu.json";
import blogFr from "./locales/fr/blog.json";

export const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    about: aboutEn,
    contact: contactEn,
    career: careerEn,
    location: locationEn,
    menu: menuEn,
    blog: blogEn,
  },
  fr: {
    common: commonFr,
    home: homeFr,
    about: aboutFr,
    contact: contactFr,
    career: careerFr,
    location: locationFr,
    menu: menuFr,
    blog: blogFr,
  },
} as const;

export type AppResources = typeof resources;

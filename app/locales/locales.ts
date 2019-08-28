// If translations get too big, we should load them dynamically. But for now it's fine.
import catalogDe from "./de/messages.js";
import catalogFr from "./fr/messages.js";
import catalogIt from "./it/messages.js";
import catalogEn from "./en/messages.js";

export const defaultLocale = "de";

export const locales = ["de", "fr", "it", "en"] as const;

export const catalogs = {
  de: catalogDe,
  fr: catalogFr,
  it: catalogIt,
  en: catalogEn
} as const;

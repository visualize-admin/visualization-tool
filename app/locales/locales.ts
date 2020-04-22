// If translations get too big, we should load them dynamically. But for now it's fine.
import catalogDe from "./de/messages.js";
import catalogFr from "./fr/messages.js";
import catalogIt from "./it/messages.js";
import catalogEn from "./en/messages.js";

import timeFormatDe from "d3-time-format/locale/de-CH.json";
import timeFormatFr from "d3-time-format/locale/fr-FR.json";
import timeFormatIt from "d3-time-format/locale/it-IT.json";
import timeFormatEn from "d3-time-format/locale/en-GB.json";

// Use the same number format in each language
import numberFormatCh from "d3-format/locale/de-CH.json";

export const defaultLocale = "de";

// The order specified here will determine the fallback order when strings are not available in the preferred language
export const locales = ["en", "de", "fr", "it"] as const;

export type Locales = "de" | "fr" | "it" | "en";

/**
 * Parses a valid app locale from a locale string (e.g. a Accept-Language header).
 * If unparseable, returns default locale.
 * @param localeString locale string, e.g. de,en-US;q=0.7,en;q=0.3
 */
export const parseLocaleString = (localeString: string): Locales => {
  const result = /^(de|fr|it|en)/.exec(localeString);
  return result ? (result[1] as Locales) : defaultLocale;
};

export const catalogs = {
  de: catalogDe,
  fr: catalogFr,
  it: catalogIt,
  en: catalogEn
} as const;

export const d3TimeFormatLocales = {
  de: timeFormatDe,
  fr: timeFormatFr,
  it: timeFormatIt,
  en: timeFormatEn
} as const;

export const d3FormatLocales = {
  de: numberFormatCh,
  fr: numberFormatCh,
  it: numberFormatCh,
  en: numberFormatCh
} as const;

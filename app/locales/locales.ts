// If translations get too big, we should load them dynamically. But for now it's fine.
// Use the same number format in each language
import { formatLocale, FormatLocaleDefinition, FormatLocaleObject } from "d3";
import numberFormatCh from "d3-format/locale/de-CH.json";
import {
  timeFormatLocale,
  TimeLocaleDefinition,
  TimeLocaleObject,
} from "d3-time-format";
import timeFormatDe from "d3-time-format/locale/de-CH.json";
import timeFormatEn from "d3-time-format/locale/en-GB.json";
import timeFormatFr from "d3-time-format/locale/fr-FR.json";
import timeFormatIt from "d3-time-format/locale/it-IT.json";
import { messages as catalogDe } from "./de/messages";
import { messages as catalogEn } from "./en/messages";
import { messages as catalogFr } from "./fr/messages";
import { messages as catalogIt } from "./it/messages";
import { i18n } from "@lingui/core";
import {
  de as pluralsDe,
  fr as pluralsFr,
  it as pluralsIt,
  en as pluralsEn,
} from "make-plural/plurals";

// Keep up-to-date with actual locales!
export const defaultLocale = "de";
// The order specified here will determine the fallback order when strings are not available in the preferred language
export const locales = ["de", "fr", "it", "en"] as const;

export type Locale = typeof locales[number];

i18n.loadLocaleData({
  de: { plurals: pluralsDe },
  fr: { plurals: pluralsFr },
  it: { plurals: pluralsIt },
  en: { plurals: pluralsEn },
});
i18n.load({
  de: catalogDe,
  fr: catalogFr,
  it: catalogIt,
  en: catalogEn,
});
i18n.activate(defaultLocale);

export { i18n };

/**
 * Parses a valid app locale from a locale string (e.g. a Accept-Language header).
 * If unparseable, returns default locale.
 * @param localeString locale string, e.g. de,en-US;q=0.7,en;q=0.3
 */
export const parseLocaleString = (localeString: string): Locale => {
  const result = /^(de|fr|it|en)/.exec(localeString);
  return result ? (result[1] as Locale) : defaultLocale;
};

const d3TimeFormatLocales: { [locale: string]: TimeLocaleObject } = {
  de: timeFormatLocale(timeFormatDe as TimeLocaleDefinition),
  fr: timeFormatLocale(timeFormatFr as TimeLocaleDefinition),
  it: timeFormatLocale(timeFormatIt as TimeLocaleDefinition),
  en: timeFormatLocale(timeFormatEn as TimeLocaleDefinition),
};

export const getD3TimeFormatLocale = (locale: string): TimeLocaleObject =>
  d3TimeFormatLocales[locale] ?? d3TimeFormatLocales.de;

const d3FormatLocales: { [locale: string]: FormatLocaleObject } = {
  de: formatLocale(numberFormatCh as FormatLocaleDefinition),
  // fr: formatLocale(numberFormatCh as FormatLocaleDefinition),
  // it: formatLocale(numberFormatCh as FormatLocaleDefinition),
  // en: formatLocale(numberFormatCh as FormatLocaleDefinition),
};

export const getD3FormatLocale = (locale: string): FormatLocaleObject =>
  d3FormatLocales.de;

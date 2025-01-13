// If translations get too big, we should load them dynamically. But for now it's fine.
// Use the same number format in each language
import { i18n } from "@lingui/core";
import {
  formatLocale,
  FormatLocaleDefinition,
  FormatLocaleObject,
} from "d3-format";
import {
  timeFormatLocale,
  TimeLocaleDefinition,
  TimeLocaleObject,
} from "d3-time-format";
import {
  de as pluralsDe,
  en as pluralsEn,
  fr as pluralsFr,
  it as pluralsIt,
} from "make-plural/plurals";

import { defaultLocale, locales } from "@/locales/constants";

import { messages as catalogDe } from "./de/messages";
import { messages as catalogEn } from "./en/messages";
import { messages as catalogFr } from "./fr/messages";
import { messages as catalogIt } from "./it/messages";

export type Locale = (typeof locales)[number];

export { defaultLocale, locales };
export { i18n };

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

/**
 * Parses a valid app locale from a locale string (e.g. a Accept-Language header).
 * If unparseable, returns default locale.
 * @param localeString locale string, e.g. de,en-US;q=0.7,en;q=0.3
 */
export const parseLocaleString = (
  localeString: string | null | undefined
): Locale => {
  if (localeString == null) {
    return defaultLocale;
  }
  const result = /^(de|fr|it|en)/.exec(localeString);
  return result ? (result[1] as Locale) : defaultLocale;
};

// Below constants are extracted from d3-time-format/locale.
const timeFormatDe = {
  dateTime: "%A, der %e. %B %Y, %X",
  date: "%d.%m.%Y",
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ],
  shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  months: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  shortMonths: [
    "Jan",
    "Feb",
    "Mrz",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ],
};

const timeFormatEn = {
  dateTime: "%a %e %b %X %Y",
  date: "%d/%m/%Y",
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  shortMonths: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

const timeFormatFr = {
  dateTime: "%A %e %B %Y à %X",
  date: "%d/%m/%Y",
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ],
  shortDays: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
  months: [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ],
  shortMonths: [
    "janv.",
    "févr.",
    "mars",
    "avr.",
    "mai",
    "juin",
    "juil.",
    "août",
    "sept.",
    "oct.",
    "nov.",
    "déc.",
  ],
};

const timeFormatIt = {
  dateTime: "%A %e %B %Y, %X",
  date: "%d/%m/%Y",
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ],
  shortDays: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
  months: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
  shortMonths: [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ],
};

const d3TimeFormatLocales: { [locale: string]: TimeLocaleObject } = {
  de: timeFormatLocale(timeFormatDe as TimeLocaleDefinition),
  fr: timeFormatLocale(timeFormatFr as TimeLocaleDefinition),
  it: timeFormatLocale(timeFormatIt as TimeLocaleDefinition),
  en: timeFormatLocale(timeFormatEn as TimeLocaleDefinition),
};

export const getD3TimeFormatLocale = (locale: string): TimeLocaleObject =>
  d3TimeFormatLocales[locale] ?? d3TimeFormatLocales.de;

const numberFormatCh = {
  decimal: ",",
  thousands: "'",
  grouping: [3],
  currency: ["", "\u00a0CHF"],
};

const d3FormatLocales: { [locale: string]: FormatLocaleObject } = {
  de: formatLocale(numberFormatCh as FormatLocaleDefinition),
  // fr: formatLocale(numberFormatCh as FormatLocaleDefinition),
  // it: formatLocale(numberFormatCh as FormatLocaleDefinition),
  // en: formatLocale(numberFormatCh as FormatLocaleDefinition),
};

export const getD3FormatLocale = (): FormatLocaleObject => d3FormatLocales.de;

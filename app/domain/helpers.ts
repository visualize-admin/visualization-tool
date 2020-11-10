import { scaleOrdinal } from "d3-scale";
import {
  schemeAccent,
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from "d3-scale-chromatic";
import { timeDay, timeHour, timeMinute, timeMonth, timeYear } from "d3-time";
import { timeParse } from "d3-time-format";
import { useMemo } from "react";
import { DimensionFieldsWithValuesFragment } from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";
import { d3FormatLocales, d3TimeFormatLocales } from "../locales/locales";

// FIXME: We should cover more time format
const parseTime = timeParse("%Y-%m-%dT%H:%M:%S");
const parseDay = timeParse("%Y-%m-%d");
const parseMonth = timeParse("%Y-%m");
const parseYear = timeParse("%Y");
export const parseDate = (dateStr: string): Date =>
  parseTime(dateStr) ??
  parseDay(dateStr) ??
  parseMonth(dateStr) ??
  parseYear(dateStr) ??
  // This should probably not happen
  new Date(dateStr);

export const isNumber = (x: $IntentionalAny): boolean =>
  typeof x === "number" && !isNaN(x);
export const mkNumber = (x: $IntentionalAny): number => +x;

/**
 * Formats dates automatically based on their precision in LONG form.
 *
 * Use wherever dates are displayed without being in context of other dates (e.g. in tooltips)
 */
export const useFormatFullDateAuto = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = d3TimeFormatLocales[locale];

    const formatSecond = format("%d.%m.%Y %H:%M:%S");
    const formatMinute = format("%d.%m.%Y %H:%M");
    const formatHour = format("%d.%m.%Y %H:%M");
    const formatDay = format("%d.%m.%Y");
    const formatMonth = format("%m.%Y");
    const formatYear = format("%Y");

    return (date: Date) => {
      return (timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
        ? formatMinute
        : timeDay(date) < date
        ? formatHour
        : timeMonth(date) < date
        ? formatDay
        : timeYear(date) < date
        ? formatMonth
        : formatYear)(date);
    };
  }, [locale]);

  return formatter;
};

/**
 * Formats dates automatically based on their precision in SHORT form.
 *
 * Use wherever dates are displayed in context of other dates (e.g. on time axes)
 */
export const useFormatShortDateAuto = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = d3TimeFormatLocales[locale];

    const formatSecond = format(":%S");
    const formatMinute = format("%H:%M");
    const formatHour = format("%H");
    const formatDay = format("%d");
    const formatMonth = format("%b");
    const formatYear = format("%Y");

    return (date: Date) => {
      return (timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
        ? formatMinute
        : timeDay(date) < date
        ? formatHour
        : timeMonth(date) < date
        ? formatDay
        : timeYear(date) < date
        ? formatMonth
        : formatYear)(date);
    };
  }, [locale]);

  return formatter;
};

// export const formatNumber = (x: number): string => format(",.2~f")(x);

export const useFormatNumber = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = d3FormatLocales[locale];
    return format(",.2~f");
  }, [locale]);
  return formatter;
};

export const getPalette = (
  palette?: string | undefined
): ReadonlyArray<string> => {
  switch (palette) {
    case "accent":
      return schemeAccent;
    case "category10":
      return schemeCategory10;
    case "dark2":
      return schemeDark2;
    case "paired":
      return schemePaired;
    case "pastel1":
      return schemePastel1;
    case "pastel2":
      return schemePastel2;
    case "set1":
      return schemeSet1;
    case "set2":
      return schemeSet2;
    case "set3":
      return schemeSet3;
    case "tableau10":
      return schemeTableau10;
    default:
      return schemeCategory10;
  }
};

export const mapColorsToComponentValuesIris = ({
  palette,
  component,
}: {
  palette: string;
  component: DimensionFieldsWithValuesFragment;
}) => {
  const colorScale = scaleOrdinal()
    .domain(component.values.map((dv) => dv.value))
    .range(getPalette(palette));
  const colorMapping = {} as { [x: string]: string };

  component.values.forEach((dv) => {
    colorMapping[`${dv.value}` as string] = colorScale(dv.value) as string;
  });
  return colorMapping;
};

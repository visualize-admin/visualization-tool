import { i18n } from "@lingui/core";
import { defineMessage } from "@lingui/macro";
import {
  ascending,
  CountableTimeInterval,
  interpolateBlues,
  interpolateBrBG,
  interpolateGreens,
  interpolateGreys,
  interpolateOranges,
  interpolatePiYG,
  interpolatePRGn,
  interpolatePuOr,
  interpolatePurples,
  interpolateReds,
  NumberValue,
  scaleOrdinal,
  schemeAccent,
  schemeBlues,
  schemeBrBG,
  schemeCategory10,
  schemeDark2,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemePiYG,
  schemePuOr,
  schemePurples,
  schemeReds,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
  timeDay,
  timeHour,
  TimeLocaleObject,
  timeMinute,
  timeMonth,
  timeParse,
  timeSecond,
  timeWeek,
  timeYear,
} from "d3";
import { keyBy, memoize } from "lodash";
import { useMemo } from "react";

import { ChartProps } from "../../charts/shared/use-chart-state";
import { Observation } from "../../domain/data";
import {
  DimensionMetadataFragment,
  Measure,
  TemporalDimension,
  TimeUnit,
} from "../../graphql/query-hooks";
import { IconName } from "../../icons";
import {
  getD3FormatLocale,
  getD3TimeFormatLocale,
} from "../../locales/locales";
import { useLocale } from "../../locales/use-locale";
import {
  DivergingPaletteType,
  SequentialPaletteType,
  TableColumn,
  TableFields,
} from "../config-types";

export type DateFormatter = (d: string | Date | null) => string;

// FIXME: We should cover more time format
const parseSecond = timeParse("%Y-%m-%dT%H:%M:%S");
const parseMinute = timeParse("%Y-%m-%dT%H:%M");
const parseDay = timeParse("%Y-%m-%d");
const parseMonth = timeParse("%Y-%m");
const parseYear = timeParse("%Y");

export const parseDate = (dateStr: string): Date =>
  parseSecond(dateStr) ??
  parseMinute(dateStr) ??
  parseDay(dateStr) ??
  parseMonth(dateStr) ??
  parseYear(dateStr) ??
  // This should probably not happen
  new Date(dateStr);

export const mkNumber = (x: $IntentionalAny): number => +x;

const getFormattersForLocale = memoize((locale) => {
  const { format } = getD3TimeFormatLocale(locale);
  return {
    empty: () => "-",
    second: format("%d.%m.%Y %H:%M:%S"),
    minute: format("%d.%m.%Y %H:%M"),
    hour: format("%d.%m.%Y %H:%M"),
    day: format("%d.%m.%Y"),
    month: format("%m.%Y"),
    year: format("%Y"),
  };
});

export const useLocalFormatters = () => {
  const locale = useLocale();
  return getFormattersForLocale(locale);
};

const dateFormatterFromDimension = (
  dim: TemporalDimension,
  localFormatters: LocalDateFormatters,
  formatDateAuto: (d: Date | string | null) => string
) => {
  if (
    dim.timeFormat &&
    dim.timeUnit &&
    localFormatters[dim.timeUnit.toLowerCase() as keyof typeof localFormatters]
  ) {
    const formatter =
      localFormatters[
        dim.timeUnit.toLowerCase() as keyof typeof localFormatters
      ];
    const parser = timeParse(dim.timeFormat);
    return (d: string | null) => {
      if (!d) {
        return localFormatters.empty();
      }
      const parsed = parser(d);
      return parsed ? formatter(parsed) : localFormatters.empty();
    };
  }
  return formatDateAuto;
};

const formatIdentity = (x: string | Date | null) => {
  return `${x}`;
};

const isNamedNodeDimension = (d: DimensionMetadataFragment) => {
  const first = d.values?.[0];
  return first && first.label !== first.value;
};

const namedNodeFormatter = (d: DimensionMetadataFragment) => {
  const valuesByIri = keyBy(d.values, (x) => x.value);
  return (v: string) => {
    return valuesByIri[v]?.label || v;
  };
};

const currencyFormatter = (d: Measure) => {
  const formatLocale = getD3FormatLocale();
  const minDecimals = d.resolution ?? d.currencyExponent ?? 2;
  const maxDecimals = 8;
  const baseFormatter = formatLocale.format(`,.${maxDecimals}f`);
  return (v: number) => {
    const formatted = baseFormatter(v);
    const l = formatted.length;

    // TODO Decimal separator should be based on locale
    const dot = formatted.indexOf(".");

    let lastSignificantIndex = formatted.length - maxDecimals + minDecimals - 1;
    for (let i = l - maxDecimals + minDecimals; i < l; i++) {
      if (formatted[i] !== "0") {
        lastSignificantIndex = i;
      }
    }
    return formatted.substring(
      0,
      lastSignificantIndex +
        (minDecimals === 0 || dot === lastSignificantIndex ? 0 : 1)
    );
  };
};

export const useDimensionFormatters = (
  dimensions: DimensionMetadataFragment[]
) => {
  const formatNumber = useFormatNumber() as unknown as (
    d: number | string
  ) => string;
  const formatDateAuto = useFormatFullDateAuto();
  const dateFormatters = useLocalFormatters();

  return useMemo(() => {
    return Object.fromEntries(
      dimensions.map((d) => {
        let formatter: (s: any) => string;
        if (d.__typename === "Measure") {
          if (d.isCurrency) {
            formatter = currencyFormatter(d);
          } else {
            formatter = formatNumber;
          }
        } else if (d.__typename === "TemporalDimension") {
          formatter = dateFormatterFromDimension(
            d,
            dateFormatters,
            formatDateAuto
          );
        } else if (isNamedNodeDimension(d)) {
          formatter = namedNodeFormatter(d);
        } else if (d.isNumerical) {
          formatter = formatNumber;
        } else {
          formatter = formatIdentity;
        }

        return [d.iri, formatter];
      })
    );
  }, [dimensions, formatNumber, dateFormatters, formatDateAuto]);
};

export type LocalDateFormatters = ReturnType<typeof getFormattersForLocale>;

/**
 * Formats dates automatically based on their precision in LONG form.
 *
 * Use wherever dates are displayed without being in context of other dates (e.g. in tooltips)
 */
export const useFormatFullDateAuto = () => {
  const formatters = useLocalFormatters();
  const formatter = useMemo(() => {
    return (dateInput: Date | string | null) => {
      if (dateInput === null) {
        return formatters.empty();
      }

      const date =
        typeof dateInput === "string" ? parseDate(dateInput) : dateInput;

      return (
        timeMinute(date) < date
          ? formatters.second
          : timeHour(date) < date
          ? formatters.minute
          : timeDay(date) < date
          ? formatters.hour
          : timeMonth(date) < date
          ? formatters.day
          : timeYear(date) < date
          ? formatters.month
          : formatters.year
      )(date);
    };
  }, [formatters]);

  return formatter;
};

/**
 * Parses and formats ISO *dates* of form 2002-01-01.
 */
export const useFormatDate = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format, parse } = getD3TimeFormatLocale(locale);

    const parseDate = parse("%Y-%m-%d");
    const formatDate = format("%d.%m.%Y");

    return (date: string) => {
      const d = parseDate(date);
      return d ? formatDate(d) : null;
    };
  }, [locale]);

  return formatter;
};

/**
 * Parses and formats ISO *dates* of form 2002-01-01.
 */
export const useTimeFormatLocale = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    return getD3TimeFormatLocale(locale);
  }, [locale]);

  return formatter;
};

const timeIntervals = new Map<TimeUnit, CountableTimeInterval>([
  [TimeUnit.Year, timeYear],
  [TimeUnit.Month, timeMonth],
  [TimeUnit.Week, timeWeek],
  [TimeUnit.Day, timeDay],
  [TimeUnit.Hour, timeHour],
  [TimeUnit.Minute, timeMinute],
  [TimeUnit.Second, timeSecond],
]);

const timeFormats = new Map<TimeUnit, string>([
  [TimeUnit.Year, "%Y"],
  [TimeUnit.Month, "%b %Y"],
  [TimeUnit.Week, "%d.%m.%Y"],
  [TimeUnit.Day, "%d.%m.%Y"],
  [TimeUnit.Hour, "%d.%m.%Y %H:%M"],
  [TimeUnit.Minute, "%d.%m.%Y %H:%M"],
  [TimeUnit.Second, "%d.%m.%Y %H:%M:%S"],
]);

export const getTimeInterval = (timeUnit: TimeUnit): CountableTimeInterval => {
  return timeIntervals.get(timeUnit) ?? timeDay;
};

export const useTimeFormatUnit = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = getD3TimeFormatLocale(locale);

    return (dateInput: Date | string, timeUnit: TimeUnit) => {
      const date =
        typeof dateInput === "string" ? parseDate(dateInput) : dateInput;

      const timeFormat =
        timeFormats.get(timeUnit) ?? timeFormats.get(TimeUnit.Day)!;
      const f = format(timeFormat);

      return f(date);
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
    const { format } = getD3TimeFormatLocale(locale);

    const formatSecond = format(":%S");
    const formatMinute = format("%H:%M");
    const formatHour = format("%H");
    const formatDay = format("%d");
    const formatMonth = format("%b");
    const formatYear = format("%Y");

    return (date: Date) => {
      return (
        timeMinute(date) < date
          ? formatSecond
          : timeHour(date) < date
          ? formatMinute
          : timeDay(date) < date
          ? formatHour
          : timeMonth(date) < date
          ? formatDay
          : timeYear(date) < date
          ? formatMonth
          : formatYear
      )(date);
    };
  }, [locale]);

  return formatter;
};

export const getTimeIntervalWithProps = (
  from: string,
  to: string,
  timeUnit: TimeUnit,
  timeFormat: string,
  formatLocale: TimeLocaleObject
) => {
  const formatDateValue = formatLocale.format(timeFormat);
  const parseDateValue = formatLocale.parse(timeFormat);

  const fromDate = parseDateValue(from);
  const toDate = parseDateValue(to);
  if (!fromDate || !toDate) {
    throw Error(`Error parsing dates ${from}, ${to}`);
  }
  const interval = getTimeInterval(timeUnit);

  return {
    fromDate,
    toDate,
    formatDateValue,
    range: interval.count(fromDate, toDate) + 1,
    interval,
  };
};

export const getTimeIntervalFormattedSelectOptions = ({
  fromDate,
  toDate,
  formatDateValue,
  interval,
}: {
  fromDate: Date;
  toDate: Date;
  formatDateValue: (date: Date) => string;
  interval: CountableTimeInterval;
}) => {
  return [...interval.range(fromDate, toDate), toDate].map((d) => {
    return {
      value: formatDateValue(d),
      label: formatDateValue(d),
    };
  });
};

export const formatError = (
  error: [number, number],
  formatNumber: (n: number) => string
) => {
  return `[${formatNumber(error[0])}, ${formatNumber(error[1])}]`;
};

export const formatNumberWithUnit = (
  nb: number | null,
  formatter: (n: number) => string,
  unit?: string | null
) => {
  if (nb === null || nb === undefined) {
    return "-";
  }
  return `${formatter(nb)}${unit ? ` ${unit}` : ""}`;
};

export const useErrorMeasure = (
  chartState: Pick<ChartProps, "measures" | "dimensions">,
  valueIri: string
) => {
  const { measures, dimensions } = chartState;
  return useMemo(() => {
    return [...measures, ...dimensions].find((m) => {
      return m.related?.some(
        (r) => r.type === "StandardError" && r.iri === valueIri
      );
    });
  }, [dimensions, measures, valueIri]);
};

export const useErrorVariable = (errorMeasure?: DimensionMetadataFragment) => {
  return useMemo(() => {
    return errorMeasure
      ? (d: Observation) => {
          return d[errorMeasure.iri];
        }
      : null;
  }, [errorMeasure]);
};

export const useErrorRange = (
  errorMeasure: DimensionMetadataFragment | undefined,
  valueGetter: (d: Observation) => number | null
) => {
  return useMemo(() => {
    return errorMeasure
      ? (d: Observation) => {
          const v = valueGetter(d) as number;
          const errorIri = errorMeasure.iri;
          let error =
            d[errorIri] !== null ? parseFloat(d[errorIri] as string) : null;
          if (errorMeasure.unit === "%" && error !== null) {
            error = (error * v) / 100;
          }
          return (error === null ? [v, v] : [v - error, v + error]) as [
            number,
            number
          ];
        }
      : null;
  }, [errorMeasure, valueGetter]);
};

export const useFormatNumber = () => {
  const formatter = useMemo(() => {
    const { format } = getD3FormatLocale();
    const formatter = format(",.2~f");
    return (x: NumberValue | null | undefined) => {
      if (x === null || x === undefined) {
        return "–";
      }
      return `${formatter(x)}`;
    };
  }, []);
  return formatter;
};

export const useFormatInteger = () => {
  const formatter = useMemo(() => {
    const { format } = getD3FormatLocale();
    const formatter = format(",.0~f");
    return (x: NumberValue | null | undefined) => {
      if (x === null || x === undefined) {
        return "–";
      }
      return formatter(x);
    };
  }, []);
  return formatter;
};

export const getIconName = (name: string): IconName => {
  switch (name) {
    case "x":
      return "xAxis";
    case "y":
      return "yAxis";
    case "segment":
      return "color";
    case "table":
      return "table";
    case "filter":
      return "filter";
    case "column":
      return "chartColumn";
    case "bar":
      return "chartBar";
    case "line":
      return "chartLine";
    case "area":
      return "chartArea";
    case "scatterplot":
      return "chartScatterplot";
    case "pie":
      return "chartPie";
    case "map":
      return "chartMap";
    case "baseLayer":
      return "mapMaptype";
    case "areaLayer":
      return "mapRegions";
    case "symbolLayer":
      return "mapSymbols";
    case "text":
      return "text";
    case "title":
      return "text";
    case "description":
      return "description";
    case "tableColumnMeasure":
      return "tableColumnNumerical";
    case "tableColumnMeasureHidden":
      return "tableColumnNumericalHidden";
    case "tableColumnNominalDimension":
      return "tableColumnCategorical";
    case "tableColumnNominalDimensionHidden":
      return "tableColumnCategoricalHidden";
    case "tableColumnOrdinalDimension":
      return "tableColumnCategorical";
    case "tableColumnOrdinalDimensionHidden":
      return "tableColumnCategoricalHidden";
    case "tableColumnTemporalDimension":
      return "tableColumnTime";
    case "tableColumnTemporalDimensionHidden":
      return "tableColumnTimeHidden";
    case "time":
      return "time";

    default:
      return "table";
  }
};

const fieldLabels = {
  "controls.axis.horizontal": defineMessage({
    id: "controls.axis.horizontal",
    message: "Horizontal axis",
  }),
  "controls.measure": defineMessage({
    id: "controls.measure",
    message: "Measure",
  }),
  "controls.axis.vertical": defineMessage({
    id: "controls.axis.vertical",
    message: "Vertical axis",
  }),
  "controls.color": defineMessage({ id: "controls.color", message: "Color" }),
  "controls.title": defineMessage({ id: "controls.title", message: "Title" }),
  "controls.description": defineMessage({
    id: "controls.description",
    message: "Description",
  }),
  "controls.column.stacked": defineMessage({
    id: "controls.column.stacked",
    message: "Stacked",
  }),
  "controls.column.grouped": defineMessage({
    id: "controls.column.grouped",
    message: "Grouped",
  }),
  "chart.map.layers.base": defineMessage({
    id: "chart.map.layers.base",
    message: "Map Display",
  }),
  "chart.map.layers.area": defineMessage({
    id: "chart.map.layers.area",
    message: "Areas",
  }),
  "chart.map.layers.symbol": defineMessage({
    id: "chart.map.layers.symbol",
    message: "Symbols",
  }),
  "controls.sorting.sortBy": defineMessage({
    id: "controls.sorting.sortBy",
    message: "Sort by",
  }),
  "controls.sorting.byDimensionLabel.ascending": defineMessage({
    id: "controls.sorting.byDimensionLabel.ascending",
    message: "A → Z",
  }),
  "controls.sorting.byDimensionLabel.descending": defineMessage({
    id: "controls.sorting.byDimensionLabel.descending",
    message: "Z → A",
  }),
  "controls.sorting.byTotalSize.ascending": defineMessage({
    id: "controls.sorting.byTotalSize.ascending",
    message: "Largest last",
  }),
  "controls.sorting.byTotalSize.largestFirst": defineMessage({
    id: "controls.sorting.byTotalSize.largestFirst",
    message: "Largest first",
  }),
  "controls.sorting.byTotalSize.largestTop": defineMessage({
    id: "controls.sorting.byTotalSize.largestTop",
    message: "Largest top",
  }),
  "controls.sorting.byTotalSize.largestBottom": defineMessage({
    id: "controls.sorting.byTotalSize.largestBottom",
    message: "Largest bottom",
  }),
  "controls.sorting.byMeasure.ascending": defineMessage({
    id: "controls.sorting.byMeasure.ascending",
    message: "1 → 9",
  }),
  "controls.sorting.byMeasure.descending": defineMessage({
    id: "controls.sorting.byMeasure.descending",
    message: "9 → 1",
  }),
  "controls.imputation": defineMessage({
    id: "controls.imputation",
    message: "Imputation type",
  }),
  "controls.imputation.type.none": defineMessage({
    id: "controls.imputation.type.none",
    message: "-",
  }),
  "controls.imputation.type.zeros": defineMessage({
    id: "controls.imputation.type.zeros",
    message: "Zeros",
  }),
  "controls.imputation.type.linear": defineMessage({
    id: "controls.imputation.type.linear",
    message: "Linear interpolation",
  }),
  "controls.chart.type.column": defineMessage({
    id: "controls.chart.type.column",
    message: "Columns",
  }),
  "controls.chart.type.bar": defineMessage({
    id: "controls.chart.type.bar",
    message: "Bars",
  }),
  "controls.chart.type.line": defineMessage({
    id: "controls.chart.type.line",
    message: "Lines",
  }),
  "controls.chart.type.area": defineMessage({
    id: "controls.chart.type.area",
    message: "Areas",
  }),
  "controls.chart.type.scatterplot": defineMessage({
    id: "controls.chart.type.scatterplot",
    message: "Scatterplot",
  }),
  "controls.chart.type.pie": defineMessage({
    id: "controls.chart.type.pie",
    message: "Pie",
  }),
  "controls.chart.type.table": defineMessage({
    id: "controls.chart.type.table",
    message: "Table",
  }),
  "controls.chart.type.map": defineMessage({
    id: "controls.chart.type.map",
    message: "Map",
  }),
  "controls.language.english": defineMessage({
    id: "controls.language.english",
    message: "English",
  }),
  "controls.language.german": defineMessage({
    id: "controls.language.german",
    message: "German",
  }),
  "controls.language.french": defineMessage({
    id: "controls.language.french",
    message: "French",
  }),
  "controls.language.italian": defineMessage({
    id: "controls.language.italian",
    message: "Italian",
  }),
};

export function getFieldLabel(field: string): string {
  switch (field) {
    // Visual encodings (left column)
    case "column.x":
    case "line.x":
    case "area.x":
    case "scatterplot.x":
    case "pie.x":
    case "x":
      return i18n._(fieldLabels["controls.axis.horizontal"]);
    case "bar.x":
    case "pie.y":
      return i18n._(fieldLabels["controls.measure"]);
    case "scatterplot.y":
    case "column.y":
    case "line.y":
    case "area.y":
    case "bar.y":
    case "y":
      return i18n._(fieldLabels["controls.axis.vertical"]);
    case "bar.segment":
    case "column.segment":
    case "line.segment":
    case "area.segment":
    case "scatterplot.segment":
    case "pie.segment":
    case "segment":
      return i18n._(fieldLabels["controls.color"]);
    case "map.baseLayer":
      return i18n._(fieldLabels["chart.map.layers.base"]);
    case "map.areaLayer":
      return i18n._(fieldLabels["chart.map.layers.area"]);
    case "map.symbolLayer":
      return i18n._(fieldLabels["chart.map.layers.symbol"]);
    case "title":
      return i18n._(fieldLabels["controls.title"]);
    case "description":
      return i18n._(fieldLabels["controls.description"]);

    // Encoding Options (right column)
    case "stacked":
      return i18n._(fieldLabels["controls.column.stacked"]);
    case "grouped":
      return i18n._(fieldLabels["controls.column.grouped"]);
    case "sortBy":
      return i18n._(fieldLabels["controls.sorting.sortBy"]);
    case "imputation":
      return i18n._(fieldLabels["controls.imputation"]);

    case "bar.stacked.byDimensionLabel.asc":
    case "bar.grouped.byDimensionLabel.asc":
    case "column..byDimensionLabel.asc":
    case "column.stacked.byDimensionLabel.asc":
    case "column.grouped.byDimensionLabel.asc":
    case "area..byDimensionLabel.asc":
    // for existing charts compatibility
    case "area.stacked.byDimensionLabel.asc":
    case "pie..byDimensionLabel.asc":
    case "sorting.byDimensionLabel.asc":
      return i18n._(fieldLabels["controls.sorting.byDimensionLabel.ascending"]);
    case "bar.stacked.byDimensionLabel.desc":
    case "bar.grouped.byDimensionLabel.desc":
    case "column..byDimensionLabel.desc":
    case "column.stacked.byDimensionLabel.desc":
    case "column.grouped.byDimensionLabel.desc":
    case "area..byDimensionLabel.desc":
    // for existing charts compatibility
    case "area.stacked.byDimensionLabel.desc":
    case "pie..byDimensionLabel.desc":
    case "sorting.byDimensionLabel.desc":
      return i18n._(
        fieldLabels["controls.sorting.byDimensionLabel.descending"]
      );
    case "bar.stacked.byTotalSize.desc":
    case "bar.grouped.byTotalSize.desc":
    case "column.grouped.byTotalSize.asc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.ascending"]);
    case "column.grouped.byTotalSize.desc":
    case "bar.stacked.byTotalSize.asc":
    case "bar.grouped.byTotalSize.asc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.largestFirst"]);
    case "area..byTotalSize.asc":
    // for existing charts compatibility
    case "area.stacked.byTotalSize.asc":
    case "column.stacked.byTotalSize.asc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.largestTop"]);
    case "area..byTotalSize.desc":
    // for existing charts compatibility
    case "area.stacked.byTotalSize.desc":
    case "column.stacked.byTotalSize.desc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.largestBottom"]);
    case "column..byMeasure.asc":
    case "column.stacked.byMeasure.asc":
    case "column.grouped.byMeasure.asc":
    case "pie..byMeasure.asc":
    case "sorting.byMeasure.asc":
      return i18n._(fieldLabels["controls.sorting.byMeasure.ascending"]);
    case "column..byMeasure.desc":
    case "column.stacked.byMeasure.desc":
    case "column.grouped.byMeasure.desc":
    case "pie..byMeasure.desc":
    case "sorting.byMeasure.desc":
      return i18n._(fieldLabels["controls.sorting.byMeasure.descending"]);

    // Chart Types
    case "column":
      return i18n._(fieldLabels["controls.chart.type.column"]);
    case "bar":
      return i18n._(fieldLabels["controls.chart.type.bar"]);
    case "line":
      return i18n._(fieldLabels["controls.chart.type.line"]);
    case "area":
      return i18n._(fieldLabels["controls.chart.type.area"]);
    case "scatterplot":
      return i18n._(fieldLabels["controls.chart.type.scatterplot"]);
    case "pie":
      return i18n._(fieldLabels["controls.chart.type.pie"]);
    case "table":
      return i18n._(fieldLabels["controls.chart.type.table"]);
    case "map":
      return i18n._(fieldLabels["controls.chart.type.map"]);

    // Languages
    case "en":
      return i18n._(fieldLabels["controls.language.english"]);
    case "de":
      return i18n._(fieldLabels["controls.language.german"]);
    case "fr":
      return i18n._(fieldLabels["controls.language.french"]);
    case "it":
      return i18n._(fieldLabels["controls.language.italian"]);
    default:
      return field;
  }
}

// Colors
export const getPalette = (palette?: string): ReadonlyArray<string> => {
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

export const getSingleHueSequentialPalette = ({
  nbClass = 5,
  palette,
}: {
  nbClass: number;
  palette?: DivergingPaletteType | SequentialPaletteType;
}): ReadonlyArray<string> => {
  switch (palette) {
    case "BrBG":
      return schemeBrBG[nbClass];
    case "PRGn":
      return schemePiYG[nbClass];
    case "PiYG":
      return schemePiYG[nbClass];
    case "PuOr":
      return schemePuOr[nbClass];
    case "blues":
      return schemeBlues[nbClass];
    case "greens":
      return schemeGreens[nbClass];
    case "greys":
      return schemeGreys[nbClass];
    case "oranges":
      return schemeOranges[nbClass];
    case "purples":
      return schemePurples[nbClass];
    case "reds":
      return schemeReds[nbClass];

    default:
      return schemeOranges[nbClass];
  }
};

export const categoricalPalettes: Array<{
  label: string;
  value: string;
  colors: ReadonlyArray<string>;
}> = [
  {
    label: "category10",
    value: "category10",
    colors: getPalette("category10"),
  },
  { label: "accent", value: "accent", colors: getPalette("accent") },
  { label: "dark2", value: "dark2", colors: getPalette("dark2") },
  { label: "paired", value: "paired", colors: getPalette("paired") },
  { label: "pastel1", value: "pastel1", colors: getPalette("pastel1") },
  { label: "pastel2", value: "pastel2", colors: getPalette("pastel2") },
  { label: "set1", value: "set1", colors: getPalette("set1") },
  { label: "set2", value: "set2", colors: getPalette("set2") },
  { label: "set3", value: "set3", colors: getPalette("set3") },
];

export const getDefaultCategoricalPalette = () => categoricalPalettes[0];

type Palette<T> = {
  label: string;
  value: T;
  interpolator: (t: number) => string;
};

type SteppedPalette<T> = Omit<Palette<T>, "interpolator"> & {
  colors: ReadonlyArray<string>;
};

const steppedPaletteSteps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

const divergingPaletteKeys = [
  "BrBG",
  "PRGn",
  "PiYG",
  "PuOr",
] as DivergingPaletteType[];

const sequentialPaletteKeys = [
  "blues",
  "greens",
  "greys",
  "oranges",
  "purples",
  "reds",
] as SequentialPaletteType[];

const interpolatorByName = {
  BrBG: interpolateBrBG,
  PRGn: interpolatePRGn,
  PiYG: interpolatePiYG,
  PuOr: interpolatePuOr,
  blues: interpolateBlues,
  greens: interpolateGreens,
  greys: interpolateGreys,
  oranges: interpolateOranges,
  purples: interpolatePurples,
  reds: interpolateReds,
};
const defaultInterpolator = interpolatorByName["oranges"];

export const getColorInterpolator = (
  palette?: SequentialPaletteType | DivergingPaletteType
): ((t: number) => string) => {
  const interpolator = interpolatorByName[palette!] ?? defaultInterpolator;
  // If the palette is sequential, we artificially clamp the value not to display too
  // white a value
  const isSequential = palette
    ? // @ts-ignore
      sequentialPaletteKeys.includes(palette)
    : false;
  return isSequential
    ? (n: number) => interpolator(n * 0.8 + 0.2)
    : interpolator;
};

export const divergingPalettes = divergingPaletteKeys.map((d) => ({
  label: d,
  value: d,
  interpolator: getColorInterpolator(d),
})) as Palette<DivergingPaletteType>[];

export const divergingSteppedPalettes = divergingPaletteKeys.map((d) => ({
  label: d,
  value: d,
  colors: steppedPaletteSteps.map((s) => getColorInterpolator(d)(s)),
})) as SteppedPalette<DivergingPaletteType>[];

export const getDefaultDivergingSteppedPalette = () =>
  divergingSteppedPalettes[0];

export const sequentialPalettes = sequentialPaletteKeys.map((d) => ({
  label: d,
  value: d,
  interpolator: getColorInterpolator(d),
})) as Palette<SequentialPaletteType>[];

export const sequentialSteppedPalettes = sequentialPaletteKeys.map((d) => ({
  label: d,
  value: d,
  colors: steppedPaletteSteps.map((s) => getColorInterpolator(d)(s)),
})) as SteppedPalette<SequentialPaletteType>[];

export const randomComparator = () => (Math.random() > 0.5 ? 1 : -1);

export const mapValueIrisToColor = ({
  palette,
  dimensionValues,
  random,
}: {
  palette: string;
  dimensionValues: DimensionMetadataFragment["values"];
  random?: boolean;
}) => {
  if (!dimensionValues) {
    return {};
  }
  const paletteValues = getPalette(palette);
  const colorScale = scaleOrdinal()
    .domain(dimensionValues.map((dv) => dv.value))
    .range(random ? [...paletteValues].sort(randomComparator) : paletteValues);
  const colorMapping = {} as { [x: string]: string };

  dimensionValues.forEach((dv) => {
    colorMapping[`${dv.value}` as string] = colorScale(dv.value) as string;
  });
  return colorMapping;
};

export const getOrderedTableColumns = (fields: TableFields): TableColumn[] => {
  return Object.values(fields).sort((a, b) => ascending(a.index, b.index));
};

export const useOrderedTableColumns = (fields: TableFields): TableColumn[] => {
  return useMemo(() => {
    return getOrderedTableColumns(fields);
  }, [fields]);
};

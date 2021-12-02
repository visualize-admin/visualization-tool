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
  schemeCategory10,
  schemeDark2,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemePurples,
  schemeReds,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
  timeDay,
  timeHour,
  timeMinute,
  timeMonth,
  timeSecond,
  timeWeek,
  timeYear,
} from "d3";
import { TimeLocaleObject, timeParse } from "d3-time-format";
import { memoize } from "lodash";
import { useMemo } from "react";
import { DimensionFieldsFragment, TimeUnit } from "../../graphql/query-hooks";
import { IconName } from "../../icons";
import {
  getD3FormatLocale,
  getD3TimeFormatLocale,
} from "../../locales/locales";
import { useLocale } from "../../locales/use-locale";
import { TableColumn, TableFields } from "../config-types";

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

export const isNumber = (x: $IntentionalAny): boolean =>
  typeof x === "number" && !isNaN(x);
export const mkNumber = (x: $IntentionalAny): number => +x;

const getFormattersForLocale = memoize((locale) => {
  const { format } = getD3TimeFormatLocale(locale);
  return {
    empty: () => "-",
    second: format("%d.%m.%Y %H:%M:%S"),
    minute: format("%d.%m.%Y %H:%M"),
    hour: format("%d.%m.%Y %H:%M"),
    day: format("%d.%m.%Y"),
    month: format("%d.%m.%Y"),
    year: format("%Y"),
  };
});

const useLocalFormatters = () => {
  const locale = useLocale();
  return getFormattersForLocale(locale);
};

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
  [TimeUnit.Month, "%d.%m.%Y"],
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

// export const formatNumber = (x: number): string => format(",.2~f")(x);

export const useFormatNumber = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = getD3FormatLocale(locale);
    const formatter = format(",.2~f");
    return (x: NumberValue | null | undefined) => {
      if (x === null || x === undefined) {
        return "–";
      }
      return formatter(x);
    };
  }, [locale]);
  return formatter;
};
export const useFormatInteger = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = getD3FormatLocale(locale);
    const formatter = format(",.0~f");
    return (x: NumberValue | null | undefined) => {
      if (x === null || x === undefined) {
        return "–";
      }
      return formatter(x);
    };
  }, [locale]);
  return formatter;
};

export const getIconName = (name: string): IconName => {
  switch (name) {
    case "x":
      return "xAxis";
    case "y":
      return "yAxis";
    case "segment":
      return "segments";
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
    case "area.stacked.byDimensionLabel.asc":
    case "pie..byDimensionLabel.asc":
    case "sorting.byDimensionLabel.asc":
      return i18n._(fieldLabels["controls.sorting.byDimensionLabel.ascending"]);
    case "bar.stacked.byDimensionLabel.desc":
    case "bar.grouped.byDimensionLabel.desc":
    case "column..byDimensionLabel.desc":
    case "column.stacked.byDimensionLabel.desc":
    case "column.grouped.byDimensionLabel.desc":
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
    case "area.stacked.byTotalSize.asc":
    case "column.stacked.byTotalSize.asc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.largestTop"]);
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
  palette?: string;
}): ReadonlyArray<string> => {
  switch (palette) {
    case "blues":
      return schemeBlues[nbClass];
    case "greens":
      return schemeGreens[nbClass];
    case "oranges":
      return schemeOranges[nbClass];
    case "greys":
      return schemeGreys[nbClass];
    case "reds":
      return schemeReds[nbClass];
    case "purples":
      return schemePurples[nbClass];

    default:
      return schemeOranges[nbClass];
  }
};
export const getColorInterpolator = (
  palette?: string
): ((t: number) => string) => {
  switch (palette) {
    case "BrBG":
      return interpolateBrBG;
    case "PRGn":
      return interpolatePRGn;
    case "PiYG":
      return interpolatePiYG;
    case "PuOr":
      return interpolatePuOr;
    case "blues":
      return interpolateBlues;
    case "greens":
      return interpolateGreens;
    case "greys":
      return interpolateGreys;
    case "oranges":
      return interpolateOranges;
    case "purples":
      return interpolatePurples;
    case "reds":
      return interpolateReds;

    default:
      return interpolateOranges;
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

const sequentialPaletteSteps = [
  0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
];
// Diverging color palettes
export const sequentialPalettes: Array<{
  label: string;
  value: string;
  colors: ReadonlyArray<string>;
}> = [
  {
    label: "BrBG",
    value: "BrBG",
    colors: sequentialPaletteSteps.map((d) => getColorInterpolator("BrBG")(d)),
  },
  {
    label: "PRGn",
    value: "PRGn",
    colors: sequentialPaletteSteps.map((d) => getColorInterpolator("PRGn")(d)),
  },
  {
    label: "PiYG",
    value: "PiYG",
    colors: sequentialPaletteSteps.map((d) => getColorInterpolator("PiYG")(d)),
  },
  {
    label: "PuOr",
    value: "PuOr",
    colors: sequentialPaletteSteps.map((d) => getColorInterpolator("PuOr")(d)),
  },
];

export const getDefaultSequentialPalette = () => sequentialPalettes[0];

export const mapColorsToComponentValuesIris = ({
  palette,
  component,
}: {
  palette: string;
  component: DimensionFieldsFragment;
}) => {
  if (!("values" in component)) {
    return {};
  }

  const colorScale = scaleOrdinal()
    .domain(component.values.map((dv) => dv.value))
    .range(getPalette(palette));
  const colorMapping = {} as { [x: string]: string };

  component.values.forEach((dv) => {
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

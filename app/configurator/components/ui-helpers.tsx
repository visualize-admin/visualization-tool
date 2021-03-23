import { Trans } from "@lingui/macro";
import {
  timeDay,
  timeHour,
  timeMinute,
  timeMonth,
  timeYear,
  scaleOrdinal,
  ascending,
  schemeBlues,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemePurples,
  schemeReds,
  interpolateBrBG,
  interpolatePiYG,
  interpolatePRGn,
  interpolatePuOr,
  interpolateBlues,
  interpolateGreens,
  interpolateOranges,
  interpolatePurples,
  interpolateGreys,
  interpolateReds,
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
} from "d3";

import { timeParse } from "d3-time-format";
import { ReactNode, useMemo } from "react";
import {
  ComponentFieldsFragment,
  DimensionFieldsWithValuesFragment,
} from "../../graphql/query-hooks";
import { IconName } from "../../icons";
import {
  getD3FormatLocale,
  getD3TimeFormatLocale,
} from "../../locales/locales";
import { useLocale } from "../../locales/use-locale";
import { TableColumn, TableFields } from "../config-types";

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
    const { format } = getD3TimeFormatLocale(locale);

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
    const { format } = getD3TimeFormatLocale(locale);

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
    const { format } = getD3FormatLocale(locale);
    return format(",.2~f");
  }, [locale]);
  return formatter;
};
export const useFormatInteger = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = getD3FormatLocale(locale);
    return format(",.0~f");
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

export const getFieldLabel = (field: string): ReactNode => {
  switch (field) {
    // Visual encodings (left column)
    case "column.x":
    case "line.x":
    case "area.x":
    case "pie.x":
    case "x":
      return <Trans id="controls.axis.horizontal">Horizontal axis</Trans>;
    case "bar.x":
    case "scatterplot.x":
    case "scatterplot.y":
    case "column.y":
    case "line.y":
    case "area.y":
    case "pie.y":
    case "y":
      return <Trans id="controls.measure">Measure</Trans>;
    case "bar.y":
      return <Trans id="controls.axis.vertical">Vertical axis</Trans>;
    case "bar.segment":
    case "column.segment":
    case "line.segment":
    case "area.segment":
    case "scatterplot.segment":
    case "pie.segment":
    case "segment":
      return <Trans id="controls.color">Color</Trans>;
    case "title":
      return <Trans id="controls.title">Title</Trans>;
    case "description":
      return <Trans id="controls.description">Description</Trans>;

    // Encoding Options  (right column)
    case "stacked":
      return <Trans id="controls.column.stacked">Stacked</Trans>;
    case "grouped":
      return <Trans id="controls.column.grouped">Grouped</Trans>;
    case "sortBy":
      return <Trans id="controls.sorting.sortBy">Sort by</Trans>;

    case "bar.stacked.byDimensionLabel.asc":
    case "bar.grouped.byDimensionLabel.asc":
    case "column..byDimensionLabel.asc":
    case "column.stacked.byDimensionLabel.asc":
    case "column.grouped.byDimensionLabel.asc":
    case "area.stacked.byDimensionLabel.asc":
    case "pie..byDimensionLabel.asc":
    case "sorting.byDimensionLabel.asc":
      return (
        <Trans id="controls.sorting.byDimensionLabel.ascending">A → Z</Trans>
      );
    case "bar.stacked.byDimensionLabel.desc":
    case "bar.grouped.byDimensionLabel.desc":
    case "column..byDimensionLabel.desc":
    case "column.stacked.byDimensionLabel.desc":
    case "column.grouped.byDimensionLabel.desc":
    case "area.stacked.byDimensionLabel.desc":
    case "pie..byDimensionLabel.desc":
    case "sorting.byDimensionLabel.desc":
      return (
        <Trans id="controls.sorting.byDimensionLabel.descending">Z → A</Trans>
      );
    case "bar.stacked.byTotalSize.desc":
    case "bar.grouped.byTotalSize.desc":
    case "column.grouped.byTotalSize.asc":
      return (
        <Trans id="controls.sorting.byTotalSize.ascending">Largest last</Trans>
      );
    case "column.grouped.byTotalSize.desc":
    case "bar.stacked.byTotalSize.asc":
    case "bar.grouped.byTotalSize.asc":
      return (
        <Trans id="controls.sorting.byTotalSize.largestFirst">
          Largest first
        </Trans>
      );
    case "area.stacked.byTotalSize.asc":
    case "column.stacked.byTotalSize.asc":
      return (
        <Trans id="controls.sorting.byTotalSize.largestTop">Largest top</Trans>
      );
    case "area.stacked.byTotalSize.desc":
    case "column.stacked.byTotalSize.desc":
      return (
        <Trans id="controls.sorting.byTotalSize.largestBottom">
          Largest bottom
        </Trans>
      );
    case "column..byMeasure.asc":
    case "column.stacked.byMeasure.asc":
    case "column.grouped.byMeasure.asc":
    case "pie..byMeasure.asc":
    case "sorting.byMeasure.asc":
      return <Trans id="controls.sorting.byMeasure.ascending">1 → 9</Trans>;
    case "column..byMeasure.desc":
    case "column.stacked.byMeasure.desc":
    case "column.grouped.byMeasure.desc":
    case "pie..byMeasure.desc":
    case "sorting.byMeasure.desc":
      return <Trans id="controls.sorting.byMeasure.descending">9 → 1</Trans>;

    // Chart Types
    case "column":
      return <Trans id="controls.chart.type.column">Columns</Trans>;
    case "bar":
      return <Trans id="controls.chart.type.bar">Bars</Trans>;
    case "line":
      return <Trans id="controls.chart.type.line">Lines</Trans>;
    case "area":
      return <Trans id="controls.chart.type.area">Areas</Trans>;
    case "scatterplot":
      return <Trans id="controls.chart.type.scatterplot">Scatterplot</Trans>;
    case "pie":
      return <Trans id="controls.chart.type.pie">Pie</Trans>;
    case "table":
      return <Trans id="controls.chart.type.table">Table</Trans>;
    case "map":
      return <Trans id="controls.chart.type.map">Map</Trans>;

    // Languages
    case "en":
      return <Trans id="controls.language.english">English</Trans>;
    case "de":
      return <Trans id="controls.language.german">German</Trans>;
    case "fr":
      return <Trans id="controls.language.french">French</Trans>;
    case "it":
      return <Trans id="controls.language.italian">Italian</Trans>;
    default:
      return field;
  }
};

export const getFieldLabelHint = {
  x: <Trans id="controls.select.dimension">Select a dimension</Trans>,
  y: <Trans id="controls.select.measure">Select a measure</Trans>,
  segment: <Trans id="controls.select.dimension">Select a dimension</Trans>,
};

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
  0,
  0.1,
  0.2,
  0.3,
  0.4,
  0.5,
  0.6,
  0.7,
  0.8,
  0.9,
  1,
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
  component: DimensionFieldsWithValuesFragment | ComponentFieldsFragment;
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

import { Trans } from "@lingui/macro";
import { format } from "d3-format";
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
} from "d3-scale-chromatic";
import {
  timeDay,
  timeHour,
  timeMinute,
  timeMonth,
  timeWeek,
  timeYear,
} from "d3-time";
import { timeFormat, timeParse } from "d3-time-format";
import * as React from "react";
import { DimensionFieldsWithValuesFragment } from "../graphql/query-hooks";
import { IconName } from "../icons";
import { useLocale } from "../lib/use-locale";
import {
  d3TimeFormatLocales,
  Locales,
  d3FormatLocales,
} from "../locales/locales";

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
  const formatter = React.useMemo(() => {
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
  const formatter = React.useMemo(() => {
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
  const formatter = React.useMemo(() => {
    const { format } = d3FormatLocales[locale];
    return format(",.2~f");
  }, [locale]);
  return formatter;
};

export const getIconName = (name: string): IconName => {
  switch (name) {
    case "x":
      return "x";
    case "y":
      return "y";
    case "segment":
      return "segment";
    case "table":
      return "table";
    case "filter":
      return "filter";
    case "column":
      return "column";
    case "bar":
      return "bar";
    case "line":
      return "line";
    case "area":
      return "area";
    case "scatterplot":
      return "scatterplot";
    case "pie":
      return "pie";
    default:
      return "table";
  }
};

export const getFieldLabel = (field: string): string | React.ReactNode => {
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
      return <Trans id="controls.partition">Partition</Trans>;
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

    case "column..byDimensionLabel.asc":
    case "column.stacked.byDimensionLabel.asc":
    case "column.grouped.byDimensionLabel.asc":
    case "area.stacked.byDimensionLabel.asc":
    case "pie..byDimensionLabel.asc":
      return (
        <Trans id="controls.sorting.byDimensionLabel.ascending">A → Z</Trans>
      );
    case "column..byDimensionLabel.desc":
    case "column.stacked.byDimensionLabel.desc":
    case "column.grouped.byDimensionLabel.desc":
    case "area.stacked.byDimensionLabel.desc":
    case "pie..byDimensionLabel.desc":
      return (
        <Trans id="controls.sorting.byDimensionLabel.descending">Z → A</Trans>
      );
    case "column.grouped.byTotalSize.asc":
      return (
        <Trans id="controls.sorting.byTotalSize.ascending">Largest last</Trans>
      );
    case "column.grouped.byTotalSize.desc":
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
      return <Trans id="controls.sorting.byMeasure.ascending">1 → 9</Trans>;
    case "column..byMeasure.desc":
    case "column.stacked.byMeasure.desc":
    case "column.grouped.byMeasure.desc":
    case "pie..byMeasure.desc":
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
export const getPalette = (
  palette: string | undefined
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

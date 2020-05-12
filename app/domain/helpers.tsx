import { Trans } from "@lingui/macro";
import { format } from "d3-format";
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
import { IconName } from "../icons";

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

// const formatLocale = d3TimeFormatLocales[locale];

export const formatDate = timeFormat("%B %d, %Y");

const formatSecond = timeFormat(":%S");
const formatMinute = timeFormat("%I:%M");
const formatHour = timeFormat("%I %p");
const formatDay = timeFormat("%a %d");
const formatWeek = timeFormat("%b %d");
const formatMonth = timeFormat("%B");
const formatYear = timeFormat("%Y");

export const formatDateAuto = (date: Date) => {
  return (timeMinute(date) < date
    ? formatSecond
    : timeHour(date) < date
    ? formatMinute
    : timeDay(date) < date
    ? formatHour
    : timeMonth(date) < date
    ? timeWeek(date) < date
      ? formatDay
      : formatWeek
    : timeYear(date) < date
    ? formatMonth
    : formatYear)(date);
};

export const formatNumber = (x: number): string => format(",.2~f")(x);

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
    case "x":
      return <Trans id="controls.axis.horizontal">Horizontal axis</Trans>;
    case "y":
      return <Trans id="controls.measure">Measure</Trans>;
    case "segment":
      return <Trans id="controls.partition">Partition</Trans>;
    case "title":
      return <Trans id="controls.title">Title</Trans>;
    case "description":
      return <Trans id="controls.description">Description</Trans>;
    case "stacked":
      return <Trans id="controls.column.stacked">Stacked</Trans>;
    case "grouped":
      return <Trans id="controls.column.grouped">Grouped</Trans>;

    case "byDimensionLabel.asc":
      return (
        <Trans id="controls.sorting.byDimensionLabel.ascending">A → Z</Trans>
      );
    case "byDimensionLabel.desc":
      return (
        <Trans id="controls.sorting.byDimensionLabel.descending">Z → A</Trans>
      );
    case "byTotalSize.asc":
      return (
        <Trans id="controls.sorting.byTotalSize.ascending">Largest Top</Trans>
      );
    case "byTotalSize.desc":
      return (
        <Trans id="controls.sorting.byTotalSize.descending">
          Largest Bottom
        </Trans>
      );
    case "byMeasure.asc":
      return <Trans id="controls.sorting.byMeasure.ascending">1 → 9</Trans>;
    case "byMeasure.desc":
      return <Trans id="controls.sorting.byMeasure.descending">9 → 1</Trans>;
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

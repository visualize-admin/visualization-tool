import {
  ascending,
  CountableTimeInterval,
  scaleOrdinal,
  TimeLocaleObject,
  timeParse,
} from "d3";
import { useMemo } from "react";

import type { BaseChartProps } from "@/charts/shared/ChartProps";
import { getTimeInterval } from "@/intervals";

import { TableColumn, TableFields } from "../../config-types";
import {
  Component,
  Dimension,
  DimensionValue,
  Measure,
  Observation,
} from "../../domain/data";
import { TimeUnit } from "../../graphql/query-hooks";
import { IconName } from "../../icons";
import { getPalette } from "../../palettes";

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

export const getErrorMeasure = (
  { dimensions, measures }: Pick<BaseChartProps, "dimensions" | "measures">,
  valueIri: string
) => {
  return [...dimensions, ...measures].find((m) => {
    return m.related?.some(
      (r) => r.type === "StandardError" && r.iri === valueIri
    );
  });
};

export const useErrorMeasure = (
  componentIri: string,
  {
    dimensions,
    measures,
  }: {
    dimensions: Dimension[];
    measures: Measure[];
  }
) => {
  return useMemo(() => {
    return getErrorMeasure({ dimensions, measures }, componentIri);
  }, [componentIri, dimensions, measures]);
};

export const useErrorVariable = (errorMeasure?: Component) => {
  return useMemo(() => {
    return errorMeasure
      ? (d: Observation) => {
          return d[errorMeasure.iri];
        }
      : null;
  }, [errorMeasure]);
};

export const useErrorRange = (
  errorMeasure: Component | undefined,
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
    case "comboLineSingle":
      return "chartMultiLine";
    case "comboLineDual":
      return "chartDualAxisLine";
    case "comboLineColumn":
      return "chartColumnLine";
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
    case "animation":
      return "animation";
    case "layoutSingleURLs":
      return "layoutSingleURLs";
    case "layoutTab":
      return "layoutTab";
    case "layoutDashboard":
      return "layoutDashboard";
    case "layoutTall":
      return "layoutTall";
    case "layoutVertical":
      return "layoutVertical";

    default:
      return "table";
  }
};

export const randomComparator = () => (Math.random() > 0.5 ? 1 : -1);

export const mapValueIrisToColor = ({
  palette,
  dimensionValues,
  random,
}: {
  palette: string;
  dimensionValues: DimensionValue[];
  random?: boolean;
}) => {
  if (!dimensionValues) {
    return {};
  }

  const paletteValues = getPalette(palette);
  const colors = dimensionValues.map(
    (d, i) =>
      (palette === "dimension" && d.color) ||
      paletteValues[i % paletteValues.length]
  );
  const colorScale = scaleOrdinal<string, string>()
    .domain(dimensionValues.map((d) => `${d.value}`))
    .range(random ? [...colors].sort(randomComparator) : colors);
  const colorMapping = {} as { [k: string]: string };
  dimensionValues.forEach((d) => {
    colorMapping[`${d.value}`] = colorScale(`${d.value}`);
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

export const canUseAbbreviations = (d?: Component): boolean => {
  if (!d) {
    return false;
  }

  switch (d.__typename) {
    case "GeoCoordinatesDimension":
    case "GeoShapesDimension":
    case "NominalDimension":
    case "OrdinalDimension":
    case "OrdinalMeasure":
      break;
    default:
      return false;
  }

  return !!d.values.find((d) => d.alternateName);
};

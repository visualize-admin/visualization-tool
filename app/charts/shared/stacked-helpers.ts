import { group, sum } from "d3-array";
import { NumberValue, ScaleLinear, scaleLinear } from "d3-scale";
import { Series } from "d3-shape";

import {
  NumericalValueGetter,
  StringValueGetter,
} from "@/charts/shared/chart-state";
import { NumericalMeasure, Observation } from "@/domain/data";
import { formatNumberWithUnit } from "@/formatters";

const NORMALIZED_VALUE_DOMAIN = [0, 100];

export const getStackedYScale = (
  data: Observation[],
  {
    normalize,
    getX,
    getY,
    getTime,
    minLimitValue,
    maxLimitValue,
    customDomain,
  }: {
    normalize: boolean;
    getX: StringValueGetter;
    getY: NumericalValueGetter;
    getTime?: StringValueGetter;
    minLimitValue?: number;
    maxLimitValue?: number;
    customDomain?: [number, number];
  }
): ScaleLinear<number, number> => {
  const yScale = scaleLinear();

  if (normalize) {
    // We don't allow overwriting of 100% mode.
    yScale.domain(NORMALIZED_VALUE_DOMAIN);
  } else {
    if (customDomain) {
      return yScale.domain(customDomain);
    }

    const grouped = group(data, (d) => getX(d) + getTime?.(d));
    let yMin = 0;
    let yMax = 0;

    for (const [, v] of grouped) {
      const values = v.map(getY).filter((d) => d !== null) as number[];
      const newYMin = sum(values.filter((d) => d < 0));
      const newYMax = sum(values.filter((d) => d >= 0));

      if (yMin === undefined || newYMin < yMin) {
        yMin = newYMin;
      }

      if (yMax === undefined || newYMax > yMax) {
        yMax = newYMax;
      }
    }

    yScale
      .domain([
        minLimitValue !== undefined ? Math.min(minLimitValue, yMin) : yMin,
        maxLimitValue !== undefined ? Math.max(maxLimitValue, yMax) : yMax,
      ])
      .nice();
  }

  return yScale;
};

export const getStackedXScale = (
  data: Observation[],
  {
    normalize,
    getX,
    getY,
    getTime,
    customDomain,
  }: {
    normalize: boolean;
    getY: StringValueGetter;
    getX: NumericalValueGetter;
    getTime?: StringValueGetter;
    customDomain?: [number, number];
  }
): ScaleLinear<number, number> => {
  const xScale = scaleLinear();

  if (normalize) {
    // We don't allow overwriting of 100% mode.
    xScale.domain(NORMALIZED_VALUE_DOMAIN);
  } else {
    if (customDomain) {
      return xScale.domain(customDomain);
    }

    const grouped = group(data, (d) => getY(d) + getTime?.(d));
    let xMin = 0;
    let xMax = 0;

    for (const [, v] of grouped) {
      const values = v.map(getX).filter((d) => d !== null) as number[];
      const newXMin = sum(values.filter((d) => d < 0));
      const newXMax = sum(values.filter((d) => d >= 0));

      if (xMin === undefined || newXMin < xMin) {
        xMin = newXMin;
      }

      if (xMax === undefined || newXMax > xMax) {
        xMax = newXMax;
      }
    }

    xScale.domain([xMin, xMax]).nice();
  }

  return xScale;
};

export const getStackedTooltipValueFormatter = ({
  normalize,
  measureId,
  measureUnit,
  formatters,
  formatNumber,
}: {
  normalize: boolean;
  measureId: string;
  measureUnit: NumericalMeasure["unit"];
  formatters: { [k: string]: (s: any) => string };
  formatNumber: (d: NumberValue | null | undefined) => string;
}) => {
  return (d: number | null, dIdentity: number | null) => {
    if (d === null && dIdentity === null) {
      return "-";
    }

    const format = formatters[measureId] ?? formatNumber;

    if (normalize) {
      const rounded = Math.round(d as number);
      const fValue = formatNumberWithUnit(dIdentity, format, measureUnit);

      return `${rounded}% (${fValue})`;
    }

    return formatNumberWithUnit(d, format, measureUnit);
  };
};

export const getStackedPosition = <T extends { [key: string]: any }>({
  observation,
  series,
  key,
  getAxisValue,
  measureScale,
  fallbackMeasureValue,
  segment,
}: {
  observation: Observation;
  series: Series<T, string>[];
  key: string;
  getAxisValue: (d: Observation) => string;
  measureScale: ScaleLinear<number, number>;
  fallbackMeasureValue: number;
  segment: string;
}) => {
  const axisValue = getAxisValue(observation);
  const segmentSeries = series.find((s) => s.key === segment);
  const seriesPoint = segmentSeries?.find((s) => s.data[key] === axisValue);

  if (!seriesPoint) {
    return fallbackMeasureValue;
  }

  const [y0, y1] = seriesPoint;

  return measureScale(series.length === 1 ? y1 : (y0 + y1) * 0.5);
};

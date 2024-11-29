import { group, sum } from "d3-array";
import { NumberValue, ScaleLinear, scaleLinear } from "d3-scale";

import {
  NumericalValueGetter,
  StringValueGetter,
} from "@/charts/shared/chart-state";
import { NumericalMeasure, Observation } from "@/domain/data";
import { formatNumberWithUnit } from "@/formatters";

const NORMALIZED_Y_DOMAIN = [0, 100];
const NORMALIZED_X_DOMAIN = [0, 100];

export const getStackedYScale = (
  data: Observation[],
  options: {
    normalize: boolean;
    getX: StringValueGetter;
    getY: NumericalValueGetter;
    getTime?: StringValueGetter;
  }
): ScaleLinear<number, number> => {
  const { normalize, getX, getY, getTime } = options;
  const yScale = scaleLinear();

  if (normalize) {
    yScale.domain(NORMALIZED_Y_DOMAIN);
  } else {
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

    yScale.domain([yMin, yMax]).nice();
  }

  return yScale;
};

export const getStackedXScale = (
  data: Observation[],
  options: {
    normalize: boolean;
    getY: StringValueGetter;
    getX: NumericalValueGetter;
    getTime?: StringValueGetter;
  }
): ScaleLinear<number, number> => {
  const { normalize, getX, getY, getTime } = options;
  const xScale = scaleLinear();

  if (normalize) {
    xScale.domain(NORMALIZED_X_DOMAIN);
  } else {
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
  yMeasureId,
  yMeasureUnit,
  formatters,
  formatNumber,
}: {
  normalize: boolean;
  yMeasureId: string;
  yMeasureUnit: NumericalMeasure["unit"];
  formatters: { [k: string]: (s: any) => string };
  formatNumber: (d: NumberValue | null | undefined) => string;
}) => {
  return (d: number | null, dIdentity: number | null) => {
    if (d === null && dIdentity === null) {
      return "-";
    }

    const format = formatters[yMeasureId] ?? formatNumber;

    if (normalize) {
      const rounded = Math.round(d as number);
      const fValue = formatNumberWithUnit(dIdentity, format, yMeasureUnit);

      return `${rounded}% (${fValue})`;
    }

    return formatNumberWithUnit(d, format, yMeasureUnit);
  };
};

export const getStackedTooltipValueFormatterInverted = ({
  normalize,
  xMeasureId,
  xMeasureUnit,
  formatters,
  formatNumber,
}: {
  normalize: boolean;
  xMeasureId: string;
  xMeasureUnit: NumericalMeasure["unit"];
  formatters: { [k: string]: (s: any) => string };
  formatNumber: (d: NumberValue | null | undefined) => string;
}) => {
  return (d: number | null, dIdentity: number | null) => {
    if (d === null && dIdentity === null) {
      return "-";
    }

    const format = formatters[xMeasureId] ?? formatNumber;

    if (normalize) {
      const rounded = Math.round(d as number);
      const fValue = formatNumberWithUnit(dIdentity, format, xMeasureUnit);

      return `${rounded}% (${fValue})`;
    }

    return formatNumberWithUnit(d, format, xMeasureUnit);
  };
};

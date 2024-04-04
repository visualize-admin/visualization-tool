import { group, sum } from "d3-array";
import { NumberValue, ScaleLinear, scaleLinear } from "d3-scale";

import {
  NumericalValueGetter,
  StringValueGetter,
} from "@/charts/shared/chart-state";
import { Observation } from "@/domain/data";
import { formatNumberWithUnit } from "@/formatters";
import { NumericalMeasure } from "@/graphql/resolver-types";

const NORMALIZED_Y_DOMAIN = [0, 100];

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

type StackedTooltipValueFormattersProps = {
  normalize: boolean;
  yMeasureIri: string;
  yMeasureUnit: NumericalMeasure["unit"];
  formatters: { [k: string]: (s: any) => string };
  formatNumber: (d: NumberValue | null | undefined) => string;
};

export const getStackedTooltipValueFormatter = (
  props: StackedTooltipValueFormattersProps
) => {
  const { normalize, yMeasureIri, yMeasureUnit, formatters, formatNumber } =
    props;

  return (d: number | null, dIdentity: number | null) => {
    if (d === null && dIdentity === null) {
      return "-";
    }

    const format = formatters[yMeasureIri] ?? formatNumber;

    if (normalize) {
      const rounded = Math.round(d as number);
      const fValue = formatNumberWithUnit(dIdentity, format, yMeasureUnit);

      return `${rounded}% (${fValue})`;
    }

    return formatNumberWithUnit(d, format, yMeasureUnit);
  };
};

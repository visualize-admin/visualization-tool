import { useMemo } from "react";

import {
  NumericalValueGetter,
  StringValueGetter,
  TemporalValueGetter,
} from "@/charts/shared/chart-state";
import { HorizontalChartState } from "@/charts/shared/limits/horizontal";
import {
  Limits,
  RenderLimitDatum,
} from "@/charts/shared/limits/rendering-utils";
import { VerticalChartState } from "@/charts/shared/limits/vertical";
import { useLimits } from "@/config-utils";
import { Limit } from "@/rdf/limits";

export const createLimitsComponent = <
  T extends VerticalChartState | HorizontalChartState,
>({
  isHorizontal,
  getChartState,
}: {
  isHorizontal: boolean;
  getChartState: () => T;
}) => {
  const Component = ({
    axisDimension,
    limits,
  }: ReturnType<typeof useLimits>) => {
    const {
      bounds: { margins, chartWidth, chartHeight },
      xScale,
      yScale,
      getX,
      getY,
    } = getChartState();

    const getAxisValue = isHorizontal ? getY : getX;
    const axisDimensionScale = isHorizontal ? yScale : xScale;
    const measureScale = isHorizontal ? xScale : yScale;
    const chartSize = isHorizontal ? chartHeight : chartWidth;

    const renderData: RenderLimitDatum[] = useMemo(() => {
      if (!limits.length) {
        return [];
      }

      const isBandScale = "bandwidth" in axisDimensionScale;
      const limitSize = isBandScale ? axisDimensionScale.bandwidth() : 15;

      return limits.flatMap(
        ({ configLimit, measureLimit, relatedAxisDimensionValueLabel }) => {
          const observationKey = axisDimension?.id ?? "";
          const observationLabel = relatedAxisDimensionValueLabel ?? "";
          const { axis1Value, axis2Value, measure1Value, measure2Value } =
            getLimitValues({
              measureLimit,
              getAxisValue,
              observationKey,
              observationLabel,
              axisDimensionId: axisDimension?.id,
            });
          const axis1 = axisDimensionScale(axis1Value);
          const axis2 = axisDimensionScale(axis2Value);
          const measure1 = measureScale(measure1Value);
          const measure2 = measureScale(measure2Value);
          const key = configLimit.related
            .map((d) => d.dimensionId + d.value)
            .join();
          const size =
            axis1 === undefined
              ? chartSize
              : measureLimit.type === "time-range"
                ? 0
                : limitSize;
          const axisOffset = isBandScale ? size / 2 : 0;
          const hasValidAxis = axis1 !== undefined && axis2 !== undefined;
          const hasNoAxis = relatedAxisDimensionValueLabel === undefined;
          let x1, x2, y1, y2;

          if (isHorizontal) {
            y1 = axis1 ? axis1 + axisOffset : 0;
            y2 = axis2 ? axis2 + axisOffset : chartSize;
            x1 = measure1;
            x2 = measure2;
          } else {
            x1 = axis1 ? axis1 + axisOffset : 0;
            x2 = axis2 ? axis2 + axisOffset : chartSize;
            y1 = measure1;
            y2 = measure2;
          }

          const datum = {
            key,
            x1,
            x2,
            y1,
            y2,
            size,
            fill: configLimit.color,
            lineType: configLimit.lineType,
            symbolType: configLimit.symbolType,
          } as RenderLimitDatum;

          return hasValidAxis || hasNoAxis ? [datum] : [];
        }
      );
    }, [
      limits,
      axisDimension?.id,
      getAxisValue,
      axisDimensionScale,
      measureScale,
      chartSize,
    ]);

    return (
      <Limits
        renderData={renderData}
        margins={margins}
        isHorizontal={isHorizontal}
      />
    );
  };

  Component.displayName = isHorizontal
    ? "HorizontalLimitsInner"
    : "VerticalLimitsInner";

  return Component;
};

const getLimitValues = ({
  measureLimit,
  getAxisValue,
  observationKey,
  observationLabel,
  axisDimensionId,
}: {
  measureLimit: Limit;
  getAxisValue: NumericalValueGetter | StringValueGetter | TemporalValueGetter;
  observationKey: string;
  observationLabel: string;
  axisDimensionId?: string;
}) => {
  let axis1Value: $IntentionalAny;
  let axis2Value: $IntentionalAny;
  let measure1Value: $IntentionalAny;
  let measure2Value: $IntentionalAny;

  switch (measureLimit.type) {
    case "single": {
      axis1Value = axis2Value = getAxisValue({
        [observationKey]: observationLabel,
      });
      measure1Value = measure2Value = measureLimit.value;
      break;
    }
    case "value-range": {
      axis1Value = axis2Value = getAxisValue({
        [observationKey]: observationLabel,
      });
      measure1Value = measureLimit.min;
      measure2Value = measureLimit.max;
      break;
    }
    case "time-range": {
      const { related } = measureLimit;
      const timeFrom =
        related.find(
          (d) => d.type === "time-from" && d.dimensionId === axisDimensionId
        )?.label ?? "";
      const timeTo =
        related.find(
          (d) => d.type === "time-to" && d.dimensionId === axisDimensionId
        )?.label ?? "";
      axis1Value = getAxisValue({ [observationKey]: timeFrom });
      axis2Value = getAxisValue({ [observationKey]: timeTo });
      measure1Value = measure2Value = measureLimit.value;
      break;
    }
    default: {
      const _exhaustiveCheck: never = measureLimit;
      return _exhaustiveCheck;
    }
  }

  return {
    axis1Value,
    axis2Value,
    measure1Value,
    measure2Value,
  };
};

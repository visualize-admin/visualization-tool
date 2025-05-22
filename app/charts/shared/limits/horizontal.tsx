import { useMemo } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import { useChartState } from "@/charts/shared/chart-state";
import { Limits, RenderLimitDatum } from "@/charts/shared/limits/shared";
import { useLimits } from "@/config-utils";
import { truthy } from "@/domain/types";

export const HorizontalLimits = ({
  axisDimension,
  limits,
}: ReturnType<typeof useLimits>) => {
  const { yScale, getY, xScale, bounds } = useChartState() as BarsState;
  const { width, height, chartHeight, margins } = bounds;
  const renderData: RenderLimitDatum[] = useMemo(() => {
    const isBandScale = "bandwidth" in yScale;
    const limitHeight = isBandScale ? yScale.bandwidth() : 15;

    const preparedLimits = limits
      .map(({ configLimit, measureLimit, relatedAxisDimensionValueLabel }) => {
        const key = axisDimension?.id ?? "";
        const label = relatedAxisDimensionValueLabel ?? "";
        let y1: $IntentionalAny;
        let y2: $IntentionalAny;
        let x1: number;
        let x2: number;

        switch (measureLimit.type) {
          case "single": {
            y1 = y2 = getY({ [key]: label });
            x1 = x2 = measureLimit.value;
            break;
          }
          case "value-range": {
            y1 = y2 = getY({ [key]: label });
            x1 = measureLimit.min;
            x2 = measureLimit.max;
            break;
          }
          case "time-range": {
            const { related } = measureLimit;
            const axisId = axisDimension?.id;
            const timeFrom =
              related.find(
                (d) => d.type === "time-from" && d.dimensionId === axisId
              )?.label ?? "";
            const timeTo =
              related.find(
                (d) => d.type === "time-to" && d.dimensionId === axisId
              )?.label ?? "";
            y1 = getY({ [key]: timeFrom });
            y2 = getY({ [key]: timeTo });
            x1 = x2 = measureLimit.value;
            break;
          }
          default:
            const _exhaustiveCheck: never = measureLimit;
            return _exhaustiveCheck;
        }

        return {
          type: measureLimit.type,
          y1: yScale(y1),
          y2: yScale(y2),
          x1,
          x2,
          ...configLimit,
          relatedAxisDimensionValueLabel,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map(
        ({
          type,
          y1,
          y2,
          x1,
          x2,
          related,
          color,
          lineType,
          symbolType,
          relatedAxisDimensionValueLabel,
        }) => {
          const key = related.map((d) => d.dimensionId + d.value).join();
          const size =
            y1 === undefined
              ? chartHeight
              : type === "time-range"
                ? 0
                : limitHeight;
          const yOffset = isBandScale ? size / 2 : 0;
          const hasValidAxis = y1 !== undefined && y2 !== undefined;
          const hasNoAxis = relatedAxisDimensionValueLabel === undefined;
          const datum: RenderLimitDatum = {
            key,
            x1: xScale(x1),
            x2: xScale(x2),
            y1: y1 ? y1 + yOffset : 0,
            y2: y2 ? y2 + yOffset : chartHeight,
            size,
            fill: color,
            lineType,
            symbolType,
          };

          return hasValidAxis || hasNoAxis ? datum : null;
        }
      )
      .filter(truthy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    xScale,
    limits,
    axisDimension?.values,
    axisDimension?.id,
    getY,
    yScale,
    width,
    height,
  ]);

  return <Limits renderData={renderData} margins={margins} isHorizontal />;
};

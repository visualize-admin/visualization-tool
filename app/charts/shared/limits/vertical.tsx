import { useMemo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { Limits, RenderLimitDatum } from "@/charts/shared/limits/shared";
import { useLimits } from "@/config-utils";
import { truthy } from "@/domain/types";

export const VerticalLimits = ({
  axisDimension,
  limits,
}: ReturnType<typeof useLimits>) => {
  const { xScale, getX, yScale, bounds } = useChartState() as
    | AreasState
    | ColumnsState
    | LinesState;
  const { margins, chartWidth, width, height } = bounds;
  const renderData: RenderLimitDatum[] = useMemo(() => {
    const isBandScale = "bandwidth" in xScale;
    const limitWidth = isBandScale ? xScale.bandwidth() : 15;

    const preparedLimits = limits
      .map(({ configLimit, measureLimit, relatedAxisDimensionValueLabel }) => {
        const key = axisDimension?.id ?? "";
        const label = relatedAxisDimensionValueLabel ?? "";
        let x1: $IntentionalAny;
        let x2: $IntentionalAny;
        let y1: number;
        let y2: number;

        switch (measureLimit.type) {
          case "single": {
            x1 = x2 = getX({ [key]: label });
            y1 = y2 = measureLimit.value;
            break;
          }
          case "value-range": {
            x1 = x2 = getX({ [key]: label });
            y1 = measureLimit.min;
            y2 = measureLimit.max;
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
            x1 = getX({ [key]: timeFrom });
            x2 = getX({ [key]: timeTo });
            y1 = y2 = measureLimit.value;
            break;
          }
          default:
            const _exhaustiveCheck: never = measureLimit;
            return _exhaustiveCheck;
        }

        return {
          type: measureLimit.type,
          x1: xScale(x1),
          x2: xScale(x2),
          y1: yScale(y1),
          y2: yScale(y2),
          ...configLimit,
          relatedAxisDimensionValueLabel,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map(
        ({
          type,
          x1,
          x2,
          y1,
          y2,
          related,
          color,
          lineType,
          symbolType,
          relatedAxisDimensionValueLabel,
        }) => {
          const key = related.map((d) => d.dimensionId + d.value).join();
          const size =
            x1 === undefined
              ? chartWidth
              : type === "time-range"
                ? 0
                : limitWidth;
          const xOffset = isBandScale ? size / 2 : 0;
          const hasValidAxis = x1 !== undefined && x2 !== undefined;
          const hasNoAxis = relatedAxisDimensionValueLabel === undefined;
          const datum: RenderLimitDatum = {
            key,
            x1: x1 ? x1 + xOffset : 0,
            x2: x2 ? x2 + xOffset : bounds.chartWidth,
            y1,
            y2,
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
    getX,
    yScale,
    width,
    height,
  ]);

  return <Limits renderData={renderData} margins={margins} />;
};

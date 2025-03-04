import { useMemo } from "react";

import { ColumnsState } from "@/charts/column/columns-state";
import { useChartState } from "@/charts/shared/chart-state";
import { RenderValueLabelDatum } from "@/charts/shared/render-value-labels";
import { truthy } from "@/domain/types";

export const useRenderColumnValueLabelsData = () => {
  const {
    showValues,
    renderEveryNthValue,
    chartData,
    getRenderingKey,
    xScale,
    getX,
    yScale,
    getY,
    valueLabelFormatter,
  } = useChartState() as ColumnsState;
  const bandwidth = xScale.bandwidth();
  const valueLabelsData: RenderValueLabelDatum[] = useMemo(() => {
    if (!showValues) {
      return [];
    }

    return chartData
      .map((d, i) => {
        if (i % renderEveryNthValue !== 0) {
          return null;
        }

        const key = getRenderingKey(d);
        const valueRaw = getY(d);
        const xScaled = xScale(getX(d)) as number;
        const value = valueRaw === null || isNaN(valueRaw) ? 0 : valueRaw;
        const yRender = yScale(Math.max(value, 0));

        return {
          key,
          x: xScaled + bandwidth / 2,
          y: yRender,
          valueLabel: valueLabelFormatter(value),
        };
      })
      .filter(truthy);
  }, [
    showValues,
    chartData,
    renderEveryNthValue,
    getRenderingKey,
    getY,
    xScale,
    getX,
    yScale,
    bandwidth,
    valueLabelFormatter,
  ]);

  return valueLabelsData;
};

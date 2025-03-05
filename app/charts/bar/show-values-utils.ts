import { useMemo } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import { useChartState } from "@/charts/shared/chart-state";
import { RenderValueLabelDatum } from "@/charts/shared/render-value-labels";
import { truthy } from "@/domain/types";

export const useBarValueLabelsData = () => {
  const {
    bounds: { width, height },
    showValues,
    renderEveryNthValue,
    chartData,
    getRenderingKey,
    xScale,
    getX,
    yScale,
    getY,
    valueLabelFormatter,
  } = useChartState() as BarsState;
  const bandwidth = yScale.bandwidth();
  const valueLabelsData: RenderValueLabelDatum[] = useMemo(() => {
    if (!showValues || !width || !height) {
      return [];
    }

    return chartData
      .map((d, i) => {
        if (i % renderEveryNthValue !== 0) {
          return null;
        }

        const key = getRenderingKey(d);
        const valueRaw = getX(d);
        const value = valueRaw === null || isNaN(valueRaw) ? 0 : valueRaw;
        const xScaled = xScale(Math.max(value, 0));
        const yRender = yScale(getY(d)) as number;

        return {
          key,
          x: xScaled,
          y: yRender + bandwidth / 2,
          valueLabel: valueLabelFormatter(value),
        };
      })
      .filter(truthy);
  }, [
    showValues,
    width,
    height,
    chartData,
    renderEveryNthValue,
    getRenderingKey,
    getX,
    xScale,
    yScale,
    getY,
    bandwidth,
    valueLabelFormatter,
  ]);

  return valueLabelsData;
};

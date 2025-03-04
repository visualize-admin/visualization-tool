import { useCallback, useMemo } from "react";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { RenderValueLabelDatum } from "@/charts/shared/render-value-labels";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { LineFields } from "@/config-types";
import { Dimension, Measure } from "@/domain/data";
import { truthy } from "@/domain/types";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";

export type ShowLineValueLabelsVariables = {
  yOffset: number;
  showValues: boolean;
  valueLabelFormatter: (value: number | null) => string;
};

export const useShowLineValueLabelsVariables = (
  y: LineFields["y"],
  {
    dimensions,
    measures,
  }: {
    dimensions: Dimension[];
    measures: Measure[];
  }
): ShowLineValueLabelsVariables => {
  const { showValues = false } = y;
  const yMeasure = measures.find((d) => d.id === y.componentId);

  if (!yMeasure) {
    throw Error(
      `No dimension <${y.componentId}> in cube! (useShowLineValueLabelsVariables)`
    );
  }

  const { labelFontSize: fontSize } = useChartTheme();

  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters({ dimensions, measures });
  const valueFormatter = formatters[yMeasure.id] ?? formatNumber;
  const valueLabelFormatter = useCallback(
    (value: number | null) => {
      return formatNumberWithUnit(value, valueFormatter);
    },
    [valueFormatter]
  );

  return {
    yOffset: fontSize,
    showValues,
    valueLabelFormatter,
  };
};

export const useRenderLineValueLabelsData = () => {
  const {
    showValues,
    chartData,
    xScale,
    getX,
    getXAsString,
    yScale,
    getY,
    valueLabelFormatter,
  } = useChartState() as LinesState;
  const valueLabelsData: RenderValueLabelDatum[] = useMemo(() => {
    if (!showValues) {
      return [];
    }

    return chartData
      .map((d) => {
        const key = getXAsString(d);
        const valueRaw = getY(d);
        const xScaled = xScale(getX(d)) as number;
        const value = valueRaw === null || isNaN(valueRaw) ? 0 : valueRaw;
        const yRender = yScale(Math.max(value, 0));

        return {
          key,
          x: xScaled,
          y: yRender,
          valueLabel: valueLabelFormatter(value),
        };
      })
      .filter(truthy);
  }, [
    showValues,
    chartData,
    getXAsString,
    getY,
    xScale,
    getX,
    yScale,
    valueLabelFormatter,
  ]);

  return valueLabelsData;
};

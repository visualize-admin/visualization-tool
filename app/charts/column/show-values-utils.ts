import { useCallback, useMemo } from "react";

import { ColumnsState } from "@/charts/column/columns-state";
import {
  NumericalValueGetter,
  useChartState,
} from "@/charts/shared/chart-state";
import { RenderValueLabelDatum } from "@/charts/shared/render-value-labels";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { ColumnFields } from "@/config-types";
import { Dimension, Measure, Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getTextWidth } from "@/utils/get-text-width";

export type ShowColumnValueLabelsVariables = {
  yOffset: number;
  showValues: boolean;
  rotateValues: boolean;
  renderEveryNthValue: number;
  valueLabelFormatter: (value: number | null) => string;
};

export const useShowColumnValueLabelsVariables = (
  y: ColumnFields["y"],
  {
    chartData,
    dimensions,
    measures,
    getY,
    bandwidth,
  }: {
    chartData: Observation[];
    dimensions: Dimension[];
    measures: Measure[];
    getY: NumericalValueGetter;
    bandwidth: number;
  }
): ShowColumnValueLabelsVariables => {
  const { showValues = false } = y;
  const yMeasure = measures.find((d) => d.id === y.componentId);

  if (!yMeasure) {
    throw Error(
      `No dimension <${y.componentId}> in cube! (useNumericalYVariables)`
    );
  }

  const { labelFontSize: fontSize } = useChartTheme();
  const renderEveryNthValue =
    bandwidth > fontSize ? 1 : Math.ceil(fontSize / bandwidth);

  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters({ dimensions, measures });
  const valueFormatter = formatters[yMeasure.id] ?? formatNumber;
  const valueLabelFormatter = useCallback(
    (value: number | null) => {
      return formatNumberWithUnit(value, valueFormatter);
    },
    [valueFormatter]
  );

  const { yOffset, rotateValues } = useMemo(() => {
    let yOffset = 0;
    let rotateValues = false;

    if (showValues) {
      let maxWidth = 0;

      chartData.forEach((d) => {
        const formattedValue = valueLabelFormatter(getY(d));
        const width = getTextWidth(formattedValue, { fontSize });

        if (width - 2 > bandwidth) {
          rotateValues = true;
        }

        if (width > maxWidth) {
          maxWidth = width;
        }
      });

      if (rotateValues) {
        yOffset = maxWidth;
      } else {
        yOffset = fontSize;
      }
    }

    return {
      yOffset,
      rotateValues,
    };
  }, [showValues, chartData, valueLabelFormatter, getY, fontSize, bandwidth]);

  return {
    yOffset,
    showValues,
    rotateValues,
    renderEveryNthValue,
    valueLabelFormatter,
  };
};

export const useColumnValueLabelsData = () => {
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

import { useCallback, useMemo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { RenderValueLabelDatum } from "@/charts/shared/render-value-labels";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { AreaFields, LineFields } from "@/config-types";
import { Dimension, Measure } from "@/domain/data";
import { truthy } from "@/domain/types";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getTextWidth } from "@/utils/get-text-width";

export type ShowTemporalValueLabelsVariables = {
  yOffset: number;
  showValues: boolean;
  valueLabelFormatter: (value: number | null) => string;
};

export const useShowTemporalValueLabelsVariables = (
  y: AreaFields["y"] | LineFields["y"],
  {
    dimensions,
    measures,
    segment,
  }: {
    dimensions: Dimension[];
    measures: Measure[];
    segment: AreaFields["segment"] | LineFields["segment"];
  }
): ShowTemporalValueLabelsVariables => {
  const { showValues: _showValues = false } = y;
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

  const showValues = _showValues && !segment;

  return {
    yOffset: showValues ? fontSize : 0,
    showValues,
    valueLabelFormatter,
  };
};

type RenderTemporalValueLabelDatum = RenderValueLabelDatum & {
  width: number;
};

export const useRenderTemporalValueLabelsData = () => {
  const {
    bounds: {
      width,
      height,
      margins: { left, right },
    },
    showValues,
    chartData,
    xScale,
    getX,
    getXAsString,
    yScale,
    getY,
    valueLabelFormatter,
  } = useChartState() as AreasState | LinesState;
  const { labelFontSize: fontSize } = useChartTheme();
  const valueLabelWidthsByIndex = useMemo(() => {
    return chartData.reduce((acc, d, i) => {
      const formattedValue = valueLabelFormatter(getY(d));
      const width = getTextWidth(formattedValue, { fontSize });
      acc[i] = width;

      return acc;
    }, {}) as Record<number, number>;
  }, [chartData, valueLabelFormatter, getY, fontSize]);
  const valueLabelsData: RenderTemporalValueLabelDatum[] = useMemo(() => {
    if (!showValues || !width || !height) {
      return [];
    }

    const previousArray: RenderTemporalValueLabelDatum[] = [];

    return chartData
      .map((d, i) => {
        const labelWidth = valueLabelWidthsByIndex[i] ?? 0;
        const key = getXAsString(d);
        const valueRaw = getY(d);
        const xScaled = xScale(getX(d)) as number;
        const value = valueRaw === null || isNaN(valueRaw) ? 0 : valueRaw;
        const yRender = yScale(Math.max(value, 0));
        const valueLabel = valueLabelFormatter(value);

        const padding = 8;
        const xScaledInBounds = Math.min(
          Math.max(
            Math.min(left - labelWidth / 2 + padding, labelWidth / 2),
            xScaled
          ),
          width - right - left - labelWidth / 2 + padding
        );

        const datum: RenderTemporalValueLabelDatum = {
          key,
          x: xScaledInBounds,
          y: yRender,
          valueLabel,
          width: labelWidth,
        };

        const isOverlapping = getIsOverlapping({
          previousArray,
          current: datum,
          labelHeight: fontSize,
        });

        if (isOverlapping) {
          return null;
        }

        previousArray.push(datum);

        return datum;
      })
      .filter(truthy);
  }, [
    showValues,
    width,
    height,
    chartData,
    valueLabelWidthsByIndex,
    getXAsString,
    getY,
    xScale,
    getX,
    yScale,
    valueLabelFormatter,
    left,
    right,
    fontSize,
  ]);

  return valueLabelsData;
};

const getIsOverlapping = ({
  previousArray,
  current,
  labelHeight,
}: {
  previousArray: RenderTemporalValueLabelDatum[];
  current: RenderTemporalValueLabelDatum;
  labelHeight: number;
}) => {
  return previousArray.some((previous) => {
    return (
      Math.abs(current.x - previous.x) <
        previous.width / 2 + current.width / 2 &&
      Math.abs(current.y - previous.y) < labelHeight
    );
  });
};

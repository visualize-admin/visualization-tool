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

export const useRenderTemporalValueLabelsData = () => {
  const {
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
  const valueLabelsData: RenderValueLabelDatum[] = useMemo(() => {
    if (!showValues) {
      return [];
    }

    const previous: {
      datum: RenderValueLabelDatum;
      width: number;
    }[] = [];

    return chartData
      .map((d, i) => {
        const key = getXAsString(d);
        const valueRaw = getY(d);
        const xScaled = xScale(getX(d)) as number;
        const value = valueRaw === null || isNaN(valueRaw) ? 0 : valueRaw;
        const yRender = yScale(Math.max(value, 0));
        const valueLabel = valueLabelFormatter(value);

        const datum: RenderValueLabelDatum = {
          key,
          x: xScaled,
          y: yRender,
          valueLabel,
        };

        const isOverlapping = getIsOverlapping({
          previous,
          current: {
            datum,
            width: valueLabelWidthsByIndex[i] ?? 0,
          },
          labelHeight: fontSize,
        });

        if (isOverlapping) {
          return null;
        }

        previous.push({
          datum,
          width: valueLabelWidthsByIndex[i] ?? 0,
        });

        return datum;
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
    valueLabelWidthsByIndex,
    fontSize,
  ]);

  return valueLabelsData;
};

const getIsOverlapping = ({
  previous,
  current,
  labelHeight,
}: {
  previous: { datum: RenderValueLabelDatum; width: number }[];
  current: { datum: RenderValueLabelDatum; width: number };
  labelHeight: number;
}) => {
  return previous.some((prev) => {
    const { x: xPrev, y: yPrev } = prev.datum;
    const { x: xNext, y: yNext } = current.datum;

    return (
      Math.abs(xNext - xPrev) < prev.width / 2 + current.width / 2 &&
      Math.abs(yNext - yPrev) < labelHeight
    );
  });
};

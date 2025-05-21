import { ScaleLinear } from "d3-scale";
import { useCallback, useMemo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { LinesState } from "@/charts/line/lines-state";
import {
  NumericalValueGetter,
  NumericalXErrorVariables,
  NumericalYErrorVariables,
  useChartState,
} from "@/charts/shared/chart-state";
import { RenderTotalValueLabelDatum } from "@/charts/shared/render-value-labels";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import {
  AreaFields,
  BarFields,
  ColumnFields,
  LineFields,
} from "@/config-types";
import { Dimension, Measure, Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getTextWidth } from "@/utils/get-text-width";

export type ShowBandValueLabelsVariables = {
  offset: number;
  getValueOffset: (observation: Observation) => number;
  showValues: boolean;
  rotateValues: boolean;
  renderEveryNthValue: number;
  valueLabelFormatter: ValueLabelFormatter;
};

export const useShowBandValueLabelsVariables = (
  measureField: BarFields["x"] | ColumnFields["y"],
  {
    chartData,
    dimensions,
    measures,
    getValue,
    getErrorRange,
    scale,
    bandwidth,
  }: {
    chartData: Observation[];
    dimensions: Dimension[];
    measures: Measure[];
    getValue: NumericalValueGetter;
    getErrorRange?:
      | NumericalXErrorVariables["getXErrorRange"]
      | NumericalYErrorVariables["getYErrorRange"];
    scale: ScaleLinear<number, number>;
    bandwidth?: number;
  }
): ShowBandValueLabelsVariables => {
  const { showValues = false } = measureField;
  const measure = measures.find((d) => d.id === measureField.componentId);

  if (!measure) {
    throw Error(
      `No dimension <${measureField.componentId}> in cube! (useShowBandValueLabelsVariables)`
    );
  }

  const disableRotation = !bandwidth;
  const horizontal = disableRotation;
  const { labelFontSize: fontSize } = useChartTheme();
  const renderEveryNthValue =
    disableRotation || bandwidth > fontSize
      ? 1
      : Math.ceil(fontSize / bandwidth);

  const valueLabelFormatter = useValueLabelFormatter({
    measureId: measure.id,
    dimensions,
    measures,
  });

  const getValueOffset: ShowBandValueLabelsVariables["getValueOffset"] =
    useCallback(
      (observation: Observation) => {
        const value = getValue(observation);

        if (value === null) {
          return 0;
        }

        const errorEnd = getErrorRange?.(observation)[1];

        if (errorEnd === undefined) {
          return 0;
        }

        if (horizontal) {
          return scale(errorEnd - value);
        }

        return scale(errorEnd) - scale(value);
      },
      [getValue, getErrorRange, horizontal, scale]
    );

  const { offset, rotateValues } = useMemo(() => {
    let offset = 0;
    let rotateValues = false;

    if (showValues) {
      let maxWidth = 0;

      chartData.forEach((d) => {
        const value = getValue(d);
        const formattedValue = valueLabelFormatter(value);
        const width = getTextWidth(formattedValue, { fontSize });

        if (!disableRotation && width - 2 > bandwidth) {
          rotateValues = true;
        }

        if (width > maxWidth) {
          maxWidth = width;
        }
      });

      if (disableRotation || rotateValues) {
        offset = maxWidth;
      } else {
        offset = fontSize;
      }
    }

    return {
      offset,
      rotateValues,
    };
  }, [
    showValues,
    chartData,
    disableRotation,
    getValue,
    valueLabelFormatter,
    fontSize,
    bandwidth,
  ]);

  return {
    offset,
    getValueOffset,
    showValues,
    rotateValues,
    renderEveryNthValue,
    valueLabelFormatter,
  };
};

export type ShowTemporalValueLabelsVariables = {
  yOffset: number;
  showValues: boolean;
  valueLabelFormatter: ValueLabelFormatter;
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

  const valueLabelFormatter = useValueLabelFormatter({
    measureId: yMeasure.id,
    dimensions,
    measures,
  });

  const showValues = _showValues && !segment;

  return {
    yOffset: showValues ? fontSize : 0,
    showValues,
    valueLabelFormatter,
  };
};

type RenderTemporalValueLabelDatum = RenderTotalValueLabelDatum & {
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

export const getIsOverlapping = ({
  previousArray,
  current,
  labelHeight,
  horizontalOffset = 8,
}: {
  previousArray: RenderTemporalValueLabelDatum[];
  current: RenderTemporalValueLabelDatum;
  labelHeight: number;
  horizontalOffset?: number;
}) => {
  return previousArray.some((previous) => {
    return (
      Math.abs(current.x - previous.x) - horizontalOffset <
        previous.width / 2 + current.width / 2 &&
      Math.abs(current.y - previous.y) < labelHeight
    );
  });
};

export type ValueLabelFormatter = ReturnType<typeof useValueLabelFormatter>;

export const useValueLabelFormatter = ({
  measureId,
  dimensions,
  measures,
  normalize,
}: {
  measureId: string;
  dimensions: Dimension[];
  measures: Measure[];
  normalize?: boolean;
}) => {
  const formatPercent = useFormatNumber({ decimals: 0 });
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters({ dimensions, measures });
  const valueFormatter = normalize
    ? formatPercent
    : (formatters[measureId] ?? formatNumber);

  return useCallback(
    (value: number | null) => {
      return formatNumberWithUnit(value, valueFormatter);
    },
    [valueFormatter]
  );
};

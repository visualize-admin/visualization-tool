import { useMemo } from "react";

import { PieState } from "@/charts/pie/pie-state";
import { RenderDatum } from "@/charts/pie/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { RenderValueLabelDatum } from "@/charts/shared/render-value-labels";
import {
  getIsOverlapping,
  useValueLabelFormatter,
  ValueLabelFormatter,
} from "@/charts/shared/show-values-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { PieFields } from "@/config-types";
import { Dimension, Measure } from "@/domain/data";
import { truthy } from "@/domain/types";
import { getTextWidth } from "@/utils/get-text-width";

export type ShowPieValueLabelsVariables = {
  showValues: boolean;
  valueLabelFormatter: ValueLabelFormatter;
};

export const useShowPieValueLabelsVariables = (
  y: PieFields["y"],
  {
    dimensions,
    measures,
  }: {
    dimensions: Dimension[];
    measures: Measure[];
  }
): ShowPieValueLabelsVariables => {
  const { showValues = false } = y;
  const yMeasure = measures.find((d) => d.id === y.componentId);

  if (!yMeasure) {
    throw Error(
      `No dimension <${y.componentId}> in cube! (useShowTemporalValueLabelsVariables)`
    );
  }

  const valueLabelFormatter = useValueLabelFormatter({
    measureId: yMeasure.id,
    dimensions,
    measures,
  });

  return {
    showValues,
    valueLabelFormatter,
  };
};

type PieValueLabelDatum = RenderValueLabelDatum & {
  width: number;
};

export const useRenderPieValueLabelsData = ({
  renderData,
  outerRadius,
}: {
  renderData: RenderDatum[];
  outerRadius: number;
}) => {
  const {
    bounds: { width, height },
    showValues,
    valueLabelFormatter,
  } = useChartState() as PieState;
  const { labelFontSize: fontSize } = useChartTheme();
  const valueLabelWidthsByIndex = useMemo(() => {
    return renderData.reduce(
      (acc, d, i) => {
        const formattedValue = valueLabelFormatter(d.value);
        const width = getTextWidth(formattedValue, { fontSize });
        acc[i] = width;

        return acc;
      },
      {} as Record<number, number>
    );
  }, [renderData, valueLabelFormatter, fontSize]);
  const valueLabelsData: PieValueLabelDatum[] = useMemo(() => {
    if (!showValues || !width || !height) {
      return [];
    }

    const previousArray: PieValueLabelDatum[] = [];
    const offset = 24;

    return renderData
      .map((d, i) => {
        const labelWidth = valueLabelWidthsByIndex[i] ?? 0;
        const middleAngle =
          (d.arcDatum.startAngle + d.arcDatum.endAngle) / 2 - Math.PI / 2;
        const x =
          (outerRadius + offset + labelWidth / 2) * Math.cos(middleAngle);
        const y = (outerRadius + offset + fontSize / 2) * Math.sin(middleAngle);
        const valueLabel = valueLabelFormatter(d.value);

        const datum: PieValueLabelDatum = {
          key: d.key,
          x: x,
          y: y,
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
    renderData,
    valueLabelWidthsByIndex,
    outerRadius,
    valueLabelFormatter,
    fontSize,
  ]);

  return valueLabelsData;
};

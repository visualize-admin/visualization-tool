import { Selection } from "d3-selection";
import { useMemo } from "react";

import { PieState } from "@/charts/pie/pie-state";
import { RenderDatum } from "@/charts/pie/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { RenderValueLabelDatum } from "@/charts/shared/render-value-labels";
import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";
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

type RenderPieValueLabelDatum = RenderValueLabelDatum & {
  width: number;
  connector: {
    x1: number;
    y1: number;
  };
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
  const valueLabelsData: RenderPieValueLabelDatum[] = useMemo(() => {
    if (!showValues || !width || !height) {
      return [];
    }

    const previousArray: RenderPieValueLabelDatum[] = [];
    const connectorOffset = 8;

    return renderData
      .map((d, i) => {
        const labelWidth = valueLabelWidthsByIndex[i] ?? 0;
        const a = (d.arcDatum.startAngle + d.arcDatum.endAngle - Math.PI) / 2;
        const aSin = Math.sin(a);
        const aCos = Math.cos(a);
        const offset =
          outerRadius + Math.min(36, Math.max(12 + labelWidth, 24)) * 1.5;
        const x = offset * aCos;
        const y = offset * aSin;
        const valueLabel = valueLabelFormatter(d.value);

        const datum: RenderPieValueLabelDatum = {
          key: d.key,
          x,
          y,
          valueLabel,
          width: labelWidth,
          connector: {
            x1: (outerRadius + connectorOffset) * aCos,
            y1: (outerRadius + connectorOffset) * aSin,
          },
        };

        const isOverlapping =
          getIsOverlapping({
            previousArray,
            current: datum,
            labelHeight: fontSize,
          }) ||
          x - labelWidth / 2 < -width / 2 ||
          x + labelWidth / 2 > width / 2;

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

export const renderPieValueLabelConnectors = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderPieValueLabelDatum[],
  options: RenderOptions & {}
) => {
  const { transition } = options;

  g.selectAll<SVGLineElement, RenderPieValueLabelDatum>("line")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("line")
          .attr("x1", (d) => d.connector.x1)
          .attr("y1", (d) => d.connector.y1)
          .attr("x2", (d) => d.connector.x1)
          .attr("y2", (d) => d.connector.y1)
          .attr("stroke", "black")
          .style("opacity", 0)
          .call((enter) =>
            maybeTransition(enter, {
              transition,
              s: (g) =>
                g
                  .attr("x1", (d) => d.connector.x1)
                  .attr("y1", (d) => d.connector.y1)
                  .attr("x2", (d) => d.x)
                  .attr("y2", (d) => d.y)
                  .style("opacity", 1),
            })
          ),
      (update) =>
        maybeTransition(update, {
          s: (g) =>
            g
              .attr("x1", (d) => d.connector.x1)
              .attr("y1", (d) => d.connector.y1)
              .attr("x2", (d) => d.x)
              .attr("y2", (d) => d.y)
              .style("opacity", 1),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.style("opacity", 0).remove(),
        })
    );
};

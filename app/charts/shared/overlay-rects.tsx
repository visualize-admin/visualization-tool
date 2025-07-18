import { sum } from "d3-array";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { useCallback, useMemo } from "react";

import { useGetAnnotationRenderState } from "@/charts/shared/annotation-utils";
import {
  ANNOTATION_FOCUS_COLOR,
  ANNOTATION_FOCUS_WIDTH,
} from "@/charts/shared/rendering-utils";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

const OverlayHighlightRect = ({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="none"
      stroke={ANNOTATION_FOCUS_COLOR}
      strokeWidth={ANNOTATION_FOCUS_WIDTH}
      pointerEvents="none"
    />
  );
};

export const StackedAnnotationHighlight = ({
  bounds,
  getValue,
  getAxisValue,
  valueScale,
  axisScale,
  chartDataGrouped,
  dimension,
  isHorizontal,
}: {
  bounds: { width: number; margins: { left: number; top: number } };
  getValue: (d: Observation) => number;
  getAxisValue: (d: Observation) => string;
  valueScale: ScaleLinear<number, number>;
  axisScale: ScaleBand<string>;
  chartDataGrouped: Map<string, Observation[]>;
  dimension: { id: string };
  isHorizontal: boolean;
}) => {
  const [interaction] = useInteraction();
  const getAnnotationRenderState = useGetAnnotationRenderState();
  const axisSize = axisScale.bandwidth();

  const getHighlightRect = useCallback(
    (axisKey: string) => {
      const axisPosition = axisScale(axisKey) as number;
      const values = chartDataGrouped.get(axisKey) ?? [];
      const valueSum = sum(values, getValue) ?? 0;
      const value0 = valueScale(0);
      const value1 = valueScale(valueSum);
      const valueSize = Math.abs(value1 - value0);

      if (isHorizontal) {
        return {
          x: value0,
          y: axisPosition,
          width: valueSize,
          height: axisSize,
        };
      } else {
        return {
          x: axisPosition,
          y: value1,
          width: axisSize,
          height: valueSize,
        };
      }
    },
    [chartDataGrouped, getValue, valueScale, axisScale, axisSize, isHorizontal]
  );

  const highlightedRects = useMemo(() => {
    bounds.width;

    const rects: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    if (
      interaction.observation &&
      interaction.type === "annotation" &&
      interaction.visible &&
      !interaction.focusingSegment
    ) {
      const axisValue = getAxisValue(interaction.observation);
      const { focused } = getAnnotationRenderState(interaction.observation, {
        axisComponentId: dimension.id,
        axisValue,
      });

      if (focused) {
        rects.push(getHighlightRect(axisValue));
      }
    }

    for (const [axisValue, observations] of chartDataGrouped) {
      const { focused, isActive } = getAnnotationRenderState(observations[0], {
        axisComponentId: dimension.id,
        axisValue,
      });

      if (
        isActive ||
        (focused &&
          interaction.type === "annotation" &&
          !interaction.focusingSegment)
      ) {
        rects.push(getHighlightRect(axisValue));
      }
    }

    return rects;
  }, [
    bounds.width,
    interaction,
    getAxisValue,
    getAnnotationRenderState,
    dimension.id,
    getHighlightRect,
    chartDataGrouped,
  ]);

  if (highlightedRects.length === 0) {
    return null;
  }

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {highlightedRects.map((rect, i) => (
        <OverlayHighlightRect
          key={i}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
        />
      ))}
    </g>
  );
};

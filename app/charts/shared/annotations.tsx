import { useMemo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { PieState } from "@/charts/pie/pie-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { AnnotationCircle } from "@/charts/shared/annotation-circle";
import { matchesAnnotationTarget } from "@/charts/shared/annotation-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { Annotation } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { useConfiguratorState } from "@/configurator/configurator-state";

export type AnnotationInfo = {
  x: number;
  y: number;
  color?: string;
};

export const Annotations = () => {
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField, annotations } = chartConfig;
  const {
    chartData,
    bounds: { margins },
    getSegment,
    getAnnotationInfo,
  } = useChartState() as
    | AreasState
    | BarsState
    | StackedBarsState
    | ColumnsState
    | StackedColumnsState
    | LinesState
    | PieState
    | ScatterplotState;

  const annotationPositions = useMemo(() => {
    if (annotations.length === 0) {
      return [];
    }

    return annotations
      .flatMap((a) => {
        return chartData.map((observation) => {
          if (!matchesAnnotationTarget(observation, a.targets)) {
            return null;
          }

          const segment = getSegment(observation);
          const { x, y, color } = getAnnotationInfo(observation, segment);
          const finalColor =
            color ?? (a.highlightType === "filled" ? a.color : undefined);
          const focused = activeField === a.key;

          return {
            annotation: a,
            x,
            y,
            color: finalColor,
            focused,
          };
        });
      })
      .filter((d): d is AnnotationPosition => d !== null);
  }, [annotations, chartData, getSegment, getAnnotationInfo, activeField]);

  return (
    <>
      {annotationPositions.map(({ annotation, x, y, color, focused }) => (
        <AnnotationCircle
          key={annotation.key}
          x={x + margins.left}
          y={y + margins.top}
          color={color}
          focused={focused}
        />
      ))}
    </>
  );
};

type AnnotationPosition = {
  annotation: Annotation;
  x: number;
  y: number;
  color: string | undefined;
  focused: boolean;
};

export const ANNOTATION_SINGLE_SEGMENT_OFFSET = 12;

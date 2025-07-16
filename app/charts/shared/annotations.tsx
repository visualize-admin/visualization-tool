import { useCallback, useMemo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { PieState } from "@/charts/pie/pie-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { AnnotationCircle } from "@/charts/shared/annotation-circle";
import { AnnotationTooltip } from "@/charts/shared/annotation-tooltip";
import { matchesAnnotationTarget } from "@/charts/shared/annotation-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { Annotation } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";

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
    bounds: { width, height, margins },
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
  const interactiveAnnotations = useChartInteractiveFilters(
    (d) => d.annotations
  );
  const setInteractiveAnnotations = useChartInteractiveFilters(
    (d) => d.setAnnotations
  );

  const handleAnnotationClick = useCallback(
    (annotation: Annotation) => {
      setInteractiveAnnotations({
        ...interactiveAnnotations,
        [annotation.key]: !interactiveAnnotations[annotation.key],
      });
    },
    [interactiveAnnotations, setInteractiveAnnotations]
  );

  const annotationPositions = useMemo(() => {
    // A "hack" to prevent using // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // We need to re-compute the annotation positions when the chart width or height changes.
    width;
    height;

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
  }, [
    width,
    height,
    annotations,
    chartData,
    getSegment,
    getAnnotationInfo,
    activeField,
  ]);

  return (
    <>
      {annotationPositions.map((annotationPosition) => {
        const { annotation, x, y, color, focused } = annotationPosition;

        return (
          <>
            <AnnotationCircle
              key={annotation.key}
              x={x + margins.left}
              y={y + margins.top}
              color={color}
              focused={focused}
              onClick={() => handleAnnotationClick(annotation)}
            />
            <AnnotationTooltip annotationPosition={annotationPosition} />
          </>
        );
      })}
    </>
  );
};

export type AnnotationPosition = {
  annotation: Annotation;
  x: number;
  y: number;
  color: string | undefined;
  focused: boolean;
};

export const ANNOTATION_SINGLE_SEGMENT_OFFSET = 12;

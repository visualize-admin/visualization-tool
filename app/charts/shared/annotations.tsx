import { useCallback, useEffect, useMemo } from "react";

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
import {
  matchesAnnotationTarget,
  useIsEditingAnnotation,
} from "@/charts/shared/annotation-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { Annotation } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { useLocale } from "@/locales/use-locale";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";

export type AnnotationEnabledChartState =
  | AreasState
  | BarsState
  | StackedBarsState
  | ColumnsState
  | StackedColumnsState
  | LinesState
  | PieState
  | ScatterplotState;

export type GetAnnotationInfo = (
  observation: Observation,
  props: {
    segment: string;
    focusingSegment: boolean;
  }
) => AnnotationInfo;

export type AnnotationInfo = {
  x: number;
  y: number;
  color?: string;
};

export const Annotations = () => {
  const locale = useLocale();
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField, annotations } = chartConfig;
  const {
    chartData,
    bounds: { width, height, margins },
    segmentDimension,
    getSegment,
    getAnnotationInfo,
  } = useChartState() as AnnotationEnabledChartState;
  const isEditingAnnotation = useIsEditingAnnotation();
  const interactiveAnnotations = useChartInteractiveFilters(
    (d) => d.annotations
  );
  const updateAnnotation = useChartInteractiveFilters(
    (d) => d.updateAnnotation
  );

  const handleAnnotationClick = useCallback(
    (annotation: Annotation) => {
      updateAnnotation(annotation.key, !interactiveAnnotations[annotation.key]);
    },
    [interactiveAnnotations, updateAnnotation]
  );

  const createRenderAnnotation = useCallback(
    (
      annotation: Annotation,
      x: number,
      y: number,
      color: string | undefined,
      focused: boolean
    ) => ({
      annotation,
      x: x + margins.left,
      y: y + margins.top,
      color,
      focused,
    }),
    [margins.left, margins.top]
  );

  const findObservationForAnnotation = useCallback(
    (annotation: Annotation) => {
      return chartData.find((observation) => {
        return annotation.targets.some(
          (target) =>
            observation[`${target.componentId}/__iri__`] === target.value &&
            target.componentId !== segmentDimension?.id
        );
      });
    },
    [chartData, segmentDimension?.id]
  );

  const processAnnotationWithoutSegmentFocus = useCallback(
    (annotation: Annotation) => {
      const observation = findObservationForAnnotation(annotation);

      if (!observation) {
        return;
      }

      const { x, y, color } = getAnnotationInfo(observation, {
        segment: "",
        focusingSegment: false,
      });

      const focused = activeField === annotation.key;

      return createRenderAnnotation(annotation, x, y, color, focused);
    },
    [
      findObservationForAnnotation,
      getAnnotationInfo,
      activeField,
      createRenderAnnotation,
    ]
  );

  const processAnnotationWithSegmentFocus = useCallback(
    (annotation: Annotation) => {
      const focused = activeField === annotation.key;

      return chartData.map((observation) => {
        if (!matchesAnnotationTarget(observation, annotation.targets)) {
          return;
        }

        const segment = getSegment(observation);
        const { x, y, color } = getAnnotationInfo(observation, {
          segment,
          focusingSegment: true,
        });

        const finalColor =
          color ??
          (annotation.highlightType === "filled"
            ? annotation.color
            : undefined);

        return createRenderAnnotation(annotation, x, y, finalColor, focused);
      });
    },
    [
      activeField,
      chartData,
      getSegment,
      getAnnotationInfo,
      createRenderAnnotation,
    ]
  );

  const renderAnnotations = useMemo(() => {
    // A "hack" to prevent using // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // We need to re-compute the annotation positions when the chart width or height changes.
    width;
    height;

    if (annotations.length === 0) {
      return [];
    }

    return annotations
      .flatMap((annotation) => {
        const focusingSegment =
          !segmentDimension ||
          annotation.targets.some(
            (target) => target.componentId === segmentDimension.id
          );

        if (focusingSegment) {
          return processAnnotationWithSegmentFocus(annotation);
        }

        return processAnnotationWithoutSegmentFocus(annotation);
      })
      .filter(truthy);
  }, [
    width,
    height,
    annotations,
    segmentDimension,
    processAnnotationWithSegmentFocus,
    processAnnotationWithoutSegmentFocus,
  ]);

  // TODO: This makes it impossible to close the annotation when editing it.
  useEffect(() => {
    if (!isEditingAnnotation) {
      return;
    }

    annotations.forEach((annotation) => {
      if (
        annotation.key === activeField &&
        !interactiveAnnotations[annotation.key]
      ) {
        updateAnnotation(annotation.key, true);
      }
    });
  }, [
    activeField,
    annotations,
    interactiveAnnotations,
    isEditingAnnotation,
    updateAnnotation,
  ]);

  return (
    <>
      {renderAnnotations.map((renderAnnotation) => {
        const { annotation, x, y, color, focused } = renderAnnotation;

        return (
          <>
            {annotation.text[locale] || focused ? (
              <AnnotationCircle
                key={annotation.key}
                x={x}
                y={y}
                color={color}
                focused={focused}
                onClick={() => handleAnnotationClick(annotation)}
              />
            ) : null}
            <AnnotationTooltip renderAnnotation={renderAnnotation} />
          </>
        );
      })}
    </>
  );
};

export type RenderAnnotation = {
  annotation: Annotation;
  x: number;
  y: number;
  color: string | undefined;
  focused: boolean;
};

export const ANNOTATION_SINGLE_SEGMENT_OFFSET = 12;

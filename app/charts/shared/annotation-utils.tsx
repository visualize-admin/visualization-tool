import isEqual from "lodash/isEqual";
import { useCallback } from "react";

import { useInteraction } from "@/charts/shared/use-interaction";
import { Annotation, ChartConfig } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { isAnnotationField } from "@/configurator/components/chart-annotations/utils";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { Observation } from "@/domain/data";
import { useEvent } from "@/utils/use-event";

export const useGetAnnotationRenderState = () => {
  const [interaction] = useInteraction();
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField } = chartConfig;
  const isEditing = isAnnotationField(activeField) && isConfiguring(state);

  const getAnnotationRenderState = useCallback(
    (
      observation: Observation,
      {
        axisComponentId,
        axisValue,
      }: {
        axisComponentId: string;
        axisValue: string;
      }
    ) => {
      let annotation: Annotation | undefined;

      for (const a of chartConfig.annotations) {
        const matches = matchesTarget(observation, a.target);

        if (matches) {
          annotation = a;
          break;
        }
      }

      let color: string | undefined;

      if (annotation?.color && annotation.highlightType === "filled") {
        color = annotation.color;
      }

      const interactionMatches =
        interaction.type === "focus" &&
        interaction.visible &&
        interaction.observation?.[axisComponentId] === axisValue;
      const targetsOtherAnnotations = chartConfig.annotations.some(
        (a) => a.key !== activeField && matchesTarget(observation, a.target)
      );

      const annotationMatches = annotation?.target.axis?.value === axisValue;
      const isActive = annotation?.key === activeField;

      let focused =
        isEditing &&
        ((interactionMatches && !targetsOtherAnnotations) ||
          (annotationMatches && isActive));

      return {
        color,
        focused,
      };
    },
    [
      activeField,
      chartConfig.annotations,
      interaction.observation,
      interaction.type,
      interaction.visible,
      isEditing,
    ]
  );

  return getAnnotationRenderState;
};

export const useOverlayRectInteractions = () => {
  const [, dispatchInteraction] = useInteraction();
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField, annotations } = chartConfig;
  const isEditingAnnotation =
    isAnnotationField(activeField) && isConfiguring(state);
  const activeAnnotation = annotations.find((a) => a.key === activeField);

  // TODO: Differentiate between edit and view modes (to open annotation).
  const onClick = useEvent((observation: Observation) => {
    if (!isEditingAnnotation || !activeAnnotation || !activeField) {
      return;
    }

    const currentTarget = activeAnnotation.target;
    const newTarget = getTargetFromObservation(observation, { chartConfig });

    if (isEqual(currentTarget, newTarget)) {
      return;
    }

    const otherAnnotationWithSameTarget = annotations.find(
      (a) => a.key !== activeField && matchesTarget(observation, a.target)
    );

    if (otherAnnotationWithSameTarget) {
      return;
    }

    dispatch({
      type: "CHART_ANNOTATION_TARGET_CHANGE",
      value: {
        key: activeField,
        target: newTarget,
      },
    });
  });

  const onHover = useEvent((observation: Observation) => {
    if (isEditingAnnotation) {
      dispatchInteraction({
        type: "INTERACTION_UPDATE",
        value: {
          type: "focus",
          visible: true,
          observation,
        },
      });
    } else {
      dispatchInteraction({
        type: "INTERACTION_UPDATE",
        value: {
          type: "tooltip",
          visible: true,
          observation,
        },
      });
    }
  });

  const onHoverOut = useEvent(() => {
    dispatchInteraction({
      type: "INTERACTION_HIDE",
    });
  });

  return {
    onClick,
    onHover,
    onHoverOut,
  };
};

const getTargetFromObservation = (
  observation: Observation,
  { chartConfig }: { chartConfig: ChartConfig }
): Annotation["target"] => {
  const target: Annotation["target"] = { axis: undefined, segment: undefined };
  const mkTarget = (componentId: string) => {
    return {
      componentId,
      value: `${observation[componentId]}`,
    };
  };

  switch (chartConfig.chartType) {
    case "column":
    case "line":
    case "area": {
      const xComponentId = chartConfig.fields.x.componentId;
      if (xComponentId) {
        target.axis = mkTarget(xComponentId);
      }

      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId) {
        target.segment = mkTarget(segmentComponentId);
      }

      break;
    }
    case "bar": {
      const yComponentId = chartConfig.fields.y.componentId;
      if (yComponentId) {
        target.axis = mkTarget(yComponentId);
      }

      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId) {
        target.segment = mkTarget(segmentComponentId);
      }

      break;
    }
    case "scatterplot": {
      const xComponentId = chartConfig.fields.x?.componentId;
      if (xComponentId) {
        target.axis = mkTarget(xComponentId);
      }

      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId) {
        target.segment = mkTarget(segmentComponentId);
      }

      break;
    }
    case "pie": {
      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId) {
        target.segment = mkTarget(segmentComponentId);
      }

      break;
    }
    case "comboLineColumn":
    case "comboLineDual":
    case "comboLineSingle":
    case "map":
    case "table":
      break;
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }

  return target;
};

const matchesTarget = (
  observation: Observation,
  target: Annotation["target"] | undefined
): boolean => {
  if (
    target?.axis &&
    observation[target.axis.componentId] !== target.axis.value
  ) {
    return false;
  }

  if (
    target?.segment &&
    observation[target.segment.componentId] !== target.segment.value
  ) {
    return false;
  }

  return true;
};

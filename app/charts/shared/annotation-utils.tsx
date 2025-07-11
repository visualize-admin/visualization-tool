import isEqual from "lodash/isEqual";

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

export const useOverlayRectInteractions = () => {
  const [, dispatchInteraction] = useInteraction();
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField, annotations } = chartConfig;
  const isEditAnnotationMode =
    isAnnotationField(activeField) && isConfiguring(state);
  const activeAnnotation = annotations.find((a) => a.key === activeField);

  // TODO: Differentiate between edit and view modes (to open annotation).
  const onClick = useEvent((observation: Observation) => {
    if (!isEditAnnotationMode || !activeAnnotation || !activeField) {
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
    if (isEditAnnotationMode) {
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
  target: Annotation["target"]
): boolean => {
  if (
    target.axis &&
    observation[target.axis.componentId] !== target.axis.value
  ) {
    return false;
  }

  if (
    target.segment &&
    observation[target.segment.componentId] !== target.segment.value
  ) {
    return false;
  }

  return true;
};

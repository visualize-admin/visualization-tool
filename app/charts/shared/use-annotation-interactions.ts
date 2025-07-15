import isEqual from "lodash/isEqual";

import {
  getAnnotationTargetsFromObservation,
  matchesAnnotationTarget,
  useIsEditingAnnotation,
} from "@/charts/shared/annotation-utils";
import { useInteraction } from "@/charts/shared/use-interaction";
import { getChartConfig } from "@/config-utils";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { Observation } from "@/domain/data";
import { useEvent } from "@/utils/use-event";

export const useAnnotationInteractions = () => {
  const [, dispatchInteraction] = useInteraction();
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField, annotations } = chartConfig;
  const isEditingAnnotation = useIsEditingAnnotation();
  const activeAnnotation = annotations.find((a) => a.key === activeField);

  // TODO: Differentiate between edit and view modes (to open annotation).
  const onClick = useEvent(
    (observation: Observation, { segment }: { segment?: string }) => {
      if (!isEditingAnnotation || !activeAnnotation || !activeField) {
        return;
      }

      const currentTargets = activeAnnotation.targets;
      const newTargets = getAnnotationTargetsFromObservation(observation, {
        chartConfig,
        segment,
      });

      if (isEqual(currentTargets, newTargets)) {
        return;
      }

      const otherAnnotationWithSameTarget = annotations.find(
        (a) =>
          a.key !== activeField &&
          matchesAnnotationTarget(observation, a.targets)
      );

      if (otherAnnotationWithSameTarget) {
        return;
      }

      dispatch({
        type: "CHART_ANNOTATION_TARGETS_CHANGE",
        value: {
          key: activeField,
          targets: newTargets,
        },
      });
    }
  );

  const onHover = useEvent(
    (observation: Observation, { segment }: { segment?: string }) => {
      dispatchInteraction({
        type: "INTERACTION_UPDATE",
        value: {
          type: isEditingAnnotation ? "focus" : "tooltip",
          visible: true,
          observation,
          segment,
        },
      });
    }
  );

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

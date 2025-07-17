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

export const useAnnotationInteractions = ({
  focusingSegment,
}: {
  focusingSegment: boolean;
}) => {
  const [, dispatchInteraction] = useInteraction();
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField, annotations } = chartConfig;
  const isEditingAnnotation = useIsEditingAnnotation();
  const activeAnnotation = annotations.find((a) => a.key === activeField);

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

      const otherAnnotationWithSameTarget = annotations
        .filter((d) => d.targets.length === newTargets.length)
        .find((a) => matchesAnnotationTarget(observation, a.targets));

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
          type: isEditingAnnotation ? "annotation" : "tooltip",
          visible: true,
          observation,
          focusingSegment,
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

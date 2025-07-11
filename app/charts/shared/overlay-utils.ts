import isEqual from "lodash/isEqual";

import {
  getAnnotationTargetFromObservation,
  matchesAnnotationTarget,
  useIsEditingAnnotation,
} from "@/charts/shared/annotation-utils";
import { useInteraction } from "@/charts/shared/use-interaction";
import { getChartConfig } from "@/config-utils";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { Observation } from "@/domain/data";
import { useEvent } from "@/utils/use-event";

export const useOverlayInteractions = () => {
  const [, dispatchInteraction] = useInteraction();
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField, annotations } = chartConfig;
  const isEditingAnnotation = useIsEditingAnnotation();
  const activeAnnotation = annotations.find((a) => a.key === activeField);

  // TODO: Differentiate between edit and view modes (to open annotation).
  const onClick = useEvent((observation: Observation) => {
    if (!isEditingAnnotation || !activeAnnotation || !activeField) {
      return;
    }

    const currentTarget = activeAnnotation.target;
    const newTarget = getAnnotationTargetFromObservation(observation, {
      chartConfig,
    });

    if (isEqual(currentTarget, newTarget)) {
      return;
    }

    const otherAnnotationWithSameTarget = annotations.find(
      (a) =>
        a.key !== activeField && matchesAnnotationTarget(observation, a.target)
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

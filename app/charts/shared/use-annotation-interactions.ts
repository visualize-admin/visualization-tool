import isEqual from "lodash/isEqual";

import {
  getAnnotationTargetsFromObservation,
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

      const activeNewTargets = getAnnotationTargetsFromObservation(
        observation,
        {
          chartConfig,
          segment,
        }
      );

      for (const annotation of annotations) {
        const currentTargets = annotation.targets;
        const newTargets =
          annotation.key !== activeField
            ? getAnnotationTargetsFromObservation(observation, {
                chartConfig,
                segment,
              })
            : activeNewTargets;

        if (isEqual(currentTargets, newTargets)) {
          return;
        }
      }

      dispatch({
        type: "CHART_ANNOTATION_TARGETS_CHANGE",
        value: {
          key: activeField,
          targets: activeNewTargets,
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

import { useCallback } from "react";

import { useInteraction } from "@/charts/shared/use-interaction";
import { Annotation, AnnotationTarget, ChartConfig } from "@/config-types";
import {
  extractSingleFilters,
  getChartConfig,
  getChartConfigFilters,
} from "@/config-utils";
import { isAnnotationField } from "@/configurator/components/chart-annotations/utils";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { Observation } from "@/domain/data";

export const useIsEditingAnnotation = () => {
  const [state] = useConfiguratorState();
  const { activeField } = getChartConfig(state);

  return isAnnotationField(activeField) && isConfiguring(state);
};

export const useGetAnnotationRenderState = () => {
  const [interaction] = useInteraction();
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField } = chartConfig;
  const isEditing = useIsEditingAnnotation();

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
        const matches = matchesAnnotationTarget(observation, a.targets);

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
        (a) =>
          a.key !== activeField &&
          matchesAnnotationTarget(observation, a.targets)
      );
      const isActive = annotation?.key === activeField;

      let focused =
        isEditing &&
        ((interactionMatches && !targetsOtherAnnotations) || isActive);

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

export const getAnnotationTargetsFromObservation = (
  observation: Observation,
  {
    chartConfig,
    segment,
  }: {
    chartConfig: ChartConfig;
    /** This is needed for stacked charts, where the segment value is not in the observation,
     *  but in the getSegment function.
     */
    segment?: string;
  }
): Annotation["targets"] => {
  const filters = getChartConfigFilters(chartConfig.cubes, { joined: true });
  const singleFilters = extractSingleFilters(filters);
  const targets: Annotation["targets"] = Object.entries(singleFilters).map(
    ([componentId, value]) => ({
      componentId,
      value: `${value.value}`,
    })
  );

  switch (chartConfig.chartType) {
    case "column":
    case "line":
    case "area": {
      const xComponentId = chartConfig.fields.x.componentId;
      if (xComponentId) {
        targets.push({
          componentId: xComponentId,
          value: `${observation[xComponentId]}`,
        });
      }

      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId && segment) {
        const value =
          segment ?? observation[`${segmentComponentId}/__iri__`] ?? "";
        targets.push({
          componentId: segmentComponentId,
          value,
        });
      }

      break;
    }
    case "bar": {
      const yComponentId = chartConfig.fields.y.componentId;
      if (yComponentId) {
        targets.push({
          componentId: yComponentId,
          value: `${observation[yComponentId]}`,
        });
      }

      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId && segment) {
        const value =
          segment ?? observation[`${segmentComponentId}/__iri__`] ?? "";
        targets.push({
          componentId: segmentComponentId,
          value,
        });
      }

      break;
    }
    case "scatterplot": {
      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId && segment) {
        const value =
          segment ?? observation[`${segmentComponentId}/__iri__`] ?? "";
        targets.push({
          componentId: segmentComponentId,
          value,
        });
      }

      break;
    }
    case "pie": {
      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId && segment) {
        const value =
          segment ?? observation[`${segmentComponentId}/__iri__`] ?? "";
        targets.push({
          componentId: segmentComponentId,
          value,
        });
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

  return targets;
};

export const matchesAnnotationTarget = (
  observation: Observation,
  targets: AnnotationTarget[]
) => {
  if (targets.length === 0) {
    return false;
  }

  for (const target of targets) {
    const observationValue = observation[`${target.componentId}/__iri__`];

    if (observationValue !== target.value) {
      return false;
    }
  }

  return true;
};

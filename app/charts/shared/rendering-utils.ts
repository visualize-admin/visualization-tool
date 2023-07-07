import React from "react";

import { AnimationField, InteractiveFiltersConfig } from "@/configurator";
import { Observation } from "@/domain/data";

export const TRANSITION_DURATION = 400;

/** Use to create a unique key for rendering the shapes.
 * It's important to animate them correctly when using d3.
 */
export const useRenderingKeyVariable = (
  dimensionKeys: string[],
  interactiveFiltersConfig: InteractiveFiltersConfig,
  animationField: AnimationField | undefined
) => {
  const filterableDimensionKeys = React.useMemo(() => {
    const keysToRemove: string[] = [];

    if (interactiveFiltersConfig) {
      const { dataFilters, legend, timeRange } = interactiveFiltersConfig;

      if (dataFilters.componentIris.length > 0) {
        keysToRemove.push(...dataFilters.componentIris);
      }

      if (legend.componentIri) {
        keysToRemove.push(legend.componentIri);
      }

      if (timeRange.componentIri) {
        keysToRemove.push(timeRange.componentIri);
      }
    }

    if (animationField) {
      keysToRemove.push(animationField.componentIri);
    }

    return dimensionKeys.filter((d) => !keysToRemove.includes(d));
  }, [dimensionKeys, interactiveFiltersConfig, animationField]);

  const getRenderingKey = React.useCallback(
    (d: Observation) => {
      return filterableDimensionKeys.map((key) => d[key]).join("");
    },
    [filterableDimensionKeys]
  );

  return getRenderingKey;
};

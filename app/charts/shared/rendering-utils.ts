import React from "react";

import {
  AnimationField,
  Filters,
  InteractiveFiltersConfig,
} from "@/configurator";
import { Observation, isStandardErrorDimension } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

/** Use to create a unique key for rendering the shapes.
 * It's important to animate them correctly when using d3.
 */
export const useRenderingKeyVariable = (
  dimensions: DimensionMetadataFragment[],
  filters: Filters,
  interactiveFiltersConfig: InteractiveFiltersConfig,
  animationField: AnimationField | undefined
) => {
  const filterableDimensionKeys = React.useMemo(() => {
    // Remove single filters from the rendering key, as we want to be able
    // to animate them.
    const keysToRemove = Object.entries(filters)
      .filter((d) => d[1].type === "single")
      .map((d) => d[0]);

    if (interactiveFiltersConfig) {
      const { dataFilters, legend } = interactiveFiltersConfig;

      if (dataFilters.componentIris.length > 0) {
        keysToRemove.push(...dataFilters.componentIris);
      }

      if (legend.componentIri) {
        keysToRemove.push(legend.componentIri);
      }
    }

    if (animationField) {
      keysToRemove.push(animationField.componentIri);
    }

    return dimensions
      .filter((d) => !isStandardErrorDimension(d))
      .map((d) => d.iri)
      .filter((d) => !keysToRemove.includes(d));
  }, [dimensions, filters, interactiveFiltersConfig, animationField]);

  /** Optionally provide an option to pass a segment to the key.
   * This is useful for stacked charts, where we can't easily
   * access the segment value from the data.
   */
  const getRenderingKey = React.useCallback(
    (d: Observation, segment: string = "") => {
      return filterableDimensionKeys
        .map((key) => d[key])
        .concat(segment)
        .join("");
    },
    [filterableDimensionKeys]
  );

  return getRenderingKey;
};

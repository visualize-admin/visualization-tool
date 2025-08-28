import { Filters, SingleFilters } from "@/config-types";
import { isJoinById } from "@/graphql/join";

export type PreparedFilter = {
  cubeIri: string;
  interactiveFilters: Filters;
  unmappedFilters: SingleFilters;
  mappedFilters: Filters;
  componentIdResolution: Record<string, string>;
};

export type GroupedPreparedFilter = {
  dimensionId: string;
  entries: GroupedPreparedFilterEntry[];
};

export type GroupedPreparedFilterEntry = {
  cubeIri: string;
  resolvedDimensionId: string;
  interactiveFilters: Filters;
  componentIdResolution: Record<string, string>;
};

export const groupPreparedFiltersByDimension = (
  preparedFilters: PreparedFilter[],
  componentIds: string[]
): GroupedPreparedFilter[] => {
  const groups: Record<string, GroupedPreparedFilterEntry[]> = {};

  for (const preparedFilter of preparedFilters) {
    for (const id of componentIds) {
      const resolved = preparedFilter.componentIdResolution[id];

      if (isJoinById(id)) {
        if (!resolved) {
          continue;
        }

        groups[id] = groups[id] ?? [];
        groups[id].push({
          cubeIri: preparedFilter.cubeIri,
          resolvedDimensionId: resolved,
          interactiveFilters: preparedFilter.interactiveFilters,
          componentIdResolution: preparedFilter.componentIdResolution,
        });
      } else {
        if (resolved === id) {
          groups[id] = groups[id] ?? [];
          groups[id].push({
            cubeIri: preparedFilter.cubeIri,
            resolvedDimensionId: id,
            interactiveFilters: preparedFilter.interactiveFilters,
            componentIdResolution: preparedFilter.componentIdResolution,
          });
        }
      }
    }
  }

  return Object.entries(groups).map(([dimensionId, entries]) => ({
    dimensionId,
    entries,
  }));
};

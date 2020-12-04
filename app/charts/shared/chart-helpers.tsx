import { useMemo } from "react";
import { isNumber } from "util";
import { Filters } from "../../configurator";
import { ObservationValue, Observation } from "../../domain/data";
import { InteractiveFiltersState } from "./use-interactive-filters";

export const useQueryFilters = ({
  filters,
  interactiveFiltersIsActive,
}: {
  filters: Filters;
  interactiveFiltersIsActive: boolean;
}): Filters => {
  const queryFilters = useMemo(() => {
    const filtersWithoutInteractiveFilters = Object.keys(filters).reduce(
      (notSkippedFilters, key) => {
        if (filters[key].skip) {
          return { ...notSkippedFilters };
        } else if (!filters[key].skip) {
          return { ...notSkippedFilters, [key]: filters[key] };
        } else {
          return { ...notSkippedFilters, [key]: filters[key] };
        }
      },
      {}
    );

    return interactiveFiltersIsActive
      ? filtersWithoutInteractiveFilters
      : filters;
  }, [filters, interactiveFiltersIsActive]);
  return queryFilters;
};

// Prepare data used in charts.
// Different than the full dataset because
// interactive filters may be applied.
export const usePreparedData = ({
  timeFilterActive,
  legendFilterActive,
  sortedData,
  interactiveFilters,
  getX,
  getSegment,
}: {
  timeFilterActive?: boolean;
  legendFilterActive?: boolean;
  sortedData: Observation[];
  interactiveFilters: InteractiveFiltersState;
  getX?: (d: Observation) => Date;
  getSegment?: (d: Observation) => string;
}) => {
  const { from, to } = interactiveFilters.time;
  const { categories } = interactiveFilters;
  const activeInteractiveFilters = Object.keys(categories);

  // FIXME: we should compare timestamps, how does this even work?
  const preparedData = useMemo(() => {
    if (!timeFilterActive && !legendFilterActive) {
      return sortedData;
    } else if (timeFilterActive && !legendFilterActive && getX) {
      return from && to
        ? sortedData.filter(
            (d) => from && to && getX(d) >= from && getX(d) <= to
          )
        : sortedData;
    } else if (!timeFilterActive && legendFilterActive && getSegment) {
      return sortedData.filter(
        (d) => !activeInteractiveFilters.includes(getSegment(d))
      );
    } else if (timeFilterActive && legendFilterActive && getX && getSegment) {
      return from && to && activeInteractiveFilters
        ? sortedData
            .filter((d) => from && to && getX(d) >= from && getX(d) <= to)
            .filter((d) => !activeInteractiveFilters.includes(getSegment(d)))
        : sortedData;
    } else {
      return sortedData;
    }
  }, [
    activeInteractiveFilters,
    from,
    getSegment,
    getX,
    legendFilterActive,
    sortedData,
    timeFilterActive,
    to,
  ]);
  return preparedData;
};

// Helper to pivot a dataset to a wider format (used in stacked charts)
export const getWideData = ({
  xKey,
  groupedMap,
  getSegment,
  getY,
}: {
  xKey: string;
  groupedMap: Map<string, Record<string, ObservationValue>[]>;
  getSegment: (d: Observation) => string;
  getY: (d: Observation) => number;
}) => {
  const wideArray = [];
  for (const [key, values] of groupedMap) {
    const keyObject = values.reduce(
      (obj, cur) => {
        const currentKey = getSegment(cur);
        const currentY = isNumber(getY(cur)) ? getY(cur) : 0;
        const total = currentY + (obj.total as number);
        return {
          ...obj,
          [currentKey]: getY(cur),
          total,
        };
      },
      { total: 0 }
    );
    wideArray.push({
      ...keyObject,
      [xKey]: key,
    });
  }
  return wideArray;
};

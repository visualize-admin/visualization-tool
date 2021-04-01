import { useMemo } from "react";
import { ChartConfig, Filters, FilterValueSingle } from "../../configurator";
import { isNumber } from "../../configurator/components/ui-helpers";
import { Observation, ObservationValue } from "../../domain/data";
import {
  InteractiveFiltersState,
  useInteractiveFilters,
} from "./use-interactive-filters";

// Prepare filters used in data query:
// merges "hard" data filters (in-editor, publisher-defined)
// and "interactive" data filters (user-defined), if applicable
export const useQueryFilters = ({
  chartConfig,
  interactiveFiltersIsActive,
}: {
  chartConfig: ChartConfig;
  interactiveFiltersIsActive: boolean;
}): Filters | FilterValueSingle => {
  const [IFstate] = useInteractiveFilters();
  const { filters } = chartConfig;
  if (chartConfig.chartType !== "table") {
    const queryFilters = interactiveFiltersIsActive
      ? { ...filters, ...IFstate.dataFilters }
      : filters;

    return queryFilters;
  } else {
    return filters;
  }
};

// Prepare data used in charts.
// Different than the full dataset because
// interactive filters may be applied (legend + brush)
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

  const preparedData = useMemo(() => {
    if (!timeFilterActive && !legendFilterActive) {
      return sortedData;
    } else if (timeFilterActive && !legendFilterActive && getX) {
      return from && to
        ? sortedData.filter(
            (d) =>
              from &&
              to &&
              getX(d).getTime() >= from.getTime() &&
              getX(d).getTime() <= to.getTime()
          )
        : sortedData;
    } else if (!timeFilterActive && legendFilterActive && getSegment) {
      return sortedData.filter(
        (d) => !activeInteractiveFilters.includes(getSegment(d))
      );
    } else if (timeFilterActive && legendFilterActive && getX && getSegment) {
      return from && to && activeInteractiveFilters
        ? sortedData
            .filter(
              (d) =>
                from &&
                to &&
                getX(d).getTime() >= from.getTime() &&
                getX(d).getTime() <= to.getTime()
            )
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
  getY: (d: Observation) => number | null;
}) => {
  const wideArray = [];
  for (const [key, values] of groupedMap) {
    const keyObject = values.reduce(
      (obj, cur) => {
        const currentKey = getSegment(cur);
        const currentY = getY(cur);
        const total = currentY ?? 0 + (obj.total as number);
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

const SlugRe = /\W+/g;
export const getSlugifiedIri = (iri: string) => iri.replace(SlugRe, "_");

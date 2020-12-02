import { isNumber } from "util";
import { ObservationValue, Observation } from "../../domain/data";
import { InteractiveFiltersState } from "./use-interactive-filters";

// Prepare data used in charts.
// Different than the whole dataset because
// interactive filters may be applied.
export const prepareData = ({
  timeFilterActive,
  legendFilterActive,
  sortedData,
  interactiveFilters,
  getX,
  getSegment,
}: {
  timeFilterActive: boolean | undefined;
  legendFilterActive: boolean | undefined;
  sortedData: Observation[];
  interactiveFilters: InteractiveFiltersState;
  getX: (d: Observation) => Date;
  getSegment: (d: Observation) => string;
}) => {
  const { from, to } = interactiveFilters.time;
  const { categories } = interactiveFilters;
  const activeInteractiveFilters = Object.keys(categories);

  if (!timeFilterActive && !legendFilterActive) {
    return sortedData;
  } else if (timeFilterActive && !legendFilterActive) {
    return from && to
      ? sortedData.filter((d) => from && to && getX(d) >= from && getX(d) <= to)
      : sortedData;
  } else if (!timeFilterActive && legendFilterActive) {
    return sortedData.filter(
      (d) => !activeInteractiveFilters.includes(getSegment(d))
    );
  } else if (timeFilterActive && legendFilterActive) {
    return from && to && activeInteractiveFilters
      ? sortedData
          .filter((d) => from && to && getX(d) >= from && getX(d) <= to)
          .filter((d) => !activeInteractiveFilters.includes(getSegment(d)))
      : sortedData;
  } else {
    return sortedData;
  }
};
export const applyLegendInteractiveFilter = ({
  legendFilterActive,
  preparedData,
  activeInteractiveFilters,
  getSegment,
}: {
  legendFilterActive: boolean | undefined;
  preparedData: Observation[];
  activeInteractiveFilters: string[];
  getSegment: (d: Observation) => string;
}) => {
  if (!legendFilterActive) {
    return preparedData;
  } else {
    return preparedData.filter(
      (d) => !activeInteractiveFilters.includes(getSegment(d))
    );
  }
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

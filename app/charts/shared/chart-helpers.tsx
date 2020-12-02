import { isNumber } from "util";
import { ObservationValue, Observation } from "../../domain/data";
import { InteractiveFiltersState } from "./use-interactive-filters";

// Prepare data used in charts.
// Different than the whole dataset because
// interactive filters may be applied.
export const prepareData = ({
  timeFilterActive,
  sortedData,
  interactiveFilters,
  getX,
}: {
  timeFilterActive: boolean | undefined;
  sortedData: Observation[];
  interactiveFilters: InteractiveFiltersState;
  getX: (d: Observation) => Date;
}) => {
  if (!timeFilterActive) {
    return sortedData;
  } else {
    const { from, to } = interactiveFilters.time;
    return from && to
      ? sortedData.filter((d) => from && to && getX(d) >= from && getX(d) <= to)
      : sortedData;
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

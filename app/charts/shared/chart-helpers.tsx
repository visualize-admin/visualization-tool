import { sum } from "d3";
import { merge, omitBy } from "lodash";
import { useMemo } from "react";
import { ChartConfig, Filters, FilterValueSingle } from "../../configurator";
import { FIELD_VALUE_NONE } from "../../configurator/constants";
import { Observation, ObservationValue } from "../../domain/data";
import { DimensionMetaDataFragment } from "../../graphql/query-hooks";
import {
  InteractiveFiltersState,
  useInteractiveFilters,
} from "./use-interactive-filters";

export type QueryFilters = Filters | FilterValueSingle;

// Prepare filters used in data query:
// - merges publisher data filters and interactive data filters (user-defined),
//   if applicable
// - removes none values since they should not be sent as part of the GraphQL query
export const prepareQueryFilters = (
  staticConfig: ChartConfig,
  IFState: InteractiveFiltersState
) => {
  const interactiveFiltersIsActive =
    staticConfig.interactiveFiltersConfig?.dataFilters.active;
  const { filters } = staticConfig;
  let res;
  if (staticConfig.chartType !== "table") {
    const queryFilters = interactiveFiltersIsActive
      ? { ...filters, ...IFState.dataFilters }
      : filters;

    res = queryFilters;
  } else {
    res = filters;
  }
  res = omitBy(
    res,
    (x) => x.type === "single" && x.value === FIELD_VALUE_NONE
  ) as typeof filters;

  return res;
};

export const useQueryFilters = ({
  chartConfig,
}: {
  chartConfig: ChartConfig;
}): QueryFilters => {
  const [IFState] = useInteractiveFilters();

  return useMemo(
    () => prepareQueryFilters(chartConfig, IFState),
    [chartConfig, IFState]
  );
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
}): { [key: string]: ObservationValue }[] => {
  const wideArray = [];
  for (const [key, values] of groupedMap) {
    let obj: { [key: string]: ObservationValue } = {
      [xKey]: key,
      total: sum(values, getY),
    };

    for (const value of values) {
      obj[getSegment(value)] = getY(value);
    }

    wideArray.push(obj);
  }
  return wideArray;
};

const SlugRe = /\W+/g;
export const getSlugifiedIri = (iri: string) => iri.replace(SlugRe, "_");

export const getLabelWithUnit = (
  dimension: DimensionMetaDataFragment
): string => {
  return dimension.unit
    ? `${dimension.label} (${dimension.unit})`
    : dimension.label;
};



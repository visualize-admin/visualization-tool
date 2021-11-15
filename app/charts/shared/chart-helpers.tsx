import { group, InternMap, sum } from "d3";
import { omitBy } from "lodash";
import { useCallback, useMemo } from "react";
import {
  ChartConfig,
  Filters,
  FilterValueSingle,
  ImputationType,
  isAreaConfig,
} from "../../configurator";
import { parseDate } from "../../configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "../../configurator/constants";
import { Observation } from "../../domain/data";
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
  sortedData: Array<Observation>;
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

// retrieving variables
export const useNumericVariable = (
  key: string
): ((d: Observation) => number) => {
  const getVariable = useCallback((d: Observation) => Number(d[key]), [key]);

  return getVariable;
};

export const useOptionalNumericVariable = (
  key: string
): ((d: Observation) => number | null) => {
  const getVariable = useCallback(
    (d: Observation) => (d[key] !== null ? Number(d[key]) : null),
    [key]
  );

  return getVariable;
};

export const useStringVariable = (
  key: string
): ((d: Observation) => string) => {
  const getVariable = useCallback((d: Observation) => `${d[key]}`, [key]);

  return getVariable;
};

export const useTemporalVariable = (
  key: string
): ((d: Observation) => Date) => {
  const getVariable = useCallback(
    (d: Observation) => parseDate(`${d[key]}`),
    [key]
  );

  return getVariable;
};

export const useSegment = (
  segmentKey: string | undefined
): ((d: Observation) => string) => {
  const getSegment = useCallback(
    (d: Observation): string => (segmentKey ? `${d[segmentKey]}` : "segment"),
    [segmentKey]
  );

  return getSegment;
};

// Helper to pivot a dataset to a wider format
export const useWideData = ({
  data,
  imputationType = "none",
  xKey,
  segments,
  getSegment,
  getX,
  getY,
}: {
  data: Array<Observation>;
  imputationType?: ImputationType;
  xKey: string;
  segments?: Array<string>;
  getSegment: (d: Observation) => string;
  getX?: (d: Observation) => Date;
  getY: (d: Observation) => number | null;
}): Array<Observation> => {
  const wideArray = [];

  const groupedMap = useMemo(() => {
    return group(data, (d) => d[xKey] as string);
  }, [data, xKey]);

  const groupedMapEntries = useMemo(() => {
    return [...groupedMap.entries()];
  }, [groupedMap]);

  const groupedMapValues = useMemo(() => {
    return [...groupedMap.values()];
  }, [groupedMap]);

  let baseObservation: Observation = {};
  let imputeMissingValue:
    | ((segment: string, currentTime: number, cutoff: number) => number)
    | undefined = undefined;

  switch (imputationType) {
    case "none":
      for (const [key, values] of groupedMap) {
        let observation: Observation = {
          [xKey]: key,
          total: sum(values, getY),
        };

        for (const value of values) {
          observation[getSegment(value)] = getY(value);
        }

        wideArray.push(observation);
      }

      return wideArray;
    case "zeros":
      baseObservation = Object.assign(
        {},
        // Due to the fact we are using stackOffsetDiverging to draw stacked charts,
        // this workaround prevents stacking zero values at zero, which makes segments
        // overlap with each other.
        ...segments!.map((segment) => ({ [segment]: Number.MIN_VALUE }))
      );
      break;
    case "linear":
      const previousCache: { [key: string]: Observation | undefined } = {};
      const nextCache: { [key: string]: Observation | undefined } = {};

      const getPrevious = (
        segment: string,
        cutoff: number
      ): Observation | undefined => {
        return groupedMapValues
          .slice(0, cutoff)
          .flat()
          .reverse()
          .find((d) => getSegment(d) === segment);
      };

      const getNext = (
        segment: string,
        cutoff: number
      ): Observation | undefined => {
        return groupedMapValues
          .slice(cutoff + 1)
          .flat()
          .find((d) => getSegment(d) === segment);
      };

      imputeMissingValue = (
        segment: string,
        currentTime: number,
        cutoff: number
      ) => {
        const nextCached = nextCache[segment];

        if (nextCached) {
          if (currentTime > getX!(nextCached).getTime()) {
            previousCache[segment] = nextCached;
            nextCache[segment] = getNext(segment, cutoff);
          }
        }

        const previous = previousCache[segment] || getPrevious(segment, cutoff);

        if (previous) {
          const previousTime = getX!(previous).getTime();
          const previousValue = getY(previous) as number;
          const next = nextCache[segment] || getNext(segment, cutoff);

          if (next) {
            const nextTime = getX!(next).getTime();
            const nextValue = getY(next) as number;
            const k = (currentTime - previousTime) / (nextTime - previousTime);

            return previousValue + (nextValue - previousValue) * k;
          }
        }

        return 0;
      };
      break;
    default:
      const _exhaustiveCheck: never = imputationType;
      return _exhaustiveCheck;
  }

  for (let i = 0; i < groupedMap.size; i++) {
    const [date, values] = groupedMapEntries[i];

    let observation = {
      ...baseObservation,
      [xKey]: date,
      total: sum(values, getY),
    };

    for (const value of values) {
      observation[getSegment(value)] = getY(value);
    }

    if (values.length !== segments!.length && imputeMissingValue) {
      const currentTime = new Date(date).getTime();
      const segmentsToFill = segments!.filter(
        (d) => !Object.keys(observation).includes(d)
      );

      for (const segment of segmentsToFill) {
        observation[segment] = imputeMissingValue(segment, currentTime, i);
      }
    }

    wideArray.push(observation);
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

export const checkForMissingValuesInSegments = (
  groupedMap: InternMap<string, Array<Observation>>,
  segments: Array<string>
): boolean => {
  for (const value of groupedMap.values()) {
    if (value.length !== segments.length) {
      return true;
    }
  }

  return false;
};

export const useImputationNeeded = ({
  chartConfig,
  data,
}: {
  chartConfig: ChartConfig;
  data?: Array<Observation>;
}) => {
  const imputationNeeded = useMemo(() => {
    if (isAreaConfig(chartConfig) && data) {
      const getSegment = (d: Observation): string =>
        chartConfig.fields.segment
          ? (d[chartConfig.fields.segment.componentIri] as string)
          : "segment";

      return checkForMissingValuesInSegments(
        group(
          data,
          (d: Observation) => d[chartConfig.fields.x.componentIri] as string
        ),
        [...new Set(data.map((d) => getSegment(d)))]
      );
    }
  }, [chartConfig, data]);

  return imputationNeeded;
};

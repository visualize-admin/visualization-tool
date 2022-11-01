import { group, InternMap, sum } from "d3";
import omitBy from "lodash/omitBy";
import overEvery from "lodash/overEvery";
import { useCallback, useMemo } from "react";

import {
  imputeTemporalLinearSeries,
  interpolateZerosValue,
} from "@/charts/shared/imputation";
import {
  InteractiveFiltersState,
  useInteractiveFilters,
} from "@/charts/shared/use-interactive-filters";
import { parseDate } from "@/configurator/components/ui-helpers";
import {
  ChartConfig,
  Filters,
  FilterValueSingle,
  ImputationType,
  isAreaConfig,
} from "@/configurator/config-types";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export type QueryFilters = Filters | FilterValueSingle;

// Prepare filters used in data query:
// - merges publisher data filters and interactive data filters (user-defined),
//   if applicable
// - removes none values since they should not be sent as part of the GraphQL query
export const prepareQueryFilters = (
  { chartType, filters, interactiveFiltersConfig }: ChartConfig,
  state: InteractiveFiltersState
): Filters => {
  let res: QueryFilters;
  const dataFiltersActive = interactiveFiltersConfig?.dataFilters.active;

  if (chartType !== "table") {
    const queryFilters = dataFiltersActive
      ? { ...filters, ...state.dataFilters }
      : filters;
    res = queryFilters;
  } else {
    res = filters;
  }

  res = omitBy(res, (x) => x.type === "single" && x.value === FIELD_VALUE_NONE);

  return res;
};

export const useQueryFilters = ({
  chartConfig,
}: {
  chartConfig: ChartConfig;
}): QueryFilters => {
  const [IFState] = useInteractiveFilters();

  return useMemo(() => {
    return prepareQueryFilters(chartConfig, IFState);
  }, [chartConfig, IFState]);
};

type ValuePredicate = (v: any) => boolean;

export const usePlottableData = ({
  data,
  plotters,
}: {
  data: Observation[];
  plotters: ((d: Observation) => unknown | null)[];
}) => {
  const isPlottable = useCallback(
    (d: Observation) => {
      for (let p of plotters) {
        const v = p(d);
        if (v === undefined || v === null) {
          return false;
        }
      }
      return true;
    },
    [plotters]
  );
  return useMemo(() => data.filter(isPlottable), [data, isPlottable]);
};

// Prepare data used in charts.
// Different than the full dataset because
// interactive filters may be applied (legend + brush)
export const usePreparedData = ({
  timeRangeFilterActive,
  legendFilterActive,
  sortedData,
  interactiveFilters,
  getX,
  getSegment,
}: {
  timeRangeFilterActive?: boolean;
  legendFilterActive?: boolean;
  sortedData: Array<Observation>;
  interactiveFilters: InteractiveFiltersState;
  getX?: (d: Observation) => Date;
  getSegment?: (d: Observation) => string;
}) => {
  const { from, to } = interactiveFilters.timeRange;
  const { categories } = interactiveFilters;
  const activeInteractiveFilters = Object.keys(categories);

  const allFilters = useMemo(() => {
    const timeFilter: ValuePredicate | null =
      getX && from && to && timeRangeFilterActive
        ? (d: Observation) =>
            getX(d).getTime() >= from.getTime() &&
            getX(d).getTime() <= to.getTime()
        : null;
    const legendFilter: ValuePredicate | null =
      legendFilterActive && getSegment
        ? (d: Observation) => !activeInteractiveFilters.includes(getSegment(d))
        : null;
    return overEvery([legendFilter, timeFilter].filter(truthy));
  }, [
    activeInteractiveFilters,
    from,
    getSegment,
    getX,
    legendFilterActive,
    timeRangeFilterActive,
    to,
  ]);

  const preparedData = useMemo(() => {
    return sortedData.filter(allFilters);
  }, [allFilters, sortedData]);
  return preparedData;
};

export const makeUseParsedVariable =
  <T extends unknown>(parser: (d: Observation[string]) => T) =>
  (key: string) => {
    return useCallback((d: Observation) => parser(d[key]), [key]);
  };

// retrieving variables
export const useNumericVariable = makeUseParsedVariable((x) => Number(x));
export const useOptionalNumericVariable = makeUseParsedVariable((x) =>
  x !== null ? Number(x) : null
);
export const useStringVariable = makeUseParsedVariable((x) =>
  x !== null ? `${x}` : ""
);
export const useTemporalVariable = makeUseParsedVariable((x) =>
  parseDate(`${x}`)
);

const getSegment =
  (segmentKey: string | undefined) =>
  (d: Observation): string =>
    segmentKey ? `${d[segmentKey]}` : "segment";

export const useSegment = (
  segmentKey: string | undefined
): ((d: Observation) => string) => {
  return useCallback(
    (d: Observation) => getSegment(segmentKey)(d),
    [segmentKey]
  );
};

// Stacking helpers.
// Modified from d3 source code to treat 0s as positive values and stack them correctly
// in area charts.
export const stackOffsetDivergingPositiveZeros = (
  series: any,
  order: any
): void => {
  const n = series.length;

  if (!(n > 0)) return;

  for (let i, j = 0, d, dy, yp, yn, m = series[order[0]].length; j < m; ++j) {
    for (yp = yn = 0, i = 0; i < n; ++i) {
      if ((dy = (d = series[order[i]][j])[1] - d[0]) >= 0) {
        (d[0] = yp), (d[1] = yp += dy);
      } else {
        (d[1] = yn), (d[0] = yn += dy);
      }
    }
  }
};

// Helper to pivot a dataset to a wider format.
// Currently, imputation is only applicable to temporal charts (specifically, stacked area charts).
export const getWideData = ({
  dataGroupedByX,
  xKey,
  getY,
  allSegments,
  getSegment,
  imputationType = "none",
}: {
  dataGroupedByX: InternMap<string, Array<Observation>>;
  xKey: string;
  getY: (d: Observation) => number | null;
  allSegments?: Array<string>;
  getSegment: (d: Observation) => string;
  imputationType?: ImputationType;
}) => {
  switch (imputationType) {
    case "linear":
      if (allSegments) {
        const dataGroupedByXEntries = [...dataGroupedByX.entries()];
        const dataGroupedByXWithImputedValues: Array<{
          [key: string]: number;
        }> = Array.from({ length: dataGroupedByX.size }, () => ({}));

        for (const segment of allSegments) {
          const imputedSeriesValues = imputeTemporalLinearSeries({
            dataSortedByX: dataGroupedByXEntries.map(([date, values]) => {
              const observation = values.find((d) => getSegment(d) === segment);

              return {
                date: new Date(date),
                value: observation ? getY(observation) : null,
              };
            }),
          });

          for (let i = 0; i < imputedSeriesValues.length; i++) {
            dataGroupedByXWithImputedValues[i][segment] =
              imputedSeriesValues[i].value;
          }
        }

        return getBaseWideData({
          dataGroupedByX,
          xKey,
          getY,
          getSegment,
          getOptionalObservationProps: (i) =>
            allSegments.map((d) => ({
              [d]: dataGroupedByXWithImputedValues[i][d],
            })),
        });
      }
    case "zeros":
      if (allSegments) {
        return getBaseWideData({
          dataGroupedByX,
          xKey,
          getY,
          getSegment,
          getOptionalObservationProps: () =>
            allSegments.map((d) => ({
              [d]: interpolateZerosValue(),
            })),
        });
      }
    case "none":
    default:
      return getBaseWideData({ dataGroupedByX, xKey, getY, getSegment });
  }
};

const getBaseWideData = ({
  dataGroupedByX,
  xKey,
  getY,
  getSegment,
  getOptionalObservationProps = () => [],
}: {
  dataGroupedByX: InternMap<string, Array<Observation>>;
  xKey: string;
  getY: (d: Observation) => number | null;
  getSegment: (d: Observation) => string;
  getOptionalObservationProps?: (
    datumIndex: number
  ) => Array<{ [key: string]: number }>;
}): Array<Observation> => {
  const wideData = [];
  const sortedDataGroupedByXEntries = [...dataGroupedByX.entries()].sort();

  for (let i = 0; i < dataGroupedByX.size; i++) {
    const [date, values] = sortedDataGroupedByXEntries[i];

    const observation: Observation = Object.assign(
      {
        [xKey]: date,
        total: sum(values, getY),
      },
      ...getOptionalObservationProps(i),
      ...values.map((d) => ({ [getSegment(d)]: getY(d) }))
    );

    wideData.push(observation);
  }

  return wideData;
};

const SlugRe = /\W+/g;
export const getSlugifiedIri = (iri: string) => iri.replace(SlugRe, "_");

export const getLabelWithUnit = (
  dimension: DimensionMetadataFragment
): string => {
  return dimension.unit
    ? `${dimension.label} (${dimension.unit})`
    : dimension.label;
};

export const checkForMissingValuesInSegments = (
  dataGroupedByX: InternMap<string, Array<Observation>>,
  segments: Array<string>
): boolean => {
  for (const value of dataGroupedByX.values()) {
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
}): boolean => {
  const imputationNeeded = useMemo(() => {
    if (isAreaConfig(chartConfig) && data) {
      return checkForMissingValuesInSegments(
        group(data, (d) => d[chartConfig.fields.x.componentIri] as string),
        [
          ...new Set(
            data.map((d) =>
              getSegment(chartConfig.fields.segment?.componentIri)(d)
            )
          ),
        ]
      );
    } else {
      return false;
    }
  }, [chartConfig, data]);

  return imputationNeeded;
};

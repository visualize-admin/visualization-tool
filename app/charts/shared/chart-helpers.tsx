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
  imputeTemporalLinearSeries,
  interpolateZerosValue,
} from "./imputation";
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
  const getVariable = useCallback(
    (d: Observation) => (d[key] !== null ? `${d[key]}` : ""),
    [key]
  );

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
  dimension: DimensionMetaDataFragment
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

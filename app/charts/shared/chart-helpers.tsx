import { group, InternMap, sum } from "d3";
import omitBy from "lodash/omitBy";
import overEvery from "lodash/overEvery";
import uniq from "lodash/uniq";
import { useCallback, useMemo } from "react";

import {
  imputeTemporalLinearSeries,
  interpolateZerosValue,
} from "@/charts/shared/imputation";
import {
  InteractiveFiltersState,
  useInteractiveFilters,
} from "@/charts/shared/use-interactive-filters";
import { InteractiveFiltersTimeSlider } from "@/configurator";
import { parseDate } from "@/configurator/components/ui-helpers";
import {
  ChartConfig,
  ChartType,
  Filters,
  ImputationType,
  InteractiveFiltersConfig,
  InteractiveFiltersDataConfig,
  InteractiveFiltersLegend,
  InteractiveFiltersTimeRange,
  isAreaConfig,
  QueryFilters,
} from "@/configurator/config-types";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { isTemporalDimension, Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

// Prepare filters used in data query:
// - merges publisher data filters and interactive data filters (user-defined),
//   if applicable
// - removes none values since they should not be sent as part of the GraphQL query
export const prepareQueryFilters = (
  chartType: ChartType,
  filters: Filters,
  interactiveFiltersConfig: InteractiveFiltersConfig,
  dataFilters: InteractiveFiltersState["dataFilters"]
): Filters => {
  let queryFilters = filters;
  const { timeSlider } = interactiveFiltersConfig || {};

  if (chartType !== "table" && interactiveFiltersConfig?.dataFilters.active) {
    queryFilters = { ...queryFilters, ...dataFilters };
  }

  queryFilters = omitBy(queryFilters, (v, k) => {
    return (
      (v.type === "single" && v.value === FIELD_VALUE_NONE) ||
      k === timeSlider?.componentIri
    );
  });

  return queryFilters;
};

export const useQueryFilters = ({
  chartConfig,
}: {
  chartConfig: ChartConfig;
}): QueryFilters => {
  const [IFState] = useInteractiveFilters();

  return useMemo(() => {
    return prepareQueryFilters(
      chartConfig.chartType,
      chartConfig.filters,
      chartConfig.interactiveFiltersConfig,
      IFState.dataFilters
    );
  }, [
    chartConfig.chartType,
    chartConfig.filters,
    chartConfig.interactiveFiltersConfig,
    IFState.dataFilters,
  ]);
};

type IFKey = keyof NonNullable<InteractiveFiltersConfig>;

export const getChartConfigComponents = ({
  fields,
  filters,
  interactiveFiltersConfig: IFConfig,
}: ChartConfig) => {
  const fieldIris = Object.values(fields).map((d) => d.componentIri);
  const filterIris = Object.keys(filters);
  const IFKeys = IFConfig ? (Object.keys(IFConfig) as IFKey[]) : [];
  const IFIris: string[] = [];

  if (IFConfig) {
    IFKeys.forEach((k) => {
      const v = IFConfig[k];

      switch (k) {
        case "timeSlider":
          IFIris.push((v as InteractiveFiltersTimeSlider).componentIri);
          break;
        case "legend":
          IFIris.push((v as InteractiveFiltersLegend).componentIri);
          break;
        case "timeRange":
          IFIris.push((v as InteractiveFiltersTimeRange).componentIri);
          break;
        case "dataFilters":
          IFIris.push(...(v as InteractiveFiltersDataConfig).componentIris);
          break;
        default:
          const _exhaustiveCheck: never = k;
          return _exhaustiveCheck;
      }
    });
  }

  return uniq([...fieldIris, ...filterIris, ...IFIris]);
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    plotters
  );

  return useMemo(() => data.filter(isPlottable), [data, isPlottable]);
};

type ValuePredicate = (v: any) => boolean;

/** Prepares the data to be used in charts, taking interactive filters into account. */
export const useDataAfterInteractiveFilters = ({
  sortedData,
  interactiveFiltersConfig,
  getX,
  getSegment,
}: {
  sortedData: Observation[];
  interactiveFiltersConfig: InteractiveFiltersConfig;
  getX?: (d: Observation) => Date;
  getSegment?: (d: Observation) => string;
}): {
  /** Data to be used in the chart. */
  preparedData: Observation[];
  /** Data to be used to compute the scales.
   * They are different when a time slider is present, since the scales
   * should be computed using all the data, to prevent them from changing
   * when the time slider is moved, while the chart should only show the data
   * corresponding to the selected time.*/
  scalesData: Observation[];
} => {
  const [IFState] = useInteractiveFilters();

  // time range
  const fromTime = IFState.timeRange.from?.getTime();
  const toTime = IFState.timeRange.to?.getTime();

  // time slider
  const getTime = useTemporalVariable(
    interactiveFiltersConfig?.timeSlider.componentIri || ""
  );
  const timeSliderValue = IFState.timeSlider.value;

  // legend
  const legendItems = Object.keys(IFState.categories);

  const allFilters = useMemo(() => {
    const timeRangeFilter =
      getX && fromTime && toTime && interactiveFiltersConfig?.timeRange.active
        ? (d: Observation) => {
            const time = getX(d).getTime();
            return time >= fromTime && time <= toTime;
          }
        : null;
    const timeSliderFilter =
      interactiveFiltersConfig?.timeSlider.componentIri && timeSliderValue
        ? (d: Observation) => {
            return getTime(d).getTime() === timeSliderValue.getTime();
          }
        : null;
    const legendFilter =
      interactiveFiltersConfig?.legend.active && getSegment
        ? (d: Observation) => {
            return !legendItems.includes(getSegment(d));
          }
        : null;

    return overEvery(
      (
        [
          timeRangeFilter,
          timeSliderFilter,
          legendFilter,
        ] as (ValuePredicate | null)[]
      ).filter(truthy)
    );
  }, [
    getX,
    fromTime,
    toTime,
    interactiveFiltersConfig?.timeRange.active,
    interactiveFiltersConfig?.timeSlider.componentIri,
    interactiveFiltersConfig?.legend.active,
    timeSliderValue,
    getSegment,
    getTime,
    legendItems,
  ]);

  const preparedData = useMemo(() => {
    return sortedData.filter(allFilters);
  }, [allFilters, sortedData]);

  const timeSliderFilterPresent = !!(
    interactiveFiltersConfig?.timeSlider.componentIri && timeSliderValue
  );

  const scalesData = timeSliderFilterPresent ? sortedData : preparedData;

  return { preparedData, scalesData };
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
    const [k, v] = sortedDataGroupedByXEntries[i];

    const observation: Observation = Object.assign(
      {
        [xKey]: k,
        [`${xKey}/__iri__`]: v[0][`${xKey}/__iri__`],
        total: sum(v, getY),
      },
      ...getOptionalObservationProps(i),
      ...v
        // Sorting the values in case of multiple values for the same segment
        // (desired behavior for getting the domain when time slider is active).
        .sort((a, b) => (getY(a) ?? 0) - (getY(b) ?? 0))
        .map((d) => ({ [getSegment(d)]: getY(d) }))
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

/** Use to potentially extract temporal values from data. This is needed for
 * column charts, where the temporal dimension is used as X axis (and we
 * do not fetch all values for temporal dimensions, only the min and max).
 */
export const getMaybeTemporalDimensionValues = (
  dimension: DimensionMetadataFragment,
  data: Observation[]
) => {
  if (isTemporalDimension(dimension)) {
    const dates = data.map((d) => d[dimension.iri] as string);
    return uniq(dates).map((d) => ({ label: d, value: d }));
  } else {
    return dimension.values;
  }
};

import { InternMap, sum } from "d3";
import omitBy from "lodash/omitBy";
import uniq from "lodash/uniq";
import React, { useCallback, useMemo } from "react";

import { useMaybeAbbreviations } from "@/charts/shared/abbreviations";
import {
  imputeTemporalLinearSeries,
  interpolateZerosValue,
} from "@/charts/shared/imputation";
import { useObservationLabels } from "@/charts/shared/observation-labels";
import {
  ChartConfig,
  ChartType,
  Filters,
  ImputationType,
  InteractiveFiltersConfig,
  InteractiveFiltersDataConfig,
  InteractiveFiltersLegend,
  InteractiveFiltersTimeRange,
  MapConfig,
} from "@/config-types";
import {
  CategoricalColorField,
  ComboChartConfig,
  GenericField,
  NumericalColorField,
  getChartConfigFilters,
  isComboChartConfig,
} from "@/configurator";
import { parseDate } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { Component, Dimension, Measure, Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { JOIN_BY_DIMENSION_IRI } from "@/graphql/hook-utils";
import { DataCubeObservationFilter } from "@/graphql/resolver-types";
import {
  InteractiveFiltersState,
  useInteractiveFilters,
} from "@/stores/interactive-filters";

// Prepare filters used in data query:
// - merges publisher data filters and interactive data filters (user-defined),
//   if applicable
// - removes none values since they should not be sent as part of the GraphQL query
export const prepareQueryFilters = (
  chartType: ChartType,
  filters: Filters,
  interactiveFiltersConfig: InteractiveFiltersConfig,
  dataFilters: InteractiveFiltersState["dataFilters"],
  allowNoneValues = false
): Filters => {
  const queryFilters = { ...filters };

  if (chartType !== "table" && interactiveFiltersConfig?.dataFilters.active) {
    for (const [k, v] of Object.entries(dataFilters)) {
      queryFilters[k] = v;
    }
  }

  return allowNoneValues
    ? queryFilters
    : omitBy(
        queryFilters,
        (v) => v.type === "single" && v.value === FIELD_VALUE_NONE
      );
};

export const useQueryFilters = ({
  chartConfig,
  dimensions,
  measures,
  allowNoneValues,
}: {
  chartConfig: ChartConfig;
  dimensions?: Dimension[];
  measures?: Measure[];
  allowNoneValues?: boolean;
}): DataCubeObservationFilter[] | undefined => {
  const allDataFilters = useInteractiveFilters((d) => d.dataFilters);

  return React.useMemo(() => {
    if (!dimensions || !measures) {
      return;
    }

    return chartConfig.cubes.map((cube) => {
      const filters = getChartConfigFilters(chartConfig.cubes, cube.iri);
      const dataFilters = Object.fromEntries(
        Object.entries(allDataFilters).filter(([k]) =>
          dimensions.find((d) => d.iri === k)
        )
      );

      return {
        iri: cube.iri,
        // componentIris: getComponentIris(cube.iri, {
        //   dimensions,
        //   measures,
        // }),
        filters: prepareQueryFilters(
          chartConfig.chartType,
          filters,
          chartConfig.interactiveFiltersConfig,
          dataFilters,
          allowNoneValues
        ),
        joinBy: cube.joinBy,
      };
    });
  }, [
    chartConfig.cubes,
    chartConfig.chartType,
    chartConfig.interactiveFiltersConfig,
    allDataFilters,
    allowNoneValues,
    dimensions,
    measures,
  ]);
};

// Handle correctly when improving performance of data fetching!
// const getComponentIris = (
//   cubeIri: string,
//   options: {
//     dimensions: Dimension[];
//     measures: Measure[];
//   }
// ) => {
//   const { dimensions, measures } = options;

//   if (dimensions.length === 0 && measures.length === 0) {
//     return;
//   }

//   const filteredDimensionIris: string[] = [];

//   for (const dimension of dimensions) {
//     if (dimension.isJoinByDimension) {
//       if (dimension.originalIris.some((d) => d.cubeIri === cubeIri)) {
//         filteredDimensionIris.push(
//           ...dimension.originalIris.map((d) => d.dimensionIri)
//         );
//       }
//     } else {
//       if (dimension.cubeIri === cubeIri) {
//         filteredDimensionIris.push(dimension.iri);
//       }
//     }
//   }

//   return [
//     ...filteredDimensionIris,
//     ...measures.filter((d) => d.cubeIri === cubeIri).map((d) => d.iri),
//   ];
// };

type IFKey = keyof NonNullable<InteractiveFiltersConfig>;

export const getChartConfigFilterComponentIris = ({ cubes }: ChartConfig) => {
  return Object.keys(getChartConfigFilters(cubes)).filter(
    (d) => d !== JOIN_BY_DIMENSION_IRI
  );
};

const getMapChartConfigAdditionalFields = ({ fields }: MapConfig) => {
  const { areaLayer, symbolLayer } = fields;
  const additionalFields = [];

  if (areaLayer) {
    additionalFields.push(areaLayer.color.componentIri);
  }

  if (symbolLayer) {
    if (symbolLayer.measureIri !== FIELD_VALUE_NONE) {
      additionalFields.push(symbolLayer.measureIri);
    }

    if (["categorical", "numerical"].includes(symbolLayer.color.type)) {
      additionalFields.push(
        (symbolLayer.color as CategoricalColorField | NumericalColorField)
          .componentIri
      );
    }
  }

  return additionalFields;
};

const getComboChartConfigAdditionalFields = (chartConfig: ComboChartConfig) => {
  switch (chartConfig.chartType) {
    case "comboLineSingle":
      return chartConfig.fields.y.componentIris;
    case "comboLineDual":
      return [
        chartConfig.fields.y.leftAxisComponentIri,
        chartConfig.fields.y.rightAxisComponentIri,
      ];
    case "comboLineColumn":
      return [
        chartConfig.fields.y.columnComponentIri,
        chartConfig.fields.y.lineComponentIri,
      ];
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

export const extractChartConfigsComponentIris = (
  chartConfigs: ChartConfig[]
) => {
  return uniq(chartConfigs.map(extractChartConfigComponentIris).flat());
};

export const extractChartConfigComponentIris = (chartConfig: ChartConfig) => {
  const { fields, interactiveFiltersConfig: IFConfig } = chartConfig;
  const fieldIris = Object.values(fields).map((d) => d.componentIri);
  const additionalFieldIris =
    chartConfig.chartType === "map"
      ? getMapChartConfigAdditionalFields(chartConfig)
      : isComboChartConfig(chartConfig)
      ? getComboChartConfigAdditionalFields(chartConfig)
      : [];
  const filterIris = getChartConfigFilterComponentIris(chartConfig);
  const IFKeys = IFConfig ? (Object.keys(IFConfig) as IFKey[]) : [];
  const IFIris: string[] = [];

  if (IFConfig) {
    IFKeys.forEach((k) => {
      const v = IFConfig[k];

      switch (k) {
        case "legend":
          IFIris.push((v as InteractiveFiltersLegend).componentIri);
          break;
        case "timeRange":
          IFIris.push((v as InteractiveFiltersTimeRange).componentIri);
          break;
        case "dataFilters":
          IFIris.push(...(v as InteractiveFiltersDataConfig).componentIris);
          break;
        case "calculation":
          break;
        default:
          const _exhaustiveCheck: never = k;
          return _exhaustiveCheck;
      }
    });
  }

  return (
    uniq(
      [...fieldIris, ...additionalFieldIris, ...filterIris, ...IFIris].filter(
        Boolean
      )
    )
      .filter((d) => d !== JOIN_BY_DIMENSION_IRI)
      // Important so the order is consistent when querying.
      .sort()
  );
};

/** Use to remove missing values from chart data. */
export const usePlottableData = (
  data: Observation[],
  {
    getX,
    getY,
  }: {
    getX?: (d: Observation) => unknown | null;
    getY?: (d: Observation) => unknown | null;
  }
) => {
  const isPlottable = useCallback(
    (d: Observation) => {
      for (const p of [getX, getY].filter(truthy)) {
        const v = p(d);
        if (v === undefined || v === null) {
          return false;
        }
      }
      return true;
    },
    [getX, getY]
  );

  return useMemo(() => data.filter(isPlottable), [data, isPlottable]);
};

export const useDimensionWithAbbreviations = (
  dimension: Dimension | undefined,
  {
    observations,
    field,
  }: {
    observations: Observation[];
    field?: GenericField;
  }
) => {
  const { getAbbreviationOrLabelByValue, abbreviationOrLabelLookup } =
    useMaybeAbbreviations({
      useAbbreviations: field?.useAbbreviations,
      dimensionIri: dimension?.iri,
      dimensionValues: dimension?.values,
    });

  const { getValue, getLabel } = useObservationLabels(
    observations,
    getAbbreviationOrLabelByValue,
    dimension?.iri
  );

  return {
    getAbbreviationOrLabelByValue,
    abbreviationOrLabelLookup,
    getValue,
    getLabel,
  };
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

export const getSegment =
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
          getOptionalObservationProps: (i) => {
            return allSegments.map((d) => {
              return {
                [d]: dataGroupedByXWithImputedValues[i][d],
              };
            });
          },
        });
      }
    case "zeros":
      if (allSegments) {
        return getBaseWideData({
          dataGroupedByX,
          xKey,
          getY,
          getSegment,
          getOptionalObservationProps: () => {
            return allSegments.map((d) => {
              return {
                [d]: interpolateZerosValue(),
              };
            });
          },
        });
      }
    case "none":
    default:
      return getBaseWideData({
        dataGroupedByX,
        xKey,
        getY,
        getSegment,
      });
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
        .sort((a, b) => {
          return (getY(a) ?? 0) - (getY(b) ?? 0);
        })
        .map((d) => {
          return {
            [getSegment(d)]: getY(d),
          };
        })
    );

    wideData.push(observation);
  }

  return wideData;
};

const getIdentityIri = (iri: string) => `${iri}/__identity__`;
export const useGetIdentityY = (iri: string) => {
  return React.useCallback(
    (d: Observation) => {
      return (d[getIdentityIri(iri)] as number | null) ?? null;
    },
    [iri]
  );
};

export const normalizeData = (
  data: Observation[],
  {
    yKey,
    getY,
    getTotalGroupValue,
  }: {
    yKey: string;
    getY: (d: Observation) => number | null;
    getTotalGroupValue: (d: Observation) => number;
  }
): Observation[] => {
  return data.map((d) => {
    const totalGroupValue = getTotalGroupValue(d);
    const y = getY(d);

    return {
      ...d,
      [yKey]: 100 * (y ? y / totalGroupValue : y ?? 0),
      [getIdentityIri(yKey)]: y,
    };
  });
};

const SlugRe = /\W+/g;
export const getSlugifiedIri = (iri: string) => iri.replace(SlugRe, "_");

export const getLabelWithUnit = (dimension: Component): string => {
  return dimension.unit
    ? `${dimension.label} (${dimension.unit})`
    : dimension.label;
};

export const checkForMissingValuesInSegments = (
  dataGroupedByX: InternMap<string, Observation[]>,
  segments: Array<string>
): boolean => {
  for (const value of dataGroupedByX.values()) {
    if (value.length !== segments.length) {
      return true;
    }
  }

  return false;
};

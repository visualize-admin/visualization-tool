import { InternMap, sum } from "d3-array";
import omitBy from "lodash/omitBy";
import uniq from "lodash/uniq";
import { useCallback, useMemo } from "react";

import { useMaybeAbbreviations } from "@/charts/shared/abbreviations";
import {
  imputeTemporalLinearSeries,
  interpolateZerosValue,
} from "@/charts/shared/imputation";
import { useObservationLabels } from "@/charts/shared/observation-labels";
import {
  AnimationField,
  ChartConfig,
  Filters,
  ImputationType,
  InteractiveFiltersConfig,
  InteractiveFiltersDataConfig,
  InteractiveFiltersLegend,
  InteractiveFiltersTimeRange,
  isAnimationInConfig,
  MapConfig,
} from "@/config-types";
import { getChartConfigFilters } from "@/config-utils";
import {
  CategoricalColorField,
  ComboChartConfig,
  DashboardFiltersConfig,
  GenericField,
  isComboChartConfig,
  NumericalColorField,
} from "@/configurator";
import { parseDate } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  Component,
  Dimension,
  DimensionValue,
  getTemporalEntityValue,
  Observation,
  ObservationValue,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { getOriginalIds, isJoinById } from "@/graphql/join";
import { DataCubeObservationFilter } from "@/graphql/resolver-types";
import {
  InteractiveFiltersState,
  useChartInteractiveFilters,
} from "@/stores/interactive-filters";

// Prepare filters used in data query:
// - merges publisher data filters, interactive data filters, and dashboard filters
//   if applicable
// - removes none values since they should not be sent as part of the GraphQL query
export const prepareCubeQueryFilters = ({
  cubeFilters,
  animationField,
  interactiveFiltersConfig,
  dashboardFilters,
  interactiveDataFilters,
  allowNoneValues = false,
}: {
  cubeFilters: Filters;
  animationField: AnimationField | undefined;
  interactiveFiltersConfig: InteractiveFiltersConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  interactiveDataFilters: InteractiveFiltersState["dataFilters"];
  allowNoneValues?: boolean;
}): Filters => {
  const queryFilters = { ...cubeFilters };

  for (const [k, v] of Object.entries(
    dashboardFilters?.dataFilters.filters ?? {}
  )) {
    if (
      k in cubeFilters &&
      dashboardFilters?.dataFilters.componentIds?.includes(k) &&
      animationField?.componentId !== k
    ) {
      queryFilters[k] = v;
    }
  }

  for (const [k, v] of Object.entries(interactiveDataFilters)) {
    if (
      (interactiveFiltersConfig.dataFilters.active ||
        dashboardFilters?.dataFilters.componentIds?.includes(k)) &&
      animationField?.componentId !== k
    ) {
      if (queryFilters[k]?.type === "multi" && v.value === FIELD_VALUE_NONE) {
        continue;
      }

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
  dashboardFilters,
  allowNoneValues,
  componentIds,
}: {
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  allowNoneValues?: boolean;
  componentIds?: string[];
}): DataCubeObservationFilter[] => {
  const chartInteractiveFilters = useChartInteractiveFilters(
    (d) => d.dataFilters
  );
  const animationField = isAnimationInConfig(chartConfig)
    ? chartConfig.fields.animation
    : undefined;

  return useMemo(() => {
    return chartConfig.cubes.map((cube) => {
      const cubeFilters = getChartConfigFilters(chartConfig.cubes, {
        cubeIri: cube.iri,
      });
      const cubeComponentIds = [
        ...Object.keys(cubeFilters),
        ...Object.keys(chartConfig.fields),
        ...Object.values(chartConfig.fields).map((field) => field.componentId),
      ];
      const cubeInteractiveDataFilters = Object.fromEntries(
        Object.entries(chartInteractiveFilters).filter(([componentId]) =>
          cubeComponentIds.includes(componentId)
        )
      );

      const preparedFilters = prepareCubeQueryFilters({
        cubeFilters,
        animationField,
        interactiveFiltersConfig: chartConfig.interactiveFiltersConfig,
        dashboardFilters,
        interactiveDataFilters: cubeInteractiveDataFilters,
        allowNoneValues,
      });

      return {
        iri: cube.iri,
        componentIds,
        filters: preparedFilters,
        joinBy: cube.joinBy,
      } satisfies DataCubeObservationFilter;
    });
  }, [
    chartConfig.cubes,
    chartConfig.fields,
    chartConfig.interactiveFiltersConfig,
    chartInteractiveFilters,
    animationField,
    dashboardFilters,
    allowNoneValues,
    componentIds,
  ]);
};

type IFKey = keyof NonNullable<InteractiveFiltersConfig>;

const getChartConfigFilterComponentIds = ({ cubes }: ChartConfig) => {
  return Object.keys(getChartConfigFilters(cubes)).filter(
    (d) => !isJoinById(d)
  );
};

const getMapChartConfigAdditionalFieldIds = ({ fields }: MapConfig) => {
  const { areaLayer, symbolLayer } = fields;
  const additionalFields = [];

  if (areaLayer) {
    additionalFields.push(areaLayer.color.componentId);
  }

  if (symbolLayer) {
    if (symbolLayer.measureId !== FIELD_VALUE_NONE) {
      additionalFields.push(symbolLayer.measureId);
    }

    if (["categorical", "numerical"].includes(symbolLayer.color.type)) {
      additionalFields.push(
        (symbolLayer.color as CategoricalColorField | NumericalColorField)
          .componentId
      );
    }
  }

  return additionalFields;
};

const getComboChartComponentIds = (chartConfig: ComboChartConfig) => {
  switch (chartConfig.chartType) {
    case "comboLineSingle":
      return chartConfig.fields.y.componentIds;
    case "comboLineDual":
      return [
        chartConfig.fields.y.leftAxisComponentId,
        chartConfig.fields.y.rightAxisComponentId,
      ];
    case "comboLineColumn":
      return [
        chartConfig.fields.y.columnComponentId,
        chartConfig.fields.y.lineComponentId,
      ];
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

export const extractChartConfigsComponentIds = (
  chartConfigs: ChartConfig[]
) => {
  return uniq(
    chartConfigs
      .map((chartConfig) => extractChartConfigComponentIds({ chartConfig }))
      .flat()
  );
};

export const extractChartConfigComponentIds = ({
  chartConfig,
  includeFilters = true,
}: {
  chartConfig: ChartConfig;
  includeFilters?: boolean;
}): string[] => {
  const { fields, interactiveFiltersConfig } = chartConfig;
  const fieldIds = Object.values<GenericField>(
    // @ts-ignore - we are only interested in component ids
    fields
  ).map((field) => field.componentId);
  const additionalFieldIds =
    chartConfig.chartType === "map"
      ? getMapChartConfigAdditionalFieldIds(chartConfig)
      : isComboChartConfig(chartConfig)
        ? getComboChartComponentIds(chartConfig)
        : [];
  const filterIds = includeFilters
    ? getChartConfigFilterComponentIds(chartConfig)
    : [];
  const IFKeys = interactiveFiltersConfig
    ? (Object.keys(interactiveFiltersConfig) as IFKey[])
    : [];
  const IFIris: string[] = [];

  if (interactiveFiltersConfig) {
    IFKeys.forEach((k) => {
      const v = interactiveFiltersConfig[k];
      switch (k) {
        case "legend": {
          const legend = v as InteractiveFiltersLegend;
          if (legend.active) {
            IFIris.push(legend.componentId);
          }
          break;
        }
        case "timeRange": {
          const timeRange = v as InteractiveFiltersTimeRange;
          if (timeRange.active) {
            IFIris.push(timeRange.componentId);
          }
          break;
        }
        case "dataFilters": {
          const dataFilters = v as InteractiveFiltersDataConfig;
          if (dataFilters.active) {
            IFIris.push(...dataFilters.componentIds);
          }
          break;
        }
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
      [...fieldIds, ...additionalFieldIds, ...filterIds, ...IFIris].filter(
        Boolean
      )
    )
      .flatMap((id) =>
        isJoinById(id) ? getOriginalIds(id, chartConfig) : [id]
      )
      .filter((id) => !isJoinById(id))
      // Important so the order is consistent when querying.
      .sort()
  );
};

export const extractChartConfigUsedComponents = (
  chartConfig: ChartConfig,
  { components }: { components: Component[] }
) => {
  const componentIds = extractChartConfigComponentIds({
    chartConfig,
    includeFilters: false,
  });

  return componentIds
    .map((id) => components.find((component) => component.id === id))
    .filter(truthy); // exclude potential joinBy components
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
      dimensionId: dimension?.id,
      dimensionValues: dimension?.values,
    });

  const { getValue, getLabel } = useObservationLabels(
    observations,
    getAbbreviationOrLabelByValue,
    dimension?.id
  );

  return {
    getAbbreviationOrLabelByValue,
    abbreviationOrLabelLookup,
    getValue,
    getLabel,
  };
};

const makeUseParsedVariable =
  <T extends unknown>(parser: (d: ObservationValue) => T) =>
  (key: string) => {
    return useCallback((d: Observation) => parser(d[key]), [key]);
  };

export const parseOptionalNumericVariable = (d: ObservationValue) => {
  return d !== null ? +d : null;
};
export const useOptionalNumericVariable = makeUseParsedVariable(
  parseOptionalNumericVariable
);

export const parseStringVariable = (d: ObservationValue) => {
  return d !== null ? `${d}` : "";
};
export const useStringVariable = makeUseParsedVariable(parseStringVariable);

export const useTemporalVariable = makeUseParsedVariable((x) =>
  parseDate(`${x}`)
);

export const useTemporalEntityVariable = (
  dimensionValues: DimensionValue[]
) => {
  const indexedValues = useMemo(() => {
    return new Map(dimensionValues.map((d) => [d.label, d]));
  }, [dimensionValues]);

  return useCallback(
    (key: string) => {
      return (d: Observation) => {
        const label = d[key];
        const dimensionValue = indexedValues.get(`${label}`);
        const value = dimensionValue
          ? getTemporalEntityValue(dimensionValue)
          : undefined;

        return parseDate(`${value}`);
      };
    },
    [indexedValues]
  );
};

export const getSegment =
  (segmentKey: string | undefined) =>
  (d: Observation): string =>
    segmentKey ? `${d[segmentKey]}` : "segment";

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
  dataGrouped,
  key,
  getAxisValue,
  allSegments,
  getSegment,
  imputationType = "none",
}: {
  dataGrouped: InternMap<string, Array<Observation>>;
  key: string;
  getAxisValue: (d: Observation) => number | null;
  allSegments?: Array<string>;
  getSegment: (d: Observation) => string;
  imputationType?: ImputationType;
}) => {
  switch (imputationType) {
    case "linear":
      if (allSegments) {
        const dataGroupedEntries = [...dataGrouped.entries()];
        const dataGroupedWithImputedValues: Array<{
          [key: string]: number;
        }> = Array.from({ length: dataGrouped.size }, () => ({}));

        for (const segment of allSegments) {
          const imputedSeriesValues = imputeTemporalLinearSeries({
            dataSortedByX: dataGroupedEntries.map(([date, values]) => {
              const observation = values.find((d) => getSegment(d) === segment);

              return {
                date: new Date(date),
                value: observation ? getAxisValue(observation) : null,
              };
            }),
          });

          for (let i = 0; i < imputedSeriesValues.length; i++) {
            dataGroupedWithImputedValues[i][segment] =
              imputedSeriesValues[i].value;
          }
        }

        return getBaseWideData({
          dataGrouped,
          key,
          getAxisValue,
          getSegment,
          getOptionalObservationProps: (i) => {
            return allSegments.map((d) => {
              return {
                [d]: dataGroupedWithImputedValues[i][d],
              };
            });
          },
        });
      }
    case "zeros":
      if (allSegments) {
        return getBaseWideData({
          dataGrouped,
          key,
          getAxisValue,
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
        dataGrouped,
        key,
        getAxisValue,
        getSegment,
      });
  }
};

const getBaseWideData = ({
  dataGrouped,
  key,
  getAxisValue,
  getSegment,
  getOptionalObservationProps = () => [],
}: {
  dataGrouped: InternMap<string, Array<Observation>>;
  key: string;
  getAxisValue: (d: Observation) => number | null;
  getSegment: (d: Observation) => string;
  getOptionalObservationProps?: (
    datumIndex: number
  ) => Array<{ [key: string]: number }>;
}): Array<Observation> => {
  const wideData = [];
  const dataGroupedByXEntries = [...dataGrouped.entries()];

  for (let i = 0; i < dataGrouped.size; i++) {
    const [k, v] = dataGroupedByXEntries[i];

    const observation: Observation = Object.assign(
      {
        [key]: k,
        [`${key}/__iri__`]: v[0][`${key}/__iri__`],
        total: sum(v, getAxisValue),
      },
      ...getOptionalObservationProps(i),
      ...v
        // Sorting the values in case of multiple values for the same segment
        // (desired behavior for getting the domain when time slider is active).
        .sort((a, b) => {
          return (getAxisValue(a) ?? 0) - (getAxisValue(b) ?? 0);
        })
        .map((d) => {
          return {
            [getSegment(d)]: getAxisValue(d),
          };
        })
    );

    wideData.push(observation);
  }

  return wideData;
};

const getIdentityId = (id: string) => `${id}/__identity__`;
export const useGetIdentityY = (id: string) => {
  return useCallback(
    (d: Observation) => {
      return (d[getIdentityId(id)] as number | null) ?? null;
    },
    [id]
  );
};
export const useGetIdentityX = (id: string) => {
  return useCallback(
    (d: Observation) => {
      return (d[getIdentityId(id)] as number | null) ?? null;
    },
    [id]
  );
};

export const normalizeData = (
  sortedData: Observation[],
  {
    key,
    getAxisValue,
    getTotalGroupValue,
  }: {
    key: string;
    getAxisValue: (d: Observation) => number | null;
    getTotalGroupValue: (d: Observation) => number;
  }
): Observation[] => {
  return sortedData.map((d) => {
    const totalGroupValue = getTotalGroupValue(d);
    const axisValue = getAxisValue(d);

    return {
      ...d,
      [key]: 100 * (axisValue ? axisValue / totalGroupValue : (axisValue ?? 0)),
      [getIdentityId(key)]: axisValue,
    };
  });
};

const SlugRe = /\W+/g;
export const getSlugifiedId = (id: string) => id.replace(SlugRe, "_");

export const getLabelWithUnit = (component: Component) => {
  return component.unit
    ? `${component.label} (${component.unit})`
    : component.label;
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

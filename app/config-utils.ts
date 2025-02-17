import { useMemo } from "react";

import {
  ChartConfig,
  ConfiguratorState,
  Cube,
  Filters,
  FilterValue,
  FilterValueMulti,
  FilterValueSingle,
  Limit as ConfigLimit,
  SingleFilters,
} from "@/config-types";
import { Dimension, Measure, ObservationValue } from "@/domain/data";
import { truthy } from "@/domain/types";
import { mkJoinById } from "@/graphql/join";
import { Limit } from "@/rdf/limits";

const isFilterValueSingle = (v: FilterValue): v is FilterValueSingle => {
  return v.type === "single";
};

export const isSingleFilters = (filters: Filters): filters is SingleFilters => {
  return Object.values(filters).every(isFilterValueSingle);
};

export const extractSingleFilters = (filters: Filters): SingleFilters => {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value.type === "single")
  ) as SingleFilters;
};

export const makeMultiFilter = (
  values: ObservationValue[]
): FilterValueMulti => {
  return {
    type: "multi",
    values: Object.fromEntries(values.map((d) => [d, true])),
  };
};

/** Use to extract the chart config from configurator state. Handy in the editor mode,
 * where the is a need to edit the active chart config.
 *
 * @param state configurator state
 * @param chartKey optional chart key. If not provided, the active chart config will be returned.
 *
 */
export const getChartConfig = (
  state: ConfiguratorState,
  chartKey?: string | null
): ChartConfig => {
  if (state.state === "INITIAL" || state.state === "SELECTING_DATASET") {
    throw Error("No chart config available!");
  }

  const { chartConfigs, activeChartKey } = state;
  const key = chartKey ?? activeChartKey;

  return chartConfigs.find((d) => d.key === key) ?? chartConfigs[0];
};

/**
 * Get all filters from cubes and returns an object containing all values.
 */
export const getChartConfigFilters = (
  cubes: Cube[],
  {
    cubeIri,
    joined,
  }: {
    /** If passed, only filters for a particular cube will be considered */
    cubeIri?: string;
    /**
     * If true, filters for joined dimensions will be deduped. Useful in contexts where filters
     * for multiple join dimensions should be considered unique (for example, in the left data filters).
     */
    joined?: boolean;
  } = {}
): Filters => {
  const relevantCubes = cubes.filter((c) =>
    cubeIri ? c.iri === cubeIri : true
  );
  const dimIdToJoinId = joined
    ? Object.fromEntries(
        relevantCubes.flatMap((x) =>
          (x.joinBy ?? []).map(
            (iri, index) => [iri, mkJoinById(index)] as const
          )
        )
      )
    : {};

  return Object.fromEntries(
    relevantCubes.flatMap((c) =>
      Object.entries(c.filters).map(([id, value]) => [
        dimIdToJoinId[id] ?? id,
        value,
      ])
    )
  );
};

export const useChartConfigFilters = (
  chartConfig: ChartConfig,
  options?: Parameters<typeof getChartConfigFilters>[1]
): Filters => {
  return useMemo(() => {
    return getChartConfigFilters(chartConfig.cubes, {
      cubeIri: options?.cubeIri,
      joined: options?.joined,
    });
  }, [chartConfig.cubes, options?.cubeIri, options?.joined]);
};

/** Get the limit from the chart config that is related to the given measure
 * and dimension along with additional metadata.
 */
export const getMaybeValidChartConfigLimit = ({
  chartConfig,
  measureId,
  limit,
  relatedDimension,
  filters,
}: {
  chartConfig: ChartConfig;
  measureId: string;
  limit: Limit;
  relatedDimension: Dimension;
  filters: Filters;
}): {
  /** The limit that is valid in the context of related dimension and filters. */
  limit: ConfigLimit | undefined;
  /** The related dimension id and value that is valid in the context of current related dimension. */
  validRelated: { dimensionId: string; dimensionValue: string } | undefined;
  /** If the limit would be valid in the context of current filters. */
  wouldBeValid: boolean;
} => {
  const validRelated = limit.related.find(
    (related) => related.dimensionId === relatedDimension.id
  );

  if (!validRelated) {
    return { limit: undefined, validRelated: undefined, wouldBeValid: false };
  }

  const relatedToFilterBys = limit.related.filter(
    (related) => related.dimensionId !== relatedDimension.id
  );

  for (const relatedToFilterBy of relatedToFilterBys) {
    const maybeFilter = filters[relatedToFilterBy.dimensionId];
    const maybeFilterValue =
      maybeFilter && isFilterValueSingle(maybeFilter)
        ? maybeFilter.value
        : undefined;

    if (maybeFilterValue !== relatedToFilterBy.dimensionValue) {
      return { limit: undefined, validRelated, wouldBeValid: false };
    }
  }

  const measureChartConfigLimits = chartConfig.limits[measureId] ?? [];

  return {
    limit: measureChartConfigLimits.find(
      (limit) =>
        limit.dimensionId === relatedDimension.id &&
        limit.dimensionValue === validRelated.dimensionValue
    ),
    validRelated,
    wouldBeValid: true,
  };
};

export const getRelatedLimitDimension = ({
  chartConfig,
  dimensions,
}: {
  chartConfig: ChartConfig;
  dimensions: Dimension[];
}) => {
  switch (chartConfig.chartType) {
    case "area":
    case "column":
    case "line":
      return dimensions.find((d) => d.id === chartConfig.fields.x.componentId);
    case "bar":
      return dimensions.find((d) => d.id === chartConfig.fields.y.componentId);
    case "comboLineColumn":
    case "comboLineDual":
    case "comboLineSingle":
    case "map":
    case "pie":
    case "scatterplot":
    case "table":
      return;
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

export const getLimitMeasure = ({
  chartConfig,
  measures,
}: {
  chartConfig: ChartConfig;
  measures: Measure[];
}) => {
  switch (chartConfig.chartType) {
    case "area":
    case "column":
    case "line":
      return measures.find((d) => d.id === chartConfig.fields.y.componentId);
    case "bar":
      return measures.find((d) => d.id === chartConfig.fields.x.componentId);
    case "comboLineColumn":
    case "comboLineDual":
    case "comboLineSingle":
    case "map":
    case "pie":
    case "scatterplot":
    case "table":
      return;
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

export const useLimits = ({
  chartConfig,
  dimensions,
  measures,
}: {
  chartConfig: ChartConfig;
  dimensions: Dimension[];
  measures: Measure[];
}): {
  relatedDimension: Dimension | undefined;
  limits: {
    configLimit: ConfigLimit;
    measureLimit: Limit;
  }[];
} => {
  const filters = useChartConfigFilters(chartConfig);
  const measure = getLimitMeasure({ chartConfig, measures });
  const relatedDimension = getRelatedLimitDimension({
    chartConfig,
    dimensions,
  });

  return useMemo(() => {
    if (!measure || !relatedDimension) {
      return {
        relatedDimension,
        limits: [],
      };
    }

    return {
      relatedDimension: relatedDimension,
      limits: measure.limits
        .map((limit) => {
          const { limit: maybeLimit } = getMaybeValidChartConfigLimit({
            chartConfig,
            measureId: measure.id,
            limit,
            relatedDimension,
            filters,
          });

          return maybeLimit
            ? {
                configLimit: maybeLimit,
                measureLimit: limit,
              }
            : null;
        })
        .filter(truthy),
    };
  }, [chartConfig, filters, measure, relatedDimension]);
};

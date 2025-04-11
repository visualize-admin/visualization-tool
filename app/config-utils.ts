import { bisectCenter } from "d3-array";
import { useMemo } from "react";

import {
  ChartConfig,
  ConfiguratorState,
  Cube,
  Filters,
  FilterValue,
  FilterValueMulti,
  FilterValueSingle,
  getAnimationField,
  Limit as ConfigLimit,
  SingleFilters,
} from "@/config-types";
import { useConfiguratorState } from "@/configurator/configurator-state";
import {
  Dimension,
  isTemporalDimensionWithTimeUnit,
  Measure,
  ObservationValue,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { useTimeFormatUnit } from "@/formatters";
import { mkJoinById } from "@/graphql/join";
import { Limit } from "@/rdf/limits";
import {
  useChartInteractiveFilters,
  useDashboardInteractiveFilters,
} from "@/stores/interactive-filters";

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

export const useDefinitiveTemporalFilterValue = ({
  dimensions,
}: {
  dimensions: Dimension[];
}) => {
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const definitiveFilters = useDefinitiveFilters();
  const temporalDims = dimensions.filter(isTemporalDimensionWithTimeUnit);
  const temporalFilters = Object.entries(definitiveFilters)
    .map(([id, f]) => {
      return temporalDims.some((d) => d.id === id) && f.type === "single"
        ? f
        : undefined;
    })
    .filter(truthy) as FilterValueSingle[];
  const animationDim = temporalDims.find(
    (d) => d.id === getAnimationField(chartConfig)?.componentId
  );
  const timeFormatUnit = useTimeFormatUnit();
  const timeUnit = animationDim?.timeUnit;
  const { value: timeSliderValue } = useChartInteractiveFilters(
    (d) => d.timeSlider
  );
  const formattedTimeSliderValue =
    timeUnit && timeSliderValue
      ? timeFormatUnit(new Date(timeSliderValue), timeUnit)
      : undefined;
  const closestTemporalTimeSliderValue = useMemo(() => {
    if (!animationDim || !formattedTimeSliderValue) {
      return undefined;
    }

    const closesValueIndex = bisectCenter(
      animationDim.values.map((d) => d.value) as string[],
      formattedTimeSliderValue
    );

    return animationDim.values[closesValueIndex]?.value;
  }, [animationDim, formattedTimeSliderValue]);

  if (closestTemporalTimeSliderValue) {
    return closestTemporalTimeSliderValue;
  }

  if (temporalFilters.length > 1) {
    console.warn("More than one temporal filter found. Using the first one.");
  }

  return temporalFilters.length === 1 ? temporalFilters[0].value : undefined;
};

const useDefinitiveFilters = () => {
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const filters = useChartConfigFilters(chartConfig);
  const dataFilters = useChartInteractiveFilters((d) => d.dataFilters);
  const dashboardFilters = useDashboardInteractiveFilters();
  const definitiveFilters = useMemo(() => {
    const definitiveFilters: Filters = {};

    for (const [k, v] of Object.entries(filters)) {
      definitiveFilters[k] = v;
    }

    for (const [k, v] of Object.entries(dataFilters)) {
      definitiveFilters[k] = v;
    }

    for (const [getState] of Object.values(dashboardFilters.stores)) {
      const state = getState();

      for (const [k, v] of Object.entries(state.dataFilters)) {
        definitiveFilters[k] = v;
      }
    }

    return definitiveFilters;
  }, [filters, dataFilters, dashboardFilters]);

  return definitiveFilters;
};

/** Get the limit from the chart config that is related to the given measure
 * and dimension along with additional metadata.
 */
export const getMaybeValidChartConfigLimit = ({
  chartConfig,
  measureId,
  limit,
  axisDimension,
  filters,
}: {
  chartConfig: ChartConfig;
  measureId: string;
  limit: Limit;
  axisDimension?: Dimension;
  filters: Filters;
}): {
  /** The limit that is valid in the context of related dimension and filters. */
  limit: ConfigLimit | undefined;
  /** The related value label that is valid in the context of current axis dimension. */
  relatedAxisDimensionValueLabel: string | undefined;
  /** If the limit would be valid in the context of current filters. */
  wouldBeValid: boolean;
} => {
  const relatedAxisDimensionValue = axisDimension
    ? limit.related.find((r) => r.dimensionId === axisDimension.id)?.value
    : undefined;
  const relatedAxisDimensionValueLabel = axisDimension
    ? [...axisDimension.values, ...axisDimension.relatedLimitValues].find(
        (v) => v.value === relatedAxisDimensionValue
      )?.label
    : undefined;
  const relatedToFilterBys = axisDimension
    ? limit.related.filter((r) => r.dimensionId !== axisDimension.id)
    : limit.related;

  for (const relatedToFilterBy of relatedToFilterBys) {
    const maybeFilter = filters[relatedToFilterBy.dimensionId];
    const maybeFilterValue =
      maybeFilter && isFilterValueSingle(maybeFilter)
        ? maybeFilter.value
        : undefined;

    if (maybeFilterValue !== relatedToFilterBy.value) {
      return {
        limit: undefined,
        relatedAxisDimensionValueLabel,
        wouldBeValid: false,
      };
    }
  }

  const measureConfigLimits = chartConfig.limits[measureId] ?? [];

  return {
    limit: measureConfigLimits.find((configLimit) => {
      return configLimit.related.every((cr) => {
        return limit.related.some((lr) => {
          return lr.dimensionId === cr.dimensionId && lr.value === cr.value;
        });
      });
    }),
    relatedAxisDimensionValueLabel,
    wouldBeValid: true,
  };
};

export const getAxisDimension = ({
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
    // For maps, we don't really have a "related dimension", as it's used as single filter.
    case "map":
      return;
    // These chart types do not support the display of the limits.
    case "comboLineColumn":
    case "comboLineDual":
    case "comboLineSingle":
    case "pie":
    case "scatterplot":
    case "table":
      return;
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

const getLimitMeasure = ({
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
    case "map":
      return measures.find(
        (d) => d.id === chartConfig.fields.symbolLayer?.measureId
      );
    case "comboLineColumn":
    case "comboLineDual":
    case "comboLineSingle":
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
  axisDimension: Dimension | undefined;
  limits: {
    configLimit: ConfigLimit;
    measureLimit: Limit;
    relatedAxisDimensionValueLabel: string | undefined;
  }[];
} => {
  const filters = useDefinitiveFilters();
  const measure = getLimitMeasure({ chartConfig, measures });
  const axisDimension = getAxisDimension({ chartConfig, dimensions });

  return useMemo(() => {
    if (!measure) {
      return {
        axisDimension,
        limits: [],
      };
    }

    return {
      axisDimension,
      limits: measure.limits
        .map((limit) => {
          const { limit: maybeLimit, relatedAxisDimensionValueLabel } =
            getMaybeValidChartConfigLimit({
              chartConfig,
              measureId: measure.id,
              limit,
              axisDimension,
              filters,
            });

          return maybeLimit
            ? {
                configLimit: {
                  ...maybeLimit,
                  symbolType:
                    limit.type === "single" &&
                    getSupportsLimitSymbols(chartConfig)
                      ? (maybeLimit.symbolType ?? "circle")
                      : undefined,
                },
                measureLimit: limit,
                relatedAxisDimensionValueLabel,
              }
            : null;
        })
        .filter(truthy),
    };
  }, [chartConfig, filters, measure, axisDimension]);
};

export const getSupportsLimitSymbols = (chartConfig: ChartConfig) => {
  return chartConfig.chartType === "area" || chartConfig.chartType === "line";
};

import { useMemo } from "react";

import {
  ChartConfig,
  ConfiguratorState,
  Cube,
  Filters,
  FilterValue,
  FilterValueMulti,
  FilterValueSingle,
  SingleFilters,
} from "@/config-types";
import { ObservationValue } from "@/domain/data";
import { mkJoinById } from "@/graphql/join";

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

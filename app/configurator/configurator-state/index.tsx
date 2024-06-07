import produce from "immer";
import get from "lodash/get";
import pickBy from "lodash/pickBy";
import set from "lodash/set";

import { getChartSpec } from "@/charts/chart-config-ui-options";
import {
  ChartConfig,
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateLayouting,
  ConfiguratorStatePublished,
  ConfiguratorStatePublishing,
  enableLayouting,
  extractSingleFilters,
  FilterValue,
  getChartConfig,
  getChartConfigFilters,
  isColorFieldInConfig,
  isSingleFilters,
} from "@/config-types";
import { Dimension, isJoinByComponent, ObservationValue } from "@/domain/data";
import { DEFAULT_DATA_SOURCE } from "@/domain/datasource";
import { mkJoinById } from "@/graphql/join";
import { getDataSourceFromLocalStorage } from "@/stores/data-source";

import { ConfiguratorStateAction } from "./actions";

export {
  ConfiguratorStateProvider,
  useConfiguratorState,
  useReadOnlyConfiguratorState,
} from "./context";
export { initChartStateFromChartEdit, initChartStateFromCube } from "./init";
export { saveChartLocally } from "./localstorage";

export type GetConfiguratorStateAction<
  T extends ConfiguratorStateAction["type"],
> = Extract<ConfiguratorStateAction, { type: T }>;

export const getStateWithCurrentDataSource = (state: ConfiguratorState) => {
  const dataSource = getDataSourceFromLocalStorage();

  return {
    ...state,
    dataSource: dataSource ?? DEFAULT_DATA_SOURCE,
  };
};

export const getPreviousState = (
  draft: ConfiguratorState
): Exclude<ConfiguratorState["state"], "INITIAL" | "PUBLISHING"> => {
  switch (draft.state) {
    case "SELECTING_DATASET":
      return draft.state;
    case "CONFIGURING_CHART":
      return "SELECTING_DATASET";
    case "LAYOUTING":
      return "CONFIGURING_CHART";
    case "PUBLISHING":
      if (enableLayouting(draft)) {
        return "LAYOUTING";
      }

      return "CONFIGURING_CHART";
    default:
      return "SELECTING_DATASET";
  }
};
// FIXME: should by handled better, as color is a subfield and not actual field.
// Side effects in ui encodings?
const getNonGenericFieldValues = (chartConfig: ChartConfig): string[] => {
  const iris: string[] = [];

  if (isColorFieldInConfig(chartConfig)) {
    if (chartConfig.fields.areaLayer?.color.type === "categorical") {
      iris.push(chartConfig.fields.areaLayer.color.componentIri);
    }

    if (chartConfig.fields.symbolLayer?.color.type === "categorical") {
      iris.push(chartConfig.fields.symbolLayer.color.componentIri);
    }
  }

  return iris;
};

/** Get all filters by mapping status.
 *
 * We need to handle some fields differently due to the way the chart config
 * is structured at the moment (colorField) is a subfield of areaLayer and
 * symbolLayer fields.
 */
export const getFiltersByMappingStatus = (
  chartConfig: ChartConfig,
  options: {
    /** Treat original iris of joinBy dimension as fields (currently joinBy dimension
     * can only be mapped to a field).
     *
     * This ensures that we won't apply single filters to original joinBy dimensions.
     *  */
    joinByIris?: string[];
    cubeIri?: string;
  }
) => {
  const { joinByIris, cubeIri } = options;
  const genericFieldValues = Object.values(chartConfig.fields).map(
    (d) => d.componentIri
  );
  const nonGenericFieldValues = getNonGenericFieldValues(chartConfig);
  const iris = new Set([
    ...genericFieldValues,
    ...nonGenericFieldValues,
    ...(joinByIris ?? []),
  ]);
  const filters = getChartConfigFilters(chartConfig.cubes, { cubeIri });
  const mappedFilters = pickBy(filters, (_, iri) => iris.has(iri));
  const unmappedFilters = pickBy(filters, (_, iri) => !iris.has(iri));

  if (!isSingleFilters(unmappedFilters)) {
    console.warn("Unmapped filters must be single filters!");
  }

  return {
    mappedFilters,
    mappedFiltersIris: iris,
    unmappedFilters: extractSingleFilters(unmappedFilters),
  };
};

export const getChartOptionField = (
  state: ConfiguratorStateConfiguringChart,
  field: string | null,
  path: string,
  defaultValue: string | boolean = ""
) => {
  const chartConfig = getChartConfig(state);

  return get(
    chartConfig,
    field === null ? path : `fields["${field}"].${path}`,
    defaultValue
  );
};

export const getFilterValue = (
  state: ConfiguratorState,
  dimension: Dimension
): FilterValue | undefined => {
  if (state.state === "INITIAL" || state.state === "SELECTING_DATASET") {
    return;
  }

  const chartConfig = getChartConfig(state);
  const filters = getChartConfigFilters(chartConfig.cubes);

  return isJoinByComponent(dimension)
    ? // As filters are mirrored between the cubes, we can just pick the first one.
      filters[dimension.originalIris[0].dimensionIri]
    : filters[dimension.iri];
};

export const moveFilterField = produce(
  (
    chartConfig: ChartConfig,
    {
      dimension,
      delta,
      possibleValues,
    }: {
      dimension: Dimension;
      delta: number;
      possibleValues: ObservationValue[];
    }
  ) => {
    const cube = chartConfig.cubes.find(
      (cube) => cube.iri === dimension.cubeIri
    );

    if (!cube) {
      return;
    }

    // Use getOwnPropertyNames instead of keys since the spec ensures that
    // the order of the keys received is in insertion order
    // https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
    const keys = Object.getOwnPropertyNames(cube.filters);
    const fieldIndex = Object.keys(cube.filters).indexOf(dimension.iri);

    if (fieldIndex === 0 && delta === -1) {
      return;
    }

    if (fieldIndex === keys.length - 1 && delta === 1) {
      return;
    }

    if (fieldIndex === -1 && delta !== -1) {
      return;
    }

    const replacedIndex =
      fieldIndex === -1 ? keys.length - 1 : fieldIndex + delta;
    const replaced = keys[replacedIndex];
    keys[replacedIndex] = dimension.iri;

    if (fieldIndex === -1) {
      keys.push(replaced);
    } else {
      keys[fieldIndex] = replaced;
    }

    cube.filters = Object.fromEntries(
      keys.map((k) => [
        k,
        cube.filters[k] ?? { type: "single", value: possibleValues[0] },
      ])
    );
  }
);

export const isConfiguring = (
  s: ConfiguratorState
): s is ConfiguratorStateConfiguringChart => {
  return s.state === "CONFIGURING_CHART";
};

export const isLayouting = (
  s: ConfiguratorState
): s is ConfiguratorStateLayouting => {
  return s.state === "LAYOUTING";
};

export const isPublishing = (
  s: ConfiguratorState
): s is ConfiguratorStatePublishing => {
  return s.state === "PUBLISHING";
};

export const isPublished = (
  s: ConfiguratorState
): s is ConfiguratorStatePublished => {
  return s.state === "PUBLISHED";
};

export const hasChartConfigs = (
  s: ConfiguratorState
): s is ConfiguratorStateWithChartConfigs => {
  return "chartConfigs" in s;
};

export type ConfiguratorStateWithChartConfigs = Extract<
  ConfiguratorState,
  { chartConfigs: ChartConfig[] }
>;

export const addDatasetInConfig = function (
  config: ConfiguratorStateConfiguringChart,
  options: {
    iri: string;
    joinBy: {
      left: string[];
      right: string[];
    };
  }
) {
  const { iri, joinBy } = options;
  for (const chartConfig of config.chartConfigs) {
    chartConfig.cubes[0].joinBy = joinBy.left;
    chartConfig.cubes.push({
      iri: iri,
      publishIri: iri,
      joinBy: joinBy.right,
      filters: {},
    });

    // Need to go over fields, and replace any IRI part of the joinBy by "joinBy"
    const { encodings } = getChartSpec(chartConfig);
    const encodingAndFields = encodings.map(
      (e) =>
        [
          e,
          chartConfig.fields[e.field as keyof typeof chartConfig.fields] as any,
        ] as const
    );
    for (const [encoding, field] of encodingAndFields) {
      if (!field) {
        continue;
      }
      for (const iriAttribute of encoding.iriAttributes) {
        const value = get(field, iriAttribute);
        const index = joinBy.left.indexOf(value) ?? joinBy.right.indexOf(value);
        if (index > -1) {
          set(field, iriAttribute, mkJoinById(index));
        }
      }
    }
  }
};

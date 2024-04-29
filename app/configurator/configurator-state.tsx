import { PUBLISHED_STATE } from "@prisma/client";
import produce, { current, Draft } from "immer";
import get from "lodash/get";
import pickBy from "lodash/pickBy";
import set from "lodash/set";
import setWith from "lodash/setWith";
import sortBy from "lodash/sortBy";
import unset from "lodash/unset";
import { NextRouter, useRouter } from "next/router";
import { createContext, Dispatch, useContext, useEffect, useMemo } from "react";
import { Client, useClient } from "urql";
import { Reducer, useImmerReducer } from "use-immer";

import {
  getChartConfigAdjustedToChartType,
  getFieldComponentIris,
  getGroupedFieldIris,
  getHiddenFieldIris,
  getInitialConfig,
  getPossibleChartTypes,
} from "@/charts";
import {
  EncodingFieldType,
  getChartFieldChangeSideEffect,
  getChartFieldOptionChangeSideEffect,
  getChartSpec,
} from "@/charts/chart-config-ui-options";
import { getPossibleFiltersQueryVariables } from "@/charts/shared/ensure-possible-filters";
import {
  ChartConfig,
  ChartType,
  ColorMapping,
  ColumnStyleCategory,
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateLayouting,
  ConfiguratorStatePublished,
  ConfiguratorStatePublishing,
  ConfiguratorStateSelectingDataSet,
  DataSource,
  decodeConfiguratorState,
  enableLayouting,
  extractSingleFilters,
  Filters,
  FilterValue,
  GenericField,
  GenericFields,
  getChartConfig,
  getChartConfigFilters,
  ImputationType,
  InteractiveFiltersConfig,
  isAreaConfig,
  isColorFieldInConfig,
  isSingleFilters,
  isTableConfig,
  Layout,
  makeMultiFilter,
} from "@/config-types";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { toggleInteractiveFilterDataDimension } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { ParsedConfig } from "@/db/config";
import {
  DataCubeComponents,
  Dimension,
  DimensionValue,
  isGeoDimension,
  isJoinByComponent,
  ObservationValue,
} from "@/domain/data";
import { DEFAULT_DATA_SOURCE } from "@/domain/datasource";
import { executeDataCubesComponentsQuery } from "@/graphql/hooks";
import {
  getOriginalDimension,
  JOIN_BY_CUBE_IRI,
  joinByDimensionId,
} from "@/graphql/join";
import {
  ObservationFilter,
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
} from "@/graphql/query-hooks";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";
import { useUser } from "@/login/utils";
import { findInHierarchy } from "@/rdf/tree-utils";
import {
  getDataSourceFromLocalStorage,
  useDataSourceStore,
} from "@/stores/data-source";
import { getCachedComponents } from "@/urql-cache";
import { assert } from "@/utils/assert";
import {
  createConfig,
  fetchChartConfig,
  updateConfig,
} from "@/utils/chart-config/api";
import {
  upgradeConfiguratorState,
  upgradeCubePublishIri,
} from "@/utils/chart-config/upgrade-cube";
import {
  CONFIGURATOR_STATE_VERSION,
  migrateConfiguratorState,
} from "@/utils/chart-config/versioning";
import { createChartId } from "@/utils/create-chart-id";
import { getRouterChartId } from "@/utils/router/helpers";
import { unreachableError } from "@/utils/unreachable";

export type ConfiguratorStateAction =
  | {
      type: "INITIALIZED";
      value: ConfiguratorState;
    }
  | {
      type: "STEP_NEXT";
      dataCubesComponents: DataCubeComponents;
    }
  | {
      type: "STEP_PREVIOUS";
      to?: Exclude<
        ConfiguratorState["state"],
        "INITIAL" | "PUBLISHING" | "PUBLISHED"
      >;
    }
  | {
      type: "DATASOURCE_CHANGED";
      value: DataSource;
    }
  | {
      type: "DATASET_ADD";
      value: {
        iri: string;
        joinBy: {
          left: string[];
          right: string[];
        };
      };
    }
  | {
      type: "DATASET_REMOVE";
      value: {
        iri: string;
        locale: Locale;
      };
    }
  | {
      type: "CHART_TYPE_CHANGED";
      value: {
        locale: Locale;
        chartKey: string;
        chartType: ChartType;
      };
    }
  | {
      type: "CHART_ACTIVE_FIELD_CHANGED";
      value: string | undefined;
    }
  | {
      type: "CHART_FIELD_CHANGED";
      value: {
        locale: Locale;
        field: EncodingFieldType;
        componentIri: string;
        selectedValues?: $FixMe[];
      };
    }
  | {
      type: "CHART_OPTION_CHANGED";
      value: {
        locale: Locale;
        path: string;
        field: EncodingFieldType | null;
        value:
          | string
          | number
          | boolean
          | Record<string, string | number | boolean>
          | (string | number | boolean)[]
          | (string | number | boolean)[][]
          | undefined;
      };
    }
  | {
      type: "CHART_PALETTE_CHANGED";
      value: {
        field: string;
        colorConfigPath?: string;
        palette: string;
        colorMapping: Record<string, string>;
      };
    }
  | {
      type: "CHART_PALETTE_RESET";
      value: {
        field: string;
        colorConfigPath?: string;
        colorMapping: Record<string, string>;
      };
    }
  | {
      type: "CHART_COLOR_CHANGED";
      value: {
        field: string;
        colorConfigPath?: string;
        value: string;
        color: string;
      };
    }
  | {
      type: "CHART_FIELD_DELETED";
      value: {
        locale: Locale;
        field: string;
      };
    }
  | {
      type: "CHART_ANNOTATION_CHANGED";
      value: {
        path: string | string[];
        value: string;
      };
    }
  | {
      type: "INTERACTIVE_FILTER_CHANGED";
      value: InteractiveFiltersConfig;
    }
  | {
      type: "CHART_CONFIG_REPLACED";
      value: {
        chartConfig: ChartConfig;
        dataCubesComponents: DataCubeComponents;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_SINGLE";
      value: {
        filters: {
          cubeIri: string;
          dimensionIri: string;
        }[];
        value: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_REMOVE_SINGLE";
      value: {
        cubeIri: string;
        dimensionIri: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTERS_UPDATE";
      value: {
        cubeIri: string;
        filters: Filters;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_MULTI";
      value: {
        cubeIri: string;
        dimensionIri: string;
        values: string[];
      };
    }
  | {
      type: "CHART_CONFIG_UPDATE_COLOR_MAPPING";
      value: {
        field: string;
        colorConfigPath: string | undefined;
        dimensionIri: string;
        values: DimensionValue[];
        random: boolean;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_RANGE";
      value: {
        dimension: Dimension;
        from: string;
        to: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_RESET_RANGE";
      value: {
        cubeIri: string;
        dimensionIri: string;
      };
    }
  | {
      type: "IMPUTATION_TYPE_CHANGED";
      value: {
        type: ImputationType;
      };
    }
  | {
      type: "PUBLISH_FAILED";
    }
  | {
      type: "PUBLISHED";
      value: string;
    }
  | {
      type: "CHART_CONFIG_ADD";
      value: {
        chartConfig: ChartConfig;
        locale: Locale;
      };
    }
  | {
      type: "CHART_CONFIG_REMOVE";
      value: {
        chartKey: string;
      };
    }
  | {
      type: "CHART_CONFIG_REORDER";
      value: {
        oldIndex: number;
        newIndex: number;
      };
    }
  | {
      type: "CHART_CONFIG_SWAP";
      value: {
        oldIndex: number;
        newIndex: number;
      };
    }
  | {
      type: "SWITCH_ACTIVE_CHART";
      value: string;
    }
  | {
      type: "LAYOUT_CHANGED";
      value: Layout;
    }
  | {
      type: "LAYOUT_ACTIVE_FIELD_CHANGED";
      value: string | undefined;
    }
  | {
      type: "LAYOUT_ANNOTATION_CHANGED";
      value: {
        path: string | string[];
        value: string;
      };
    };

export type GetConfiguratorStateAction<
  T extends ConfiguratorStateAction["type"],
> = Extract<ConfiguratorStateAction, { type: T }>;

const LOCALSTORAGE_PREFIX = "vizualize-configurator-state";
export const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

const getStateWithCurrentDataSource = (state: ConfiguratorState) => {
  const dataSource = getDataSourceFromLocalStorage();

  return {
    ...state,
    dataSource: dataSource ?? DEFAULT_DATA_SOURCE,
  };
};

const INITIAL_STATE: ConfiguratorState = {
  version: CONFIGURATOR_STATE_VERSION,
  state: "INITIAL",
  dataSource: DEFAULT_DATA_SOURCE,
};

const SELECTING_DATASET_STATE: ConfiguratorStateSelectingDataSet = {
  ...INITIAL_STATE,
  version: CONFIGURATOR_STATE_VERSION,
  state: "SELECTING_DATASET",
  dataSource: DEFAULT_DATA_SOURCE,
  chartConfigs: undefined,
  layout: undefined,
  activeChartKey: undefined,
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

/**
 * Is responsible for inferring filters when changing chart type, or when
 * changing some chart fields. Makes sure that we are always showing the
 * non-"duplicated" data (with the correct filters for key dimensions).
 */
export const deriveFiltersFromFields = produce(
  (
    draft: ChartConfig,
    options: {
      /** Possibly joined dimensions */
      dimensions: Dimension[];
      possibleFilters?: ObservationFilter[];
    }
  ) => {
    const { dimensions, possibleFilters } = options;

    const getCubeDimensions = (dimensions: Dimension[], cubeIri: string) => {
      return dimensions.filter(
        (d) => d.cubeIri === cubeIri || d.cubeIri === JOIN_BY_CUBE_IRI
      );
    };

    if (draft.chartType === "table") {
      // As dimensions in tables behave differently than in other chart types,
      // they need to be handled in a different way.
      const hiddenFieldIris = getHiddenFieldIris(draft.fields);
      const groupedDimensionIris = getGroupedFieldIris(draft.fields);
      const isHidden = (dimension: Dimension) =>
        hiddenFieldIris.has(dimension.iri);
      const isGrouped = (dimension: Dimension) =>
        groupedDimensionIris.has(dimension.iri);
      draft.cubes.forEach((cube) => {
        const cubeDimensions = getCubeDimensions(dimensions, cube.iri);
        cubeDimensions.forEach((dimension) => {
          applyTableDimensionToFilters({
            cubeIri: cube.iri,
            filters: cube.filters,
            dimension,
            isHidden: isHidden(dimension),
            isGrouped: isGrouped(dimension),
            possibleFilter: possibleFilters?.find(
              (f) => f.iri === dimension.iri
            ),
          });
        });
      });
    } else {
      const fieldDimensionIris = getFieldComponentIris(draft.fields);
      const isField = (dimension: Dimension) =>
        fieldDimensionIris.has(dimension.iri);
      draft.cubes.forEach((cube) => {
        const cubeDimensions = getCubeDimensions(dimensions, cube.iri);
        const sortedCubeDimensions = sortBy(
          cubeDimensions,
          (d) => (isGeoDimension(d) ? -1 : 1),
          (d) => (d.hierarchy ? -1 : 1)
        );
        sortedCubeDimensions.forEach((dimension) => {
          applyNonTableDimensionToFilters({
            cubeIri: cube.iri,
            filters: cube.filters,
            dimension: isJoinByComponent(dimension)
              ? getOriginalDimension(dimension, cube)
              : dimension,
            isField: isField(dimension),
            possibleFilter: possibleFilters?.find(
              (f) => f.iri === dimension.iri
            ),
          });
        });
      });
    }
  }
);

export const applyTableDimensionToFilters = (props: {
  cubeIri: string;
  filters: Filters;
  dimension: Dimension;
  isHidden: boolean;
  isGrouped: boolean;
  possibleFilter?: ObservationFilter;
}) => {
  const { filters, dimension, isHidden, isGrouped, possibleFilter, cubeIri } =
    props;
  const originalIri = isJoinByComponent(dimension)
    ? dimension.originalIris.find((c) => c.cubeIri === cubeIri)?.dimensionIri
    : dimension.iri;
  assert(originalIri !== undefined, "Dimension should have an IRI");
  const currentFilter = filters[originalIri];
  const shouldBecomeSingleFilter = isHidden && !isGrouped;

  if (currentFilter) {
    switch (currentFilter.type) {
      case "single":
        if (!shouldBecomeSingleFilter) {
          delete filters[originalIri];
        }
        break;
      case "multi":
        if (shouldBecomeSingleFilter && dimension.isKeyDimension) {
          filters[originalIri] = {
            type: "single",
            value:
              Object.keys(currentFilter.values)[0] ?? dimension.values[0].value,
          };
        }
        break;
      case "range":
        if (shouldBecomeSingleFilter) {
          filters[originalIri] = {
            type: "single",
            value: currentFilter.from,
          };
        }
        break;
      default:
        const _exhaustiveCheck: never = currentFilter;
        return _exhaustiveCheck;
    }
  } else if (shouldBecomeSingleFilter && dimension.isKeyDimension) {
    filters[originalIri] = {
      type: "single",
      // TODO, possibly in case of join by dimensions, we could get a value that is not part
      // of of the full range of values
      value: possibleFilter?.value ?? dimension.values[0].value,
    };
  }
};

export const applyNonTableDimensionToFilters = (props: {
  cubeIri: string;
  filters: Filters;
  dimension: Dimension;
  isField: boolean;
  possibleFilter?: ObservationFilter;
}) => {
  const { filters, dimension, isField, possibleFilter, cubeIri } = props;
  const originalIri = isJoinByComponent(dimension)
    ? dimension.originalIris.find((c) => c.cubeIri === cubeIri)?.dimensionIri
    : dimension.iri;
  assert(originalIri !== undefined, "Dimension should have an IRI");
  const currentFilter = filters[originalIri];

  if (currentFilter) {
    switch (currentFilter.type) {
      case "single":
        if (isField) {
          // When a dimension is either x, y or segment, we want to clear the filter.
          delete filters[originalIri];
        }
        break;
      // Multi-filters are not allowed in the left panel.
      case "multi":
        if (!isField) {
          const hierarchyTopMost = dimension.hierarchy
            ? findInHierarchy(dimension.hierarchy, (v) => !!v.hasValue)
            : undefined;
          const filterValue = hierarchyTopMost
            ? hierarchyTopMost.value
            : Object.keys(currentFilter.values)[0] ?? dimension.values[0].value;
          filters[originalIri] = {
            type: "single",
            value: filterValue,
          };
        }
        break;
      case "range":
        if (!isField) {
          // Range-filters are not allowed in the left panel.
          filters[originalIri] = {
            type: "single",
            value: currentFilter.from,
          };
        }
        break;
      default:
        const _exhaustiveCheck: never = currentFilter;
        return _exhaustiveCheck;
    }
  } else if (!isField && dimension.isKeyDimension) {
    // If this scenario appears, it means that current filter is undefined -
    // which means it must be converted to a single-filter (if it's a keyDimension,
    // otherwise a 'No filter' option should be selected by default).

    // Find the topmost hierarchy value
    const hierarchyTopMost = dimension.hierarchy
      ? findInHierarchy(dimension.hierarchy, (v) => !!v.hasValue)
      : undefined;
    const filterValue = hierarchyTopMost
      ? hierarchyTopMost.value
      : possibleFilter?.value ?? dimension.values[0]?.value;

    if (filterValue) {
      filters[dimension.iri] = {
        type: "single",
        value: filterValue,
      };
    }
  }
};

const getInitialConfiguringConfigBasedOnCube = (props: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
}): ConfiguratorStateConfiguringChart => {
  const { chartConfig, dataSource } = props;
  return {
    version: CONFIGURATOR_STATE_VERSION,
    state: "CONFIGURING_CHART",
    dataSource,
    layout: {
      type: "tab",
      meta: {
        title: {
          de: "",
          en: "",
          fr: "",
          it: "",
        },
        description: {
          de: "",
          en: "",
          fr: "",
          it: "",
        },
      },
      activeField: undefined,
    },
    chartConfigs: [chartConfig],
    activeChartKey: chartConfig.key,
  };
};

const transitionStepNext = (
  draft: ConfiguratorState,
  options?: {
    chartConfig?: ChartConfig;
  }
): ConfiguratorState => {
  const { chartConfig } = options ?? {};

  switch (draft.state) {
    case "SELECTING_DATASET":
      if (chartConfig) {
        return getInitialConfiguringConfigBasedOnCube({
          dataSource: draft.dataSource,
          chartConfig,
        });
      }
      break;
    case "CONFIGURING_CHART":
      return {
        ...draft,
        state: enableLayouting(draft) ? "LAYOUTING" : "PUBLISHING",
        activeChartKey: draft.chartConfigs[0].key,
      };
    case "LAYOUTING":
      return {
        ...draft,
        state: "PUBLISHING",
      };

    case "INITIAL":
    case "PUBLISHING":
    case "PUBLISHED":
      break;
    default:
      throw unreachableError(draft);
  }

  return draft;
};

const getPreviousState = (
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

const transitionStepPrevious = (
  draft: ConfiguratorState,
  to?: Exclude<ConfiguratorState["state"], "INITIAL" | "PUBLISHING">
): ConfiguratorState => {
  const stepTo = to ?? getPreviousState(draft);

  if (draft.state === "INITIAL" || draft.state === "SELECTING_DATASET") {
    return draft;
  }

  switch (stepTo) {
    case "SELECTING_DATASET":
      return {
        ...draft,
        layout: undefined,
        chartConfigs: undefined,
        activeChartKey: undefined,
        state: stepTo,
      };
    case "CONFIGURING_CHART":
      return {
        ...draft,
        state: stepTo,
        layout: {
          ...draft.layout,
          activeField: undefined,
        },
        chartConfigs: draft.chartConfigs.map((chartConfig) => ({
          ...chartConfig,
          activeField: undefined,
        })),
        activeChartKey: draft.chartConfigs[0].key,
      };
    case "LAYOUTING":
      return {
        ...draft,
        state: stepTo,
      };
  }

  return draft;
};

// FIXME: should by handled better, as color is a subfield and not actual field.
// Side effects in ui encodings?
export const getNonGenericFieldValues = (
  chartConfig: ChartConfig
): string[] => {
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

export const handleChartFieldChanged = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_FIELD_CHANGED" }>
) => {
  if (!isConfiguring(draft)) {
    return draft;
  }

  const chartConfig = getChartConfig(draft);
  const {
    locale,
    field,
    componentIri,
    selectedValues: actionSelectedValues,
  } = action.value;
  const f = get(chartConfig.fields, field);
  const dataCubesComponents = getCachedComponents(
    draft.dataSource,
    chartConfig.cubes.map((cube) => ({
      iri: cube.iri,
      joinBy: cube.joinBy,
    })),
    locale
  );
  const dimensions = dataCubesComponents?.dimensions ?? [];
  const measures = dataCubesComponents?.measures ?? [];
  const components = [...dimensions, ...measures];
  const component = components.find((d) => d.iri === componentIri);
  const selectedValues = actionSelectedValues ?? component?.values ?? [];

  if (f) {
    // Reset field properties, excluding componentIri.
    (chartConfig.fields as GenericFields)[field] = { componentIri };
  }

  const sideEffect = getChartFieldChangeSideEffect(chartConfig, field);
  sideEffect?.(componentIri, {
    chartConfig,
    dimensions,
    measures,
    initializing: !f,
    selectedValues,
    field,
  });

  // Remove the component from interactive data filters.
  if (chartConfig.interactiveFiltersConfig?.dataFilters) {
    const componentIris =
      chartConfig.interactiveFiltersConfig.dataFilters.componentIris.filter(
        (d) => d !== componentIri
      );
    const active = componentIris.length > 0;
    chartConfig.interactiveFiltersConfig.dataFilters = {
      active,
      componentIris,
    };
  }

  const newConfig = deriveFiltersFromFields(chartConfig, { dimensions });
  const index = draft.chartConfigs.findIndex((d) => d.key === chartConfig.key);
  draft.chartConfigs[index] = newConfig;

  return draft;
};

export const handleChartOptionChanged = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_OPTION_CHANGED" }>
) => {
  if (isConfiguring(draft)) {
    const { locale, path, field, value } = action.value;
    const chartConfig = getChartConfig(draft);
    const updatePath = field === null ? path : `fields["${field}"].${path}`;
    const dataCubesComponents = getCachedComponents(
      draft.dataSource,
      chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
      locale
    );

    const dimensions = dataCubesComponents?.dimensions ?? [];
    const measures = dataCubesComponents?.measures ?? [];

    if (field) {
      const sideEffect = getChartFieldOptionChangeSideEffect(
        chartConfig,
        field,
        path
      );
      sideEffect?.(value, { chartConfig, dimensions, measures, field });
    }

    if (value === FIELD_VALUE_NONE) {
      unset(chartConfig, updatePath);
    }

    setWith(chartConfig, updatePath, value, Object);
  }

  return draft;
};

export const updateColorMapping = (
  draft: ConfiguratorState,
  action: Extract<
    ConfiguratorStateAction,
    { type: "CHART_CONFIG_UPDATE_COLOR_MAPPING" }
  >
) => {
  if (isConfiguring(draft)) {
    const { field, colorConfigPath, dimensionIri, values, random } =
      action.value;
    const chartConfig = getChartConfig(draft);
    const path = colorConfigPath
      ? ["fields", field, colorConfigPath]
      : ["fields", field];
    let colorMapping: ColorMapping | undefined;

    if (isTableConfig(chartConfig)) {
      const fieldValue: ColumnStyleCategory | undefined = get(
        chartConfig,
        path
      );

      if (fieldValue) {
        colorMapping = mapValueIrisToColor({
          palette: fieldValue.palette,
          dimensionValues: values,
          random,
        });
      }
    } else {
      const fieldValue: (GenericField & { palette: string }) | undefined = get(
        chartConfig,
        path
      );

      if (fieldValue?.componentIri === dimensionIri) {
        colorMapping = mapValueIrisToColor({
          palette: fieldValue.palette,
          dimensionValues: values,
          random,
        });
      }
    }

    if (colorMapping) {
      setWith(chartConfig, path.concat("colorMapping"), colorMapping, Object);
    }
  }

  return draft;
};

const handleInteractiveFilterChanged = (
  draft: ConfiguratorState,
  action: Extract<
    ConfiguratorStateAction,
    { type: "INTERACTIVE_FILTER_CHANGED" }
  >
) => {
  if (isConfiguring(draft)) {
    const chartConfig = getChartConfig(draft);
    setWith(chartConfig, "interactiveFiltersConfig", action.value, Object);
  }

  return draft;
};

export const setRangeFilter = (
  draft: ConfiguratorState,
  action: Extract<
    ConfiguratorStateAction,
    { type: "CHART_CONFIG_FILTER_SET_RANGE" }
  >
) => {
  const { dimension, from, to } = action.value;
  const chartConfig = getChartConfig(draft);
  const adjustFilter = (cubeIri: string, dimensionIri: string) => {
    const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

    if (cube) {
      cube.filters[dimensionIri] = {
        type: "range",
        from,
        to,
      };
    }
  };

  if (dimension.isJoinByDimension) {
    for (const { cubeIri, dimensionIri } of dimension.originalIris) {
      adjustFilter(cubeIri, dimensionIri);
    }
  } else {
    adjustFilter(dimension.cubeIri, dimension.iri);
  }

  if (chartConfig.interactiveFiltersConfig) {
    chartConfig.interactiveFiltersConfig.timeRange = {
      componentIri: dimension.iri,
      active: chartConfig.interactiveFiltersConfig.timeRange.active,
      presets: {
        type: "range",
        from,
        to,
      },
    };
  }
};

const reducer_: Reducer<ConfiguratorState, ConfiguratorStateAction> = (
  draft,
  action
) => {
  switch (action.type) {
    case "INITIALIZED":
      // Never restore from an UNINITIALIZED state
      return action.value.state === "INITIAL"
        ? getStateWithCurrentDataSource(SELECTING_DATASET_STATE)
        : action.value;
    case "DATASOURCE_CHANGED":
      draft.dataSource = action.value;

      return draft;

    case "CHART_TYPE_CHANGED":
      if (isConfiguring(draft)) {
        const { locale, chartKey, chartType } = action.value;
        const chartConfig = getChartConfig(draft, chartKey);
        const dataCubesComponents = getCachedComponents(
          draft.dataSource,
          chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
          })),
          locale
        );
        const dimensions = dataCubesComponents?.dimensions;
        const measures = dataCubesComponents?.measures;

        if (dimensions && measures) {
          const newConfig = deriveFiltersFromFields(
            getChartConfigAdjustedToChartType({
              chartConfig: current(chartConfig),
              newChartType: chartType,
              dimensions,
              measures,
            }),
            { dimensions }
          );

          const index = draft.chartConfigs.findIndex(
            (d) => d.key === chartConfig.key
          );
          draft.chartConfigs[index] = newConfig;
        }
      }

      return draft;

    case "CHART_ACTIVE_FIELD_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        chartConfig.activeField = action.value;
      }

      return draft;

    case "CHART_FIELD_CHANGED":
      return handleChartFieldChanged(draft, action);

    case "CHART_FIELD_DELETED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        delete (chartConfig.fields as GenericFields)[action.value.field];
        const dataCubesComponents = getCachedComponents(
          draft.dataSource,
          chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
          })),
          action.value.locale
        );
        const dimensions = dataCubesComponents?.dimensions ?? [];
        const newConfig = deriveFiltersFromFields(chartConfig, { dimensions });
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === chartConfig.key
        );
        draft.chartConfigs[index] = newConfig;

        if (
          action.value.field === "segment" &&
          chartConfig.interactiveFiltersConfig
        ) {
          chartConfig.interactiveFiltersConfig.calculation.active = false;
          chartConfig.interactiveFiltersConfig.calculation.type = "identity";
        }
      }

      return draft;

    case "CHART_OPTION_CHANGED":
      return handleChartOptionChanged(draft, action);

    case "CHART_PALETTE_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `fields["${action.value.field}"].${
            action.value.colorConfigPath
              ? `${action.value.colorConfigPath}.`
              : ""
          }palette`,
          action.value.palette,
          Object
        );
        setWith(
          chartConfig,
          `fields["${action.value.field}"].${
            action.value.colorConfigPath
              ? `${action.value.colorConfigPath}.`
              : ""
          }colorMapping`,
          action.value.colorMapping,
          Object
        );
      }

      return draft;

    case "CHART_PALETTE_RESET":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `fields["${action.value.field}"].${
            action.value.colorConfigPath
              ? `${action.value.colorConfigPath}.`
              : ""
          }colorMapping`,
          action.value.colorMapping,
          Object
        );
      }

      return draft;

    case "CHART_COLOR_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `fields["${action.value.field}"].${
            action.value.colorConfigPath
              ? `${action.value.colorConfigPath}.`
              : ""
          }colorMapping["${action.value.value}"]`,
          action.value.color,
          Object
        );
      }
      return draft;

    case "CHART_ANNOTATION_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `meta.${action.value.path}`,
          action.value.value,
          Object
        );
      }

      return draft;

    case "INTERACTIVE_FILTER_CHANGED":
      return handleInteractiveFilterChanged(draft, action);

    case "CHART_CONFIG_REPLACED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === chartConfig.key
        );
        draft.chartConfigs[index] = deriveFiltersFromFields(
          action.value.chartConfig,
          { dimensions: action.value.dataCubesComponents.dimensions }
        );
      }

      return draft;

    case "CHART_CONFIG_FILTER_SET_SINGLE":
      if (isConfiguring(draft)) {
        const { filters, value } = action.value;
        const chartConfig = getChartConfig(draft);

        /*
         * We are getting a list of filters, since setting a single filter in the UI
         * in the case of joined dimensions, sets multiple filters inside the chart
         * configuration.
         */
        for (const filter of filters) {
          const { cubeIri, dimensionIri } = filter;
          const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

          if (cube) {
            cube.filters[dimensionIri] = {
              type: "single",
              value,
            };
          } else {
            console.warn(
              `Could not set filter, no cube in chat config was found with iri ${cubeIri}`
            );
          }
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_REMOVE_SINGLE":
      if (isConfiguring(draft)) {
        const { cubeIri, dimensionIri } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          delete cube.filters[dimensionIri];
          const newIFConfig = toggleInteractiveFilterDataDimension(
            chartConfig.interactiveFiltersConfig,
            dimensionIri,
            false
          );
          chartConfig.interactiveFiltersConfig = newIFConfig;
        }
      }

      return draft;

    case "CHART_CONFIG_UPDATE_COLOR_MAPPING":
      return updateColorMapping(draft, action);

    case "CHART_CONFIG_FILTER_SET_MULTI":
      if (isConfiguring(draft)) {
        const { cubeIri, dimensionIri, values } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          cube.filters[dimensionIri] = makeMultiFilter(values);
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_RESET_RANGE":
      if (isConfiguring(draft)) {
        const { cubeIri, dimensionIri } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          delete cube.filters[dimensionIri];
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_SET_RANGE":
      if (isConfiguring(draft)) {
        setRangeFilter(draft, action);
      }

      return draft;

    case "CHART_CONFIG_FILTERS_UPDATE":
      if (isConfiguring(draft)) {
        const { cubeIri, filters } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          cube.filters = filters;
        }
      }

      return draft;

    case "IMPUTATION_TYPE_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        if (isAreaConfig(chartConfig)) {
          chartConfig.fields.y.imputationType = action.value.type;
        }
      }

      return draft;

    // State transitions
    case "STEP_NEXT":
      return transitionStepNext(draft);

    case "STEP_PREVIOUS":
      return transitionStepPrevious(draft, action.to);

    // Special state transitions
    case "PUBLISH_FAILED":
      if (draft.state === "PUBLISHING") {
        return transitionStepPrevious(draft);
      }
      return draft;

    case "PUBLISHED":
      return draft;

    case "CHART_CONFIG_ADD":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        const dataCubesComponents = getCachedComponents(
          draft.dataSource,
          chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
          })),
          action.value.locale
        );

        if (dataCubesComponents) {
          const newConfig = deriveFiltersFromFields(
            {
              ...action.value.chartConfig,
              // Need to finalize the cubes draft to avoid revoked proxy errors
              cubes: current(chartConfig.cubes),
            },
            { dimensions: dataCubesComponents.dimensions }
          );
          draft.chartConfigs.push(newConfig);
          draft.activeChartKey = action.value.chartConfig.key;
        }
      }

      return draft;

    case "DATASET_ADD":
      if (isConfiguring(draft)) {
        addDatasetInConfig(draft, action.value);
        return draft;
      }
      break;

    case "DATASET_REMOVE":
      if (isConfiguring(draft)) {
        const { locale } = action.value;
        const chartConfig = getChartConfig(draft);
        const removedCubeIri = action.value.iri;
        const newCubes = chartConfig.cubes.filter(
          (c) => c.iri !== removedCubeIri
        );
        const dataCubesComponents = getCachedComponents(
          draft.dataSource,
          newCubes.map((cube) => ({
            iri: cube.iri,
            // Only keep joinBy while we have more than one cube
            joinBy: newCubes.length > 1 ? cube.joinBy : undefined,
          })),
          locale
        );

        if (!dataCubesComponents) {
          throw new Error(
            "Error while removing dataset: Could not find cached dataCubesComponents"
          );
        }

        const { dimensions, measures } = dataCubesComponents;
        const iris = chartConfig.cubes
          .filter((c) => c.iri !== removedCubeIri)
          .map(({ iri, publishIri }) => ({ iri, publishIri }));
        const possibleChartTypes = getPossibleChartTypes({
          dimensions,
          measures,
          cubeCount: iris.length,
        });
        const initialConfig = getInitialConfig({
          chartType: possibleChartTypes[0],
          iris,
          dimensions,
          measures,
        });
        const newChartConfig = deriveFiltersFromFields(initialConfig, {
          dimensions,
        });
        const initConfig = getInitialConfiguringConfigBasedOnCube({
          dataSource: draft.dataSource,
          chartConfig: newChartConfig,
        });
        const newConfig = {
          ...initConfig.chartConfigs[0],
          key: chartConfig.key,
        } as ChartConfig;
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === chartConfig.key
        );
        const withFilters = deriveFiltersFromFields(newConfig, { dimensions });
        draft.chartConfigs[index] = withFilters;

        return draft;
      }
      break;
    case "CHART_CONFIG_REMOVE":
      if (isConfiguring(draft)) {
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === action.value.chartKey
        );
        const removedKey = draft.chartConfigs[index].key;
        draft.chartConfigs.splice(index, 1);

        if (removedKey === draft.activeChartKey) {
          draft.activeChartKey = draft.chartConfigs[Math.max(index - 1, 0)].key;
        }
      }

      return draft;

    case "CHART_CONFIG_REORDER":
      if (isConfiguring(draft) || draft.state === "LAYOUTING") {
        const { oldIndex, newIndex } = action.value;
        const [removed] = draft.chartConfigs.splice(oldIndex, 1);
        draft.chartConfigs.splice(newIndex, 0, removed);
      }

      return draft;

    case "CHART_CONFIG_SWAP":
      if (isConfiguring(draft) || draft.state === "LAYOUTING") {
        const { oldIndex, newIndex } = action.value;
        const oldChartConfig = draft.chartConfigs[oldIndex];
        const newChartConfig = draft.chartConfigs[newIndex];
        draft.chartConfigs[oldIndex] = newChartConfig;
        draft.chartConfigs[newIndex] = oldChartConfig;
      }

      return draft;

    case "SWITCH_ACTIVE_CHART":
      if (
        isConfiguring(draft) ||
        draft.state === "LAYOUTING" ||
        draft.state === "PUBLISHED"
      ) {
        draft.activeChartKey = action.value;
      }

      return draft;

    case "LAYOUT_CHANGED":
      if (draft.state === "LAYOUTING") {
        draft.layout = action.value;
      }

      return draft;

    case "LAYOUT_ACTIVE_FIELD_CHANGED":
      if (draft.state === "LAYOUTING") {
        draft.layout.activeField = action.value;
      }

      return draft;

    case "LAYOUT_ANNOTATION_CHANGED":
      if (draft.state === "LAYOUTING") {
        setWith(
          draft,
          `layout.meta.${action.value.path}`,
          action.value.value,
          Object
        );
      }

      return draft;

    default:
      throw unreachableError(action);
  }
};

/** Turn this on for the reducer to log state, action and result */
const reducerLogging = false;
const withLogging = <TState, TAction extends { type: unknown }>(
  reducer: Reducer<TState, TAction>
) => {
  return (state: Draft<TState>, action: TAction) => {
    const res = reducer(state, action);
    return res;
  };
};
export const reducer = reducerLogging ? withLogging(reducer_) : reducer_;

const ConfiguratorStateContext = createContext<
  [ConfiguratorState, Dispatch<ConfiguratorStateAction>] | undefined
>(undefined);

export const initChartStateFromChartCopy = async (
  client: Client,
  fromChartId: string
): Promise<ConfiguratorStateConfiguringChart | undefined> => {
  const config = await fetchChartConfig(fromChartId);

  if (config?.data) {
    // Do not keep the previous chart key
    delete config.data.key;
    const state = migrateConfiguratorState({
      ...config.data,
      state: "CONFIGURING_CHART",
    }) as ConfiguratorStateConfiguringChart;
    return await upgradeConfiguratorState(state, {
      client,
      dataSource: state.dataSource,
    });
  }
};

export const initChartStateFromChartEdit = async (
  client: Client,
  fromChartId: string
): Promise<ConfiguratorStateConfiguringChart | undefined> => {
  const config = await fetchChartConfig(fromChartId);

  if (config?.data) {
    const state = migrateConfiguratorState({
      ...config.data,
      state: "CONFIGURING_CHART",
    }) as ConfiguratorStateConfiguringChart;
    return await upgradeConfiguratorState(state, {
      client,
      dataSource: state.dataSource,
    });
  }
};

export const initChartStateFromCube = async (
  client: Client,
  cubePublishIri: string,
  dataSource: DataSource,
  locale: string
): Promise<ConfiguratorState | undefined> => {
  // Technically we already have most recent iri assured by useRedirectToLatestCube, but
  // just to be extra sure, we fetch it again here.
  const cubeIri = await upgradeCubePublishIri(cubePublishIri, {
    client,
    dataSource,
  });
  const { data: components } = await executeDataCubesComponentsQuery(client, {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
    cubeFilters: [{ iri: cubeIri, loadValues: true }],
  });

  if (!components?.dataCubesComponents) {
    throw new Error(`Could not fetch components for ${cubeIri}!`);
  }

  const { dimensions, measures } = components.dataCubesComponents;
  const possibleChartTypes = getPossibleChartTypes({
    dimensions,
    measures,
    cubeCount: 1,
  });
  const initialChartConfig = getInitialConfig({
    chartType: possibleChartTypes[0],
    iris: [{ iri: cubeIri, publishIri: cubePublishIri }],
    dimensions,
    measures,
  });
  const temporaryChartConfig = deriveFiltersFromFields(initialChartConfig, {
    dimensions,
  });
  const { unmappedFilters } = getFiltersByMappingStatus(temporaryChartConfig, {
    cubeIri,
  });
  const shouldFetchPossibleFilters = Object.keys(unmappedFilters).length > 0;
  const variables = getPossibleFiltersQueryVariables({
    cubeIri,
    dataSource,
    unmappedFilters,
  });
  const { data: possibleFilters } = await client
    .query<
      PossibleFiltersQuery,
      PossibleFiltersQueryVariables
    >(PossibleFiltersDocument, variables, { pause: !shouldFetchPossibleFilters })
    .toPromise();

  if (!possibleFilters?.possibleFilters && shouldFetchPossibleFilters) {
    throw new Error(`Could not fetch possible filters for ${cubeIri}!`);
  }

  const chartConfig = deriveFiltersFromFields(initialChartConfig, {
    dimensions,
    possibleFilters: possibleFilters?.possibleFilters,
  });

  return transitionStepNext(
    getStateWithCurrentDataSource(SELECTING_DATASET_STATE),
    { chartConfig }
  );
};

/**
 * Tries to parse state from localStorage.
 * If state is invalid, it is removed from localStorage.
 */
export const initChartStateFromLocalStorage = async (
  client: Client,
  chartId: string
): Promise<ConfiguratorState | undefined> => {
  const storedState = window.localStorage.getItem(getLocalStorageKey(chartId));

  if (!storedState) {
    return;
  }

  let state: ConfiguratorState | undefined;
  try {
    const rawState = JSON.parse(storedState);
    const migratedState = migrateConfiguratorState(rawState);
    state = decodeConfiguratorState(migratedState);
  } catch (e) {
    console.error("Error while parsing stored state", e);
  }

  if (state) {
    return upgradeConfiguratorState(state, {
      client,
      dataSource: state.dataSource,
    });
  }

  console.warn(
    "Attempted to restore invalid state. Removing from localStorage.",
    state
  );
  window.localStorage.removeItem(getLocalStorageKey(chartId));
};

export const saveChartLocally = (chartId: string, state: ConfiguratorState) => {
  window.localStorage.setItem(
    getLocalStorageKey(chartId),
    JSON.stringify(state)
  );
  return;
};

const ConfiguratorStateProviderInternal = (
  props: ConfiguratorStateProviderProps
) => {
  const {
    chartId,
    initialState,
    allowDefaultRedirect = true,
    children,
  } = props;
  const { dataSource } = useDataSourceStore();
  const initialStateWithDataSource = useMemo(() => {
    return initialState ? initialState : { ...INITIAL_STATE, dataSource };
  }, [initialState, dataSource]);
  const locale = useLocale();
  const stateAndDispatch = useImmerReducer(reducer, initialStateWithDataSource);
  const [state, dispatch] = stateAndDispatch;
  const { asPath, push, replace, query } = useRouter();
  const user = useUser();
  const client = useClient();

  // Initialize state on page load.
  useEffect(() => {
    let stateToInitialize = initialStateWithDataSource;
    const initialize = async () => {
      try {
        let newChartState;

        if (chartId === "new") {
          if (query.copy && typeof query.copy === "string") {
            newChartState = await initChartStateFromChartCopy(
              client,
              query.copy
            );
          } else if (query.edit && typeof query.edit === "string") {
            newChartState = await initChartStateFromChartEdit(
              client,
              query.edit
            );
          } else if (query.cube && typeof query.cube === "string") {
            newChartState = await initChartStateFromCube(
              client,
              query.cube,
              dataSource,
              locale
            );
          }
        } else if (chartId !== "published") {
          newChartState = await initChartStateFromLocalStorage(client, chartId);
          if (!newChartState && allowDefaultRedirect) {
            replace(`/create/new`);
          }
        }

        stateToInitialize = newChartState ?? stateToInitialize;
      } finally {
        dispatch({ type: "INITIALIZED", value: stateToInitialize });
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.state === "INITIAL" || state.state === "SELECTING_DATASET") {
      dispatch({ type: "DATASOURCE_CHANGED", value: dataSource });
    }
  }, [dataSource, dispatch, state.state]);

  useEffect(() => {
    try {
      switch (state.state) {
        case "CONFIGURING_CHART":
        case "LAYOUTING":
          const savedChartId =
            chartId === "new"
              ? query.edit && typeof query.edit === "string"
                ? query.edit
                : createChartId()
              : chartId;
          if (chartId === "new") {
            replace(`/create/${savedChartId}`);
          }
          saveChartLocally(savedChartId, state);
          return;

        case "PUBLISHING":
          (async () => {
            try {
              const key = getRouterChartId(asPath);

              if (!key) {
                return;
              }

              return publishState(
                user,
                key,
                state,
                async (result, i, total) => {
                  if (state.layout.type === "singleURLs" && i < total) {
                    // Open new tab for each chart, except the first one
                    return window.open(`/${locale}/v/${result.key}`, "_blank");
                  }

                  await handlePublishSuccess(result.key, push);
                }
              );
            } catch (e) {
              console.error(e);
              dispatch({ type: "PUBLISH_FAILED" });
            }
          })();

          return;
      }
    } catch (e) {
      console.error(e);
    }
  }, [
    state,
    dispatch,
    chartId,
    push,
    asPath,
    locale,
    query.from,
    replace,
    user,
    query.edit,
  ]);

  return (
    <ConfiguratorStateContext.Provider value={stateAndDispatch}>
      {children}
    </ConfiguratorStateContext.Provider>
  );
};

const preparePublishingState = (
  state: ConfiguratorStatePublishing,
  chartConfigs: ChartConfig[],
  activeChartKey?: string
): ConfiguratorStatePublishing => {
  return {
    ...state,
    chartConfigs: [
      ...chartConfigs.map((chartConfig) => {
        return {
          ...chartConfig,
          cubes: chartConfig.cubes.map((cube) => {
            return {
              ...cube,
              // Ensure that the filters are in the correct order, as JSON
              // does not guarantee order (and we need this as interactive
              // filters are dependent on the order of the filters).
              filters: Object.fromEntries(
                Object.entries(cube.filters).map(([k, v], i) => {
                  return [k, { ...v, position: i }];
                })
              ),
            };
          }),
        };
      }),
    ],
    // Technically, we do not need to store the active chart key, as
    // it's only used in the edit mode, but it makes it easier to manage
    // the state when retrieving the chart from the database. Potentially,
    // it might also be useful for other things in the future (e.g. when we
    // have multiple charts in the "stepper mode", and we'd like to start
    // the story from a specific point and e.g. toggle back and forth between
    // the different charts).
    activeChartKey: activeChartKey ?? state.chartConfigs[0].key,
  };
};

const handlePublishSuccess = async (
  chartId: string,
  push: NextRouter["push"]
) => {
  /**
   * EXPERIMENTAL: Post back created chart ID to opener and close window.
   *
   * This allows the chart creation workflow to be integrated with other tools like a CMS
   */

  // FIXME: Check for more than just opener?
  const opener = window.opener;
  if (opener) {
    opener.postMessage(`CHART_ID:${chartId}`, "*");
    window.close();
    return;
  }

  await push({
    pathname: `/v/${chartId}`,
    query: { publishSuccess: true },
  });
};

type ConfiguratorStateProviderProps = React.PropsWithChildren<{
  chartId: string;
  initialState?: ConfiguratorState;
  allowDefaultRedirect?: boolean;
}>;

export const ConfiguratorStateProvider = (
  props: ConfiguratorStateProviderProps
) => {
  return (
    <ConfiguratorStateProviderInternal
      // Ensure that the state is reset by using the `chartId` as `key`
      key={props.chartId}
      {...props}
    />
  );
};

export const useConfiguratorState = <T extends ConfiguratorState>(
  predicate?: (s: ConfiguratorState) => s is T
) => {
  const ctx = useContext(ConfiguratorStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need an <ConfiguratorStateProvider> to useConfiguratorState"
    );
  }

  const [state, dispatch] = ctx;

  if (predicate && !predicate(state)) {
    throw new Error("State does not respect type guard");
  }

  return [state, dispatch] as [T, typeof dispatch];
};

export const useReadOnlyConfiguratorState = <T extends ConfiguratorState>(
  predicate?: (s: ConfiguratorState) => s is T
) => {
  const ctx = useContext(ConfiguratorStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need an <ConfiguratorStateProvider> to useConfiguratorState"
    );
  }

  const [state] = ctx;

  if (predicate && !predicate(state)) {
    throw new Error("State does not respect type guard");
  }

  return state as T;
};

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
          set(field, iriAttribute, joinByDimensionId(index));
        }
      }
    }
  }
};

export async function publishState(
  user: ReturnType<typeof useUser>,
  key: string,
  state: Extract<ConfiguratorState, { state: "PUBLISHING" }>,

  /** Will be called for all configs that have been shared (multiple ones in case of layout:singleURLs) */
  onSaveConfig: (savedConfig: { key: string }, i: number, total: number) => void
) {
  switch (state.layout.type) {
    case "singleURLs":
      const { publishableChartKeys, meta } = state.layout;
      const reversedChartKeys = publishableChartKeys.slice().reverse();

      // Charts are published in order, keep the current tab open with first chart
      // subSequent charts are opened in a new window
      return allSequential(reversedChartKeys, async (chartKey, i) => {
        const preparedConfig = preparePublishingState(
          {
            ...state,
            // Ensure that the layout is reset to single-chart mode
            layout: {
              type: "tab",
              meta: meta,
              activeField: undefined,
            },
          },
          state.chartConfigs.filter((d) => d.key === chartKey) as ChartConfig[],
          chartKey
        );

        const result = await createConfig({
          data: preparedConfig,
          published_state: PUBLISHED_STATE.PUBLISHED,
        });
        onSaveConfig(result, i + 1, reversedChartKeys.length);

        return result;
      });
    default:
      let dbConfig: ParsedConfig | undefined;

      if (key && user) {
        const config = await fetchChartConfig(key);

        if (config && config.user_id === user.id) {
          dbConfig = config;
        }
      }

      const preparedConfig = preparePublishingState(state, state.chartConfigs);

      const result = await (dbConfig && user
        ? updateConfig({
            data: preparedConfig,
            key: dbConfig.key,
            published_state: PUBLISHED_STATE.PUBLISHED,
          })
        : createConfig({
            data: preparedConfig,
            published_state: PUBLISHED_STATE.PUBLISHED,
          }));

      onSaveConfig(result, 0, 1);
      return result;
  }
}

const allSequential = async <TInput, TOutput>(
  input: TInput[],
  cb: (item: TInput, i: number) => TOutput
) => {
  const res = [];
  for (let i = 0; i < input.length; i++) {
    const r = input[i];
    const result = await cb(r, i);
    res.push(result);
  }
  return res;
};

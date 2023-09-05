import produce, { current } from "immer";
import get from "lodash/get";
import pickBy from "lodash/pickBy";
import setWith from "lodash/setWith";
import sortBy from "lodash/sortBy";
import unset from "lodash/unset";
import { useRouter } from "next/router";
import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Client, useClient } from "urql";
import { Reducer, useImmerReducer } from "use-immer";

import {
  getChartConfigAdjustedToChartType,
  getFieldComponentIris,
  getGroupedFieldIris,
  getHiddenFieldIris,
  getInitialConfig,
  getPossibleChartType,
} from "@/charts";
import {
  EncodingFieldType,
  getChartFieldChangeSideEffect,
  getChartFieldOptionChangeSideEffect,
} from "@/charts/chart-config-ui-options";
import {
  ChartConfig,
  ChartType,
  ColorMapping,
  ColumnStyleCategory,
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateSelectingDataSet,
  DataSource,
  FilterValue,
  FilterValueMultiValues,
  Filters,
  GenericField,
  GenericFields,
  ImputationType,
  InteractiveFiltersConfig,
  decodeConfiguratorState,
  getChartConfig,
  isAreaConfig,
  isColorFieldInConfig,
  isTableConfig,
  makeMultiFilter,
} from "@/config-types";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { toggleInteractiveFilterDataDimension } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { DimensionValue, isGeoDimension } from "@/domain/data";
import { DEFAULT_DATA_SOURCE } from "@/domain/datasource";
import { client } from "@/graphql/client";
import {
  ComponentsWithHierarchiesDocument,
  ComponentsWithHierarchiesQuery,
  ComponentsWithHierarchiesQueryVariables,
  DataCubeMetadataDocument,
  DataCubeMetadataQuery,
  DataCubeMetadataQueryVariables,
  DimensionMetadataFragment,
  DimensionMetadataWithHierarchiesFragment,
} from "@/graphql/query-hooks";
import {
  DataCubeMetadata,
  DataCubeMetadataWithHierarchies,
} from "@/graphql/types";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";
import { findInHierarchy } from "@/rdf/tree-utils";
import {
  getDataSourceFromLocalStorage,
  useDataSourceStore,
} from "@/stores/data-source";
import { createConfig, fetchChartConfig } from "@/utils/chart-config/api";
import {
  CONFIGURATOR_STATE_VERSION,
  migrateConfiguratorState,
} from "@/utils/chart-config/versioning";
import { createChartId } from "@/utils/create-chart-id";
import { unreachableError } from "@/utils/unreachable";

export type ConfiguratorStateAction =
  | {
      type: "INITIALIZED";
      value: ConfiguratorState;
    }
  | {
      type: "STEP_NEXT";
      dataSetMetadata: DataCubeMetadata;
    }
  | {
      type: "STEP_PREVIOUS";
      to?: Exclude<ConfiguratorState["state"], "INITIAL" | "PUBLISHING">;
    }
  | {
      type: "DATASET_SELECTED";
      dataSet: string | undefined;
    }
  | {
      type: "DATASOURCE_CHANGED";
      value: DataSource;
    }
  | {
      type: "CHART_TYPE_CHANGED";
      value: {
        locale: Locale;
        chartType: ChartType;
      };
    }
  | {
      type: "ACTIVE_FIELD_CHANGED";
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
      type: "CHART_DESCRIPTION_CHANGED";
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
        dataSetMetadata: DataCubeMetadataWithHierarchies;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_SINGLE";
      value: {
        dimensionIri: string;
        value: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_REMOVE_SINGLE";
      value: {
        dimensionIri: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTERS_UPDATE";
      value: {
        filters: Filters;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_MULTI";
      value: {
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
      type: "CHART_CONFIG_FILTER_ADD_MULTI";
      value: {
        dimensionIri: string;
        values: string[];
        allValues: string[];
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_REMOVE_MULTI";
      value: {
        dimensionIri: string;
        values: string[];
        allValues: string[];
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_RANGE";
      value: {
        dimensionIri: string;
        from: string;
        to: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_RESET_RANGE";
      value: {
        dimensionIri: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_RESET_MULTI";
      value: {
        dimensionIri: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_NONE_MULTI";
      value: {
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
      };
    }
  | {
      type: "SWITCH_ACTIVE_CHART";
      value: string;
    };

const LOCALSTORAGE_PREFIX = "vizualize-configurator-state";
export const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

const getStateWithCurrentDataSource = (state: ConfiguratorState) => {
  const dataSource = getDataSourceFromLocalStorage();

  return {
    ...state,
    dataSource: dataSource || DEFAULT_DATA_SOURCE,
  };
};

const INITIAL_STATE: ConfiguratorState = {
  version: CONFIGURATOR_STATE_VERSION,
  state: "INITIAL",
  dataSet: undefined,
  dataSource: DEFAULT_DATA_SOURCE,
};

const emptyState: ConfiguratorStateSelectingDataSet = {
  version: CONFIGURATOR_STATE_VERSION,
  state: "SELECTING_DATASET",
  dataSet: undefined,
  dataSource: DEFAULT_DATA_SOURCE,
  chartConfigs: undefined,
  meta: {
    title: {
      de: "",
      fr: "",
      it: "",
      en: "",
    },
    description: {
      de: "",
      fr: "",
      it: "",
      en: "",
    },
  },
  activeChartKey: undefined,
};

const getCachedMetadata = (
  draft: ConfiguratorStateConfiguringChart,
  locale: Locale
): DataCubeMetadataWithHierarchies | null => {
  const metadataQuery = client.readQuery<
    DataCubeMetadataQuery,
    DataCubeMetadataQueryVariables
  >(DataCubeMetadataDocument, {
    iri: draft.dataSet,
    locale,
    sourceType: draft.dataSource.type,
    sourceUrl: draft.dataSource.url,
  });
  const componentsQuery = client.readQuery<
    ComponentsWithHierarchiesQuery,
    ComponentsWithHierarchiesQueryVariables
  >(ComponentsWithHierarchiesDocument, {
    iri: draft.dataSet,
    locale,
    sourceType: draft.dataSource.type,
    sourceUrl: draft.dataSource.url,
  });

  return metadataQuery?.data?.dataCubeByIri &&
    componentsQuery?.data?.dataCubeByIri
    ? {
        ...metadataQuery.data.dataCubeByIri,
        ...componentsQuery.data.dataCubeByIri,
      }
    : null;
};

export const getFilterValue = (
  state: ConfiguratorState,
  dimensionIri: string
): FilterValue | undefined => {
  return state.state !== "INITIAL" && state.state !== "SELECTING_DATASET"
    ? getChartConfig(state).filters[dimensionIri]
    : undefined;
};

export const moveFilterField = produce(
  (chartConfig: ChartConfig, { dimensionIri, delta, possibleValues }) => {
    // Use getOwnPropertyNames instead of keys since the spec ensures that
    // the order of the keys received is in insertion order
    // https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
    const keys = Object.getOwnPropertyNames(chartConfig.filters);
    const fieldIndex = Object.keys(chartConfig.filters).indexOf(dimensionIri);

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
    keys[replacedIndex] = dimensionIri;

    if (fieldIndex === -1) {
      keys.push(replaced);
    } else {
      keys[fieldIndex] = replaced;
    }

    chartConfig.filters = Object.fromEntries(
      keys.map((k) => [
        k,
        chartConfig.filters[k] ?? { type: "single", value: possibleValues[0] },
      ])
    );
  }
);

export const deriveFiltersFromFields = produce(
  (
    chartConfig: ChartConfig,
    dimensions: DimensionMetadataWithHierarchiesFragment[]
  ) => {
    const { chartType, fields, filters } = chartConfig;

    if (chartType === "table") {
      // As dimensions in tables behave differently than in other chart types,
      // they need to be handled in a different way.
      const hiddenFieldIris = getHiddenFieldIris(fields);
      const groupedDimensionIris = getGroupedFieldIris(fields);
      const isHidden = (iri: string) => hiddenFieldIris.has(iri);
      const isGrouped = (iri: string) => groupedDimensionIris.has(iri);

      dimensions.forEach((dimension) => {
        applyTableDimensionToFilters({
          filters,
          dimension,
          isHidden: isHidden(dimension.iri),
          isGrouped: isGrouped(dimension.iri),
        });
      });
    } else {
      const fieldDimensionIris = getFieldComponentIris(fields);
      const isField = (iri: string) => fieldDimensionIris.has(iri);

      // Apply hierarchical dimensions first
      const sortedDimensions = sortBy(
        dimensions,
        (d) => (isGeoDimension(d) ? -1 : 1),
        (d) => (d.hierarchy ? -1 : 1)
      );
      sortedDimensions.forEach((dimension) => {
        applyNonTableDimensionToFilters({
          filters,
          dimension,
          isField: isField(dimension.iri),
        });
      });
    }

    return chartConfig;
  }
);

export const applyTableDimensionToFilters = ({
  filters,
  dimension,
  isHidden,
  isGrouped,
}: {
  filters: Filters;
  dimension: DimensionMetadataFragment;
  isHidden: boolean;
  isGrouped: boolean;
}) => {
  const currentFilter = filters[dimension.iri];
  const shouldBecomeSingleFilter = isHidden && !isGrouped;

  if (currentFilter) {
    switch (currentFilter.type) {
      case "single":
        if (!shouldBecomeSingleFilter) {
          delete filters[dimension.iri];
        }
        break;
      case "multi":
        if (shouldBecomeSingleFilter && dimension.isKeyDimension) {
          filters[dimension.iri] = {
            type: "single",
            value:
              Object.keys(currentFilter.values)[0] ?? dimension.values[0].value,
          };
        }
        break;
      case "range":
        if (shouldBecomeSingleFilter) {
          filters[dimension.iri] = {
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
    filters[dimension.iri] = {
      type: "single",
      value: dimension.values[0].value,
    };
  }
};

export const applyNonTableDimensionToFilters = ({
  filters,
  dimension,
  isField,
}: {
  filters: Filters;
  dimension: DimensionMetadataWithHierarchiesFragment;
  isField: boolean;
}) => {
  const currentFilter = filters[dimension.iri];

  if (currentFilter) {
    switch (currentFilter.type) {
      case "single":
        if (isField) {
          // When a dimension is either x, y or segment, we want to clear the filter.
          delete filters[dimension.iri];
        }
        break;
      case "multi":
        if (!isField) {
          // Multi-filters are not allowed in the left panel.
          // TODO: currently, the filters are sorted by their keys, which in some
          // cases are IRIs - so if a multi-filter is applied, the default behavior
          // is to use the first value from selected values, which isn't the same value
          // as expected by looking at the UI (where filters are sorted alphabetically).
          filters[dimension.iri] = {
            type: "single",
            value:
              Object.keys(currentFilter.values)[0] ?? dimension.values[0].value,
          };
        }
        break;
      case "range":
        if (!isField) {
          // Range-filters are not allowed in the left panel.
          filters[dimension.iri] = {
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
      : dimension.values[0].value;
    filters[dimension.iri] = {
      type: "single",
      value: filterValue,
    };
  }
};

const transitionStepNext = (
  draft: ConfiguratorState,
  dataSetMetadata: DataCubeMetadataWithHierarchies
): ConfiguratorState => {
  switch (draft.state) {
    case "SELECTING_DATASET":
      if (draft.dataSet) {
        const possibleChartTypes = getPossibleChartType({
          dimensions: dataSetMetadata.dimensions,
          measures: dataSetMetadata.measures,
        });

        const chartConfig = getInitialConfig({
          chartType: possibleChartTypes[0],
          dimensions: dataSetMetadata.dimensions,
          measures: dataSetMetadata.measures,
        });
        deriveFiltersFromFields(chartConfig, dataSetMetadata.dimensions);

        return {
          version: CONFIGURATOR_STATE_VERSION,
          state: "CONFIGURING_CHART",
          dataSet: draft.dataSet,
          dataSource: draft.dataSource,
          meta: draft.meta,
          chartConfigs: [chartConfig],
          activeChartKey: chartConfig.key,
        };
      }
      break;
    case "CONFIGURING_CHART":
      return {
        ...draft,
        state: "PUBLISHING",
      };

    case "INITIAL":
    case "PUBLISHING":
      break;
    default:
      throw unreachableError(draft);
  }

  return draft;
};

const getPreviousState = (
  state: ConfiguratorState["state"]
): Exclude<ConfiguratorState["state"], "INITIAL" | "PUBLISHING"> => {
  switch (state) {
    case "SELECTING_DATASET":
      return state;
    case "CONFIGURING_CHART":
      return "SELECTING_DATASET";
    case "PUBLISHING":
      return "CONFIGURING_CHART";
    default:
      return "SELECTING_DATASET";
  }
};

const transitionStepPrevious = (
  draft: ConfiguratorState,
  to?: Exclude<ConfiguratorState["state"], "INITIAL" | "PUBLISHING">
): ConfiguratorState => {
  const stepTo = to ?? getPreviousState(draft.state);

  // Special case when we're already at INITIAL
  if (draft.state === "INITIAL" || draft.state === "SELECTING_DATASET") {
    return draft;
  }

  switch (stepTo) {
    case "SELECTING_DATASET":
      return {
        ...draft,
        chartConfigs: undefined,
        activeChartKey: undefined,
        state: stepTo,
      };
    case "CONFIGURING_CHART":
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
 * We need to handle some fields differently
 * due to the way the chart config is structured at the moment (colorField) is a
 * subfield of areaLayer and symbolLayer fields.
 */
export const getFiltersByMappingStatus = (chartConfig: ChartConfig) => {
  const genericFieldValues = Object.values(chartConfig.fields).map(
    (d) => d.componentIri
  );
  const nonGenericFieldValues = getNonGenericFieldValues(chartConfig);
  const iris = new Set([...genericFieldValues, ...nonGenericFieldValues]);
  const mappedFilters = pickBy(chartConfig.filters, (_, iri) => iris.has(iri));
  const unmappedFilters = pickBy(
    chartConfig.filters,
    (_, iri) => !iris.has(iri)
  );

  return { mappedFilters, mappedFiltersIris: iris, unmappedFilters };
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
  if (draft.state !== "CONFIGURING_CHART") {
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
  const { dimensions = [], measures = [] } =
    getCachedMetadata(draft, locale) ?? {};
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

  const newConfig = deriveFiltersFromFields(chartConfig, dimensions);

  for (const k in chartConfig) {
    if (chartConfig.hasOwnProperty(k)) {
      // @ts-ignore
      delete chartConfig[k];
    }
  }

  Object.assign(chartConfig, newConfig);

  return draft;
};

export const handleChartOptionChanged = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_OPTION_CHANGED" }>
) => {
  if (draft.state === "CONFIGURING_CHART") {
    const { locale, path, field, value } = action.value;
    const chartConfig = getChartConfig(draft);
    const updatePath = field === null ? path : `fields["${field}"].${path}`;
    const { dimensions = [], measures = [] } =
      getCachedMetadata(draft, locale) ?? {};

    if (field) {
      const sideEffect = getChartFieldOptionChangeSideEffect(
        chartConfig,
        field,
        path
      );
      sideEffect?.(value, { chartConfig, dimensions, measures });
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
  if (draft.state === "CONFIGURING_CHART") {
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
  if (draft.state === "CONFIGURING_CHART") {
    const chartConfig = getChartConfig(draft);
    setWith(chartConfig, "interactiveFiltersConfig", action.value, Object);
  }

  return draft;
};

const reducer: Reducer<ConfiguratorState, ConfiguratorStateAction> = (
  draft,
  action
) => {
  switch (action.type) {
    case "INITIALIZED":
      // Never restore from an UNINITIALIZED state
      return action.value.state === "INITIAL"
        ? getStateWithCurrentDataSource(emptyState)
        : action.value;
    case "DATASET_SELECTED":
      if (draft.state === "SELECTING_DATASET") {
        draft.dataSet = action.dataSet;
      }
      return draft;
    case "DATASOURCE_CHANGED":
      draft.dataSource = action.value;
      return draft;
    case "CHART_TYPE_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
        const { locale, chartType } = action.value;
        const metadata = getCachedMetadata(draft, locale);

        if (metadata) {
          const { dimensions, measures } = metadata;
          const previousConfig = getChartConfig(draft);
          const newConfig = getChartConfigAdjustedToChartType({
            chartConfig: current(previousConfig),
            newChartType: chartType,
            dimensions,
            measures,
          });

          for (const k in previousConfig) {
            if (previousConfig.hasOwnProperty(k)) {
              // @ts-ignore
              delete previousConfig[k];
            }
          }

          Object.assign(previousConfig, newConfig);
        }
      }

      return draft;

    case "ACTIVE_FIELD_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
        const chartConfig = getChartConfig(draft);
        chartConfig.activeField = action.value;
      }

      return draft;

    case "CHART_FIELD_CHANGED":
      return handleChartFieldChanged(draft, action);

    case "CHART_FIELD_DELETED":
      if (draft.state === "CONFIGURING_CHART") {
        const chartConfig = getChartConfig(draft);
        delete (chartConfig.fields as GenericFields)[action.value.field];

        const metadata = getCachedMetadata(draft, action.value.locale);
        const dimensions = metadata?.dimensions ?? [];

        deriveFiltersFromFields(chartConfig, dimensions);

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
      if (draft.state === "CONFIGURING_CHART") {
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
      if (draft.state === "CONFIGURING_CHART") {
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
      if (draft.state === "CONFIGURING_CHART") {
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

    case "CHART_DESCRIPTION_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
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
      if (draft.state === "CONFIGURING_CHART") {
        const chartConfig = getChartConfig(draft);

        for (const k in chartConfig) {
          if (chartConfig.hasOwnProperty(k)) {
            // @ts-ignore
            delete chartConfig[k];
          }
        }

        Object.assign(
          chartConfig,
          deriveFiltersFromFields(
            action.value.chartConfig,
            action.value.dataSetMetadata.dimensions
          )
        );
      }

      return draft;

    case "CHART_CONFIG_FILTER_SET_SINGLE":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, value } = action.value;
        const chartConfig = getChartConfig(draft);

        if (value === FIELD_VALUE_NONE) {
          delete chartConfig.filters[dimensionIri];
        } else {
          chartConfig.filters[dimensionIri] = {
            type: "single",
            value,
          };
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_REMOVE_SINGLE":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri } = action.value;
        const chartConfig = getChartConfig(draft);
        delete chartConfig.filters[dimensionIri];
        const newIFConfig = toggleInteractiveFilterDataDimension(
          chartConfig.interactiveFiltersConfig,
          dimensionIri,
          false
        );
        chartConfig.interactiveFiltersConfig = newIFConfig;
      }

      return draft;

    case "CHART_CONFIG_UPDATE_COLOR_MAPPING":
      return updateColorMapping(draft, action);

    case "CHART_CONFIG_FILTER_SET_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, values } = action.value;
        const chartConfig = getChartConfig(draft);
        chartConfig.filters[dimensionIri] = makeMultiFilter(values);
      }

      return draft;

    case "CHART_CONFIG_FILTER_ADD_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, values, allValues } = action.value;
        const chartConfig = getChartConfig(draft);
        const f = chartConfig.filters[dimensionIri];
        const newFilter = makeMultiFilter(values);
        if (f && f.type === "multi") {
          f.values = {
            ...f.values,
            ...newFilter.values,
          };
          // If all values are selected, we remove the filter again!
          if (allValues.every((v) => v in f.values)) {
            delete chartConfig.filters[dimensionIri];
          }
        } else {
          chartConfig.filters[dimensionIri] = newFilter;
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_REMOVE_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, values, allValues } = action.value;
        const chartConfig = getChartConfig(draft);
        const f = chartConfig.filters[dimensionIri];

        if (f && f.type === "multi" && Object.keys(f.values).length > 0) {
          // If there are existing object keys, we just remove the current one
          for (const v of values) {
            delete f.values[v];
          }
        } else {
          // Otherwise we set the filters to all values minus the current one
          const updatedValues = allValues.reduce<FilterValueMultiValues>(
            (_values, v) => {
              // Efficient until values has a lot of values...
              if (values.indexOf(v) === -1) {
                _values[v] = true;
              }
              return _values;
            },
            {}
          );
          chartConfig.filters[dimensionIri] = {
            type: "multi",
            values: updatedValues,
          };
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_RESET_MULTI":
    case "CHART_CONFIG_FILTER_RESET_RANGE":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri } = action.value;
        const chartConfig = getChartConfig(draft);
        delete chartConfig.filters[dimensionIri];
      }

      return draft;

    case "CHART_CONFIG_FILTER_SET_NONE_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri } = action.value;
        const chartConfig = getChartConfig(draft);
        chartConfig.filters[dimensionIri] = {
          type: "multi",
          values: {},
        };
      }

      return draft;

    case "CHART_CONFIG_FILTER_SET_RANGE":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, from, to } = action.value;
        const chartConfig = getChartConfig(draft);
        chartConfig.filters[dimensionIri] = {
          type: "range",
          from,
          to,
        };

        if (chartConfig.interactiveFiltersConfig) {
          chartConfig.interactiveFiltersConfig.timeRange = {
            componentIri: dimensionIri,
            active: chartConfig.interactiveFiltersConfig.timeRange.active,
            presets: {
              type: "range",
              from,
              to,
            },
          };
        }
      }

      return draft;

    case "CHART_CONFIG_FILTERS_UPDATE":
      if (draft.state === "CONFIGURING_CHART") {
        const { filters } = action.value;
        const chartConfig = getChartConfig(draft);
        chartConfig.filters = filters;
      }

      return draft;

    case "IMPUTATION_TYPE_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
        const chartConfig = getChartConfig(draft);
        if (isAreaConfig(chartConfig)) {
          chartConfig.fields.y.imputationType = action.value.type;
        }
      }

      return draft;

    // State transitions
    case "STEP_NEXT":
      return transitionStepNext(draft, action.dataSetMetadata);

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
      if (draft.state === "CONFIGURING_CHART") {
        draft.chartConfigs.push(action.value.chartConfig);
        draft.activeChartKey = action.value.chartConfig.key;
      }

      return draft;

    case "SWITCH_ACTIVE_CHART":
      if (draft.state === "CONFIGURING_CHART") {
        draft.activeChartKey = action.value;
      }

      return draft;

    default:
      throw unreachableError(action);
  }
};

const ConfiguratorStateContext = createContext<
  [ConfiguratorState, Dispatch<ConfiguratorStateAction>] | undefined
>(undefined);

type ChartId = string;
type DatasetIri = string;

export const initChartStateFromChart = async (
  from: ChartId
): Promise<ConfiguratorState | undefined> => {
  const config = await fetchChartConfig(from);

  if (config?.data) {
    return migrateConfiguratorState(config.data);
  }
};

export const initChartStateFromCube = async (
  client: Client,
  datasetIri: DatasetIri,
  dataSource: DataSource,
  locale: string
): Promise<ConfiguratorState | undefined> => {
  const { data: metadata } = await client
    .query<DataCubeMetadataQuery, DataCubeMetadataQueryVariables>(
      DataCubeMetadataDocument,
      {
        iri: datasetIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        locale,
      }
    )
    .toPromise();
  const { data: components } = await client
    .query<
      ComponentsWithHierarchiesQuery,
      ComponentsWithHierarchiesQueryVariables
    >(ComponentsWithHierarchiesDocument, {
      iri: datasetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    })
    .toPromise();

  if (metadata?.dataCubeByIri && components?.dataCubeByIri) {
    return transitionStepNext(
      getStateWithCurrentDataSource({ ...emptyState, dataSet: datasetIri }),
      { ...metadata.dataCubeByIri, ...components.dataCubeByIri }
    );
  }

  console.warn(`Could not fetch cube with iri ${datasetIri}`);
};

/**
 * Tries to parse state from localStorage.
 * If state is invalid, it is removed from localStorage.
 */
export const initChartStateFromLocalStorage = async (
  chartId: string
): Promise<ConfiguratorState | undefined> => {
  const storedState = window.localStorage.getItem(getLocalStorageKey(chartId));
  if (storedState) {
    let parsedState;
    try {
      const rawParsedState = JSON.parse(storedState);
      const migratedState = migrateConfiguratorState(rawParsedState);
      parsedState = decodeConfiguratorState(migratedState);
    } catch (e) {
      console.error("Error while parsing stored state", e);
      // Ignore errors since we are returning undefined and removing bad state from localStorage
    }

    if (parsedState) {
      return parsedState;
    }

    console.warn(
      "Attempted to restore invalid state. Removing from localStorage.",
      parsedState
    );
    window.localStorage.removeItem(getLocalStorageKey(chartId));
  }
};

const ConfiguratorStateProviderInternal = ({
  chartId,
  children,
  initialState = INITIAL_STATE,
  allowDefaultRedirect = true,
}: {
  key: string;
  chartId: string;
  children?: ReactNode;
  initialState?: ConfiguratorState;
  allowDefaultRedirect?: boolean;
}) => {
  const { dataSource } = useDataSourceStore();
  const initialStateWithDataSource = useMemo(() => {
    return { ...initialState, dataSource };
  }, [initialState, dataSource]);
  const locale = useLocale();
  const stateAndDispatch = useImmerReducer(reducer, initialStateWithDataSource);
  const [state, dispatch] = stateAndDispatch;
  const { asPath, push, replace, query } = useRouter();
  const client = useClient();

  // Re-initialize state on page load
  useEffect(() => {
    let stateToInitialize = initialStateWithDataSource;

    const initialize = async () => {
      try {
        let newChartState;
        if (chartId === "new") {
          if (query.from && typeof query.from === "string") {
            newChartState = await initChartStateFromChart(query.from);
          } else if (query.cube && typeof query.cube === "string") {
            newChartState = await initChartStateFromCube(
              client,
              query.cube,
              dataSource,
              locale
            );
          }
        } else {
          newChartState = await initChartStateFromLocalStorage(chartId);
          if (!newChartState && allowDefaultRedirect) replace(`/create/new`);
        }

        stateToInitialize = newChartState || stateToInitialize;
      } finally {
        dispatch({ type: "INITIALIZED", value: stateToInitialize });
      }
    };
    initialize();
  }, [
    dataSource,
    dispatch,
    chartId,
    replace,
    initialStateWithDataSource,
    allowDefaultRedirect,
    query,
    locale,
    client,
  ]);

  useEffect(() => {
    dispatch({
      type: "DATASOURCE_CHANGED",
      value: dataSource,
    });
  }, [dispatch, dataSource]);

  useEffect(() => {
    try {
      switch (state.state) {
        case "CONFIGURING_CHART":
          if (chartId === "new") {
            const newChartId = createChartId();
            window.localStorage.setItem(
              getLocalStorageKey(newChartId),
              JSON.stringify(state)
            );
            replace(`/create/${newChartId}`);
          } else {
            // Store current state in localstorage
            window.localStorage.setItem(
              getLocalStorageKey(chartId),
              JSON.stringify(state)
            );
          }
          return;
        case "PUBLISHING":
          (async () => {
            try {
              const result = await createConfig({
                ...state,
                chartConfigs: {
                  ...state.chartConfigs.map((d) => {
                    return {
                      ...d,
                      // Ensure that the filters are in the correct order, as JSON
                      // does not guarantee order (and we need this as interactive
                      // filters are dependent on the order of the filters).
                      filters: Object.fromEntries(
                        Object.entries(d.filters).map(([k, v], i) => {
                          return [k, { ...v, position: i }];
                        })
                      ),
                    };
                  }),
                },
              });

              /**
               * EXPERIMENTAL: Post back created chart ID to opener and close window.
               *
               * This allows the chart creation workflow to be integrated with other tools like a CMS
               */

              // FIXME: Check for more than just opener?
              const opener = window.opener;
              if (opener) {
                opener.postMessage(`CHART_ID:${result.key}`, "*");
                window.close();
                return;
              }

              await push({
                pathname: `/v/${result.key}`,
                query: { publishSuccess: true },
              });
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
  }, [state, dispatch, chartId, push, asPath, locale, query.from, replace]);

  return (
    <ConfiguratorStateContext.Provider value={stateAndDispatch}>
      {children}
    </ConfiguratorStateContext.Provider>
  );
};

export const PublishedConfiguratorStateProvider = ({
  children,
  initialState,
}: {
  children?: ReactNode;
  initialState?: ConfiguratorState;
}) => {
  const stateAndDispatch = useMemo(() => {
    return [
      initialState,
      () => {
        throw new Error(
          "Should not call dispatch on config statefor publishers"
        );
      },
    ] as React.ComponentProps<
      typeof ConfiguratorStateContext.Provider
    >["value"];
  }, [initialState]);

  return (
    <ConfiguratorStateContext.Provider value={stateAndDispatch}>
      {children}
    </ConfiguratorStateContext.Provider>
  );
};

export const EditorConfiguratorStateProvider = ({
  chartId,
  children,
  initialState,
  allowDefaultRedirect,
}: {
  chartId: string;
  children?: ReactNode;
  initialState?: ConfiguratorState;
  allowDefaultRedirect?: boolean;
}) => {
  // Ensure that the state is reset by using the `chartId` as `key`
  return (
    <ConfiguratorStateProviderInternal
      key={chartId}
      chartId={chartId}
      initialState={initialState}
      allowDefaultRedirect={allowDefaultRedirect}
    >
      {children}
    </ConfiguratorStateProviderInternal>
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

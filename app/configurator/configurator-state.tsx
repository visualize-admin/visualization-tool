import { current, produce } from "immer";
import get from "lodash/get";
import mapValues from "lodash/mapValues";
import pickBy from "lodash/pickBy";
import setWith from "lodash/setWith";
import sortBy from "lodash/sortBy";
import unset from "lodash/unset";
import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Client, useClient } from "urql";
import { Reducer, useImmerReducer } from "use-immer";

import {
  DEFAULT_SORTING,
  getChartConfigAdjustedToChartType,
  getFieldComponentIris,
  getGroupedFieldIris,
  getHiddenFieldIris,
  getInitialAreaLayer,
  getInitialConfig,
  getInitialSymbolLayer,
  getPossibleChartType,
} from "@/charts";
import { DEFAULT_FIXED_COLOR_FIELD } from "@/charts/map/constants";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import {
  ConfiguratorStateConfiguringChart,
  DataSource,
  GenericField,
  ImputationType,
  isAreaConfig,
  isColorFieldInConfig,
  isColumnConfig,
  isMapConfig,
  isSegmentInConfig,
  MapConfig,
  MapFields,
  NumericalColorField,
} from "@/configurator/config-types";
import {
  ChartConfig,
  ChartType,
  ConfiguratorState,
  ConfiguratorStateSelectingDataSet,
  decodeConfiguratorState,
  Filters,
  FilterValue,
  FilterValueMultiValues,
  GenericFields,
  InteractiveFiltersConfig,
} from "@/configurator/config-types";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  canDimensionBeMultiFiltered,
  DimensionValue,
  isOrdinalMeasure,
  isGeoDimension,
  isGeoShapesDimension,
  isNumericalMeasure,
  isTemporalDimension,
} from "@/domain/data";
import { DEFAULT_DATA_SOURCE } from "@/domain/datasource";
import { client } from "@/graphql/client";
import {
  DataCubeMetadataWithComponentValuesDocument,
  DataCubeMetadataWithComponentValuesQuery,
  DataCubeMetadataWithComponentValuesQueryVariables,
  DimensionMetadataFragment,
  NumericalMeasure,
  OrdinalMeasure,
} from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";
import { getDefaultCategoricalPaletteName } from "@/palettes";
import { findInHierarchy } from "@/rdf/tree-utils";
import {
  getDataSourceFromLocalStorage,
  useDataSourceStore,
} from "@/stores/data-source";
import {
  fetchChartConfig,
  createChartConfigFromConfiguratorState,
  updateChartConfigFromConfiguratorState,
} from "@/utils/chart-config/api";
import { migrateChartConfig } from "@/utils/chart-config/versioning";
import { unreachableError } from "@/utils/unreachable";

import { toggleInteractiveFilterDataDimension } from "./interactive-filters/interactive-filters-config-state";

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
        field: string;
        componentIri: string;
        selectedValues?: $FixMe[];
      };
    }
  | {
      type: "CHART_OPTION_CHANGED";
      value: {
        locale: Locale;
        path: string;
        field: string | null;
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
      value: { path: string | string[]; value: string };
    }
  | {
      type: "INTERACTIVE_FILTER_CHANGED";
      value: InteractiveFiltersConfig;
    }
  | {
      type: "INTERACTIVE_FILTER_TIME_SLIDER_RESET";
    }
  | {
      type: "CHART_CONFIG_REPLACED";
      value: { chartConfig: ChartConfig; dataSetMetadata: DataCubeMetadata };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_SINGLE";
      value: { dimensionIri: string; value: string };
    }
  | {
      type: "CHART_CONFIG_FILTER_REMOVE_SINGLE";
      value: { dimensionIri: string };
    }
  | {
      type: "CHART_CONFIG_FILTERS_UPDATE";
      value: { filters: Filters };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_MULTI";
      value: { dimensionIri: string; values: string[] };
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
      value: { dimensionIri: string; values: string[]; allValues: string[] };
    }
  | {
      type: "CHART_CONFIG_FILTER_REMOVE_MULTI";
      value: { dimensionIri: string; values: string[]; allValues: string[] };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_RANGE";
      value: { dimensionIri: string; from: string; to: string };
    }
  | {
      type: "CHART_CONFIG_FILTER_RESET_RANGE";
      value: { dimensionIri: string };
    }
  | {
      type: "CHART_CONFIG_FILTER_RESET_MULTI";
      value: { dimensionIri: string };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_NONE_MULTI";
      value: { dimensionIri: string };
    }
  | { type: "IMPUTATION_TYPE_CHANGED"; value: { type: ImputationType } }
  | { type: "PUBLISH_FAILED" }
  | { type: "PUBLISHED"; value: string };

export type ActionType<ConfiguratorStateAction> =
  ConfiguratorStateAction[keyof ConfiguratorStateAction];

const getStateWithCurrentDataSource = (state: ConfiguratorState) => {
  const dataSource = getDataSourceFromLocalStorage();

  return {
    ...state,
    dataSource: dataSource || DEFAULT_DATA_SOURCE,
  };
};

const INITIAL_STATE: ConfiguratorState = {
  state: "INITIAL",
  dataSet: undefined,
  dataSource: DEFAULT_DATA_SOURCE,
  activeField: undefined,
};

const emptyState: ConfiguratorStateSelectingDataSet = {
  state: "SELECTING_DATASET",
  dataSet: undefined,
  dataSource: DEFAULT_DATA_SOURCE,
  chartConfig: undefined,
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
  activeField: undefined,
};

const getCachedCubeMetadataWithComponentValues = (
  draft: ConfiguratorStateConfiguringChart,
  locale: Locale
) => {
  const query = client.readQuery<
    DataCubeMetadataWithComponentValuesQuery,
    DataCubeMetadataWithComponentValuesQueryVariables
  >(DataCubeMetadataWithComponentValuesDocument, {
    iri: draft.dataSet,
    locale,
    sourceType: draft.dataSource.type,
    sourceUrl: draft.dataSource.url,
  });

  return query?.data?.dataCubeByIri;
};

export const getFilterValue = (
  state: ConfiguratorState,
  dimensionIri: string
): FilterValue | undefined => {
  return state.state !== "INITIAL" && state.state !== "SELECTING_DATASET"
    ? state.chartConfig.filters[dimensionIri]
    : undefined;
};

export const ensureFilterValuesCorrect = produce(
  (
    chartConfig: ChartConfig,
    { dimensions }: { dimensions: DataCubeMetadata["dimensions"] }
  ) => {
    let dirty = false;
    const newFilters = mapValues(chartConfig.filters, (f, dimensionIri) => {
      if (f.type !== "single") {
        return f;
      }
      const values = dimensions.find((dim) => dim.iri === dimensionIri)?.values;
      if (!values || values.length === 0) {
        return f;
      }
      if (values.find((v) => v.value === f.value)) {
        return f;
      }
      dirty = true;
      f.value = values[0].value;
      return f;
    });
    if (dirty) {
      chartConfig.filters = newFilters;
    }
  }
);

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
    const replaced =
      fieldIndex === -1 ? keys[replacedIndex] : keys[replacedIndex];
    keys[replacedIndex] = dimensionIri;
    if (fieldIndex === -1) {
      keys.push(replaced);
    } else {
      keys[fieldIndex] = replaced;
    }
    chartConfig.filters = Object.fromEntries(
      keys.map((k) => [
        k,
        chartConfig.filters[k] || { type: "single", value: possibleValues[0] },
      ])
    );
  }
);

export const deriveFiltersFromFields = produce(
  (chartConfig: ChartConfig, dimensions: DimensionMetadataFragment[]) => {
    const { chartType, fields, filters } = chartConfig;

    if (chartType === "table") {
      // As dimensions in tables behave differently than in other chart types,
      // they need to be handled in a different way.
      const hiddenFieldIris = getHiddenFieldIris(fields);
      const groupedDimensionIris = getGroupedFieldIris(fields);

      const isHidden = (iri: string) => hiddenFieldIris.has(iri);
      const isGrouped = (iri: string) => groupedDimensionIris.has(iri);

      dimensions.forEach((dimension) =>
        applyTableDimensionToFilters({
          filters,
          dimension,
          isHidden: isHidden(dimension.iri),
          isGrouped: isGrouped(dimension.iri),
        })
      );
    } else {
      const fieldDimensionIris = getFieldComponentIris(fields);
      const isField = (iri: string) => fieldDimensionIris.has(iri);

      // Apply hierarchical dimensions first
      const sortedDimensions = sortBy(
        dimensions,
        (d) => (isGeoDimension(d) ? -1 : 1),
        (d) => (d.hierarchy ? -1 : 1)
      );
      sortedDimensions.forEach((dimension) =>
        applyNonTableDimensionToFilters({
          filters,
          dimension,
          isField: isField(dimension.iri),
        })
      );
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
              Object.keys(currentFilter.values)[0] || dimension.values[0].value,
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
  } else {
    if (shouldBecomeSingleFilter && dimension.isKeyDimension) {
      filters[dimension.iri] = {
        type: "single",
        value: dimension.values[0].value,
      };
    }
  }
};

export const applyNonTableDimensionToFilters = ({
  filters,
  dimension,
  isField,
}: {
  filters: Filters;
  dimension: DimensionMetadataFragment;
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
              Object.keys(currentFilter.values)[0] || dimension.values[0].value,
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
  } else {
    if (!isField && dimension.isKeyDimension) {
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
  }
};

const transitionStepNext = (
  draft: ConfiguratorState,
  dataSetMetadata: DataCubeMetadata
): ConfiguratorState => {
  switch (draft.state) {
    case "SELECTING_DATASET":
      if (draft.dataSet) {
        const possibleChartTypes = getPossibleChartType({
          metadata: dataSetMetadata,
        });

        const chartConfig = deriveFiltersFromFields(
          getInitialConfig({
            chartType: possibleChartTypes[0],
            dimensions: dataSetMetadata.dimensions,
            measures: dataSetMetadata.measures,
          }),
          dataSetMetadata.dimensions
        );

        return {
          state: "CONFIGURING_CHART",
          dataSet: draft.dataSet,
          dataSource: draft.dataSource,
          meta: draft.meta,
          activeField: undefined,
          chartConfig,
        };
      }
      break;
    case "CONFIGURING_CHART":
      return {
        ...draft,
        activeField: undefined,
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

export const canTransitionToNextStep = (
  state: ConfiguratorState,
  dataSetMetadata: DataCubeMetadata | null | undefined
): boolean => {
  if (!dataSetMetadata) {
    return false;
  }

  if (dataSetMetadata.dimensions.length === 0) {
    return false;
  }

  switch (state.state) {
    case "SELECTING_DATASET":
      return state.dataSet !== undefined;
    case "CONFIGURING_CHART":
      return true;
  }

  return false;
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
  const stepTo = to || getPreviousState(draft.state);

  // Special case when we're already at INITIAL
  if (draft.state === "INITIAL" || draft.state === "SELECTING_DATASET") {
    return draft;
  }

  switch (stepTo) {
    case "SELECTING_DATASET":
      return {
        ...draft,
        activeField: undefined,
        chartConfig: undefined,
        state: stepTo,
      };
    case "CONFIGURING_CHART":
      return {
        ...draft,
        activeField: undefined,
        state: stepTo,
      };
    default:
      return draft;
  }
};

export const canTransitionToPreviousStep = (_: ConfiguratorState): boolean => {
  // All states are interchangeable in terms of validity
  return true;
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
  return get(
    state,
    field === null
      ? `chartConfig.${path}`
      : `chartConfig.fields["${field}"].${path}`,
    defaultValue
  );
};

const initializeMapField = ({
  chartConfig,
  field,
  componentIri,
  dimensions,
  measures,
}: {
  chartConfig: MapConfig;
  field: "areaLayer" | "symbolLayer";
  componentIri: string;
  dimensions: DimensionMetadataFragment[];
  measures: (NumericalMeasure | OrdinalMeasure)[];
}) => {
  if (field === "areaLayer") {
    chartConfig.fields.areaLayer = getInitialAreaLayer({
      component: dimensions
        .filter(isGeoShapesDimension)
        .find((d) => d.iri === componentIri)!,
      measure: measures[0],
    });
  } else if (field === "symbolLayer") {
    chartConfig.fields.symbolLayer = getInitialSymbolLayer({
      component: dimensions
        .filter(isGeoDimension)
        .find((d) => d.iri === componentIri)!,
      measure: measures.filter(isNumericalMeasure)[0],
    });
  }
};

export const handleChartFieldChanged = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_FIELD_CHANGED" }>
) => {
  if (draft.state !== "CONFIGURING_CHART") {
    return draft;
  }

  const {
    locale,
    field,
    componentIri,
    selectedValues: actionSelectedValues,
  } = action.value;

  const metadata = getCachedCubeMetadataWithComponentValues(draft, locale);
  const { dimensions = [], measures = [] } = metadata || {
    dimensions: [],
    measures: [],
  };

  const f = get(draft.chartConfig.fields, field);
  const component = [...dimensions, ...measures].find(
    (dim) => dim.iri === componentIri
  );
  const selectedValues = actionSelectedValues
    ? actionSelectedValues
    : component?.values || [];
  // The field was not defined before
  if (!f) {
    // FIXME?
    // optionalFields = ['segment', 'areaLayer', 'symbolLayer'],
    // should be reflected in chart encodings
    if (field === "segment") {
      // FIXME: This should be more chart specific
      // (no "stacked" for scatterplots for instance)
      if (isSegmentInConfig(draft.chartConfig)) {
        const palette = getDefaultCategoricalPaletteName(component);
        const colorMapping = mapValueIrisToColor({
          palette,
          dimensionValues: component?.values || [],
        });
        draft.chartConfig.filters[componentIri] = {
          type: "multi",
          values: Object.fromEntries(
            selectedValues.map((v) => v.value).map((x) => [x, true])
          ),
        };
        draft.chartConfig.fields.segment = {
          componentIri,
          palette,
          // Type exists only within column charts.
          ...(isColumnConfig(draft.chartConfig) && { type: "stacked" }),
          sorting: DEFAULT_SORTING,
          colorMapping,
        };
      }

      // Remove this component from the interactive filter, if it is there
      if (draft.chartConfig.interactiveFiltersConfig) {
        const newComponentIris =
          draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris.filter(
            (c) => c !== componentIri
          );
        draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris =
          newComponentIris;

        draft.chartConfig.interactiveFiltersConfig.dataFilters.active =
          newComponentIris.length > 0;
      }
    } else if (isMapConfig(draft.chartConfig)) {
      initializeMapField({
        chartConfig: draft.chartConfig,
        field: field as keyof MapFields,
        componentIri,
        dimensions,
        measures,
      });
    }
  } else {
    // The field is being updated
    if (
      field === "segment" &&
      "segment" in draft.chartConfig.fields &&
      draft.chartConfig.fields.segment &&
      "palette" in draft.chartConfig.fields.segment
    ) {
      const palette = getDefaultCategoricalPaletteName(
        component,
        draft.chartConfig.fields.segment.palette
      );
      const colorMapping = mapValueIrisToColor({
        palette,
        dimensionValues: component?.values || [],
      });

      draft.chartConfig.fields.segment.componentIri = componentIri;
      draft.chartConfig.fields.segment.colorMapping = colorMapping;
      draft.chartConfig.filters[componentIri] = {
        type: "multi",
        values: Object.fromEntries(
          selectedValues.map((v) => v.value).map((x) => [x, true])
        ),
      };
    } else {
      // Reset field properties, excluding componentIri.
      (draft.chartConfig.fields as GenericFields)[field] = {
        componentIri,
      };

      // if x !== time, also deactivate interactive time filter
      if (
        isColumnConfig(draft.chartConfig) &&
        field === "x" &&
        !isTemporalDimension(component) &&
        draft.chartConfig.interactiveFiltersConfig
      ) {
        setWith(
          draft,
          `chartConfig.interactiveFiltersConfig.timeRange.active`,
          false,
          Object
        );
      } else if (isMapConfig(draft.chartConfig)) {
        initializeMapField({
          chartConfig: draft.chartConfig,
          field: field as keyof MapFields,
          componentIri,
          dimensions,
          measures,
        });
      }
    }

    // Remove this component from the interactive filter, if it is there
    if (draft.chartConfig.interactiveFiltersConfig) {
      draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris =
        draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris.filter(
          (c) => c !== componentIri
        );
    }
  }

  draft.chartConfig = deriveFiltersFromFields(draft.chartConfig, dimensions);

  return draft;
};

export const handleChartOptionChanged = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_OPTION_CHANGED" }>
) => {
  if (draft.state === "CONFIGURING_CHART") {
    // Side effects of changing an option.
    // Maybe they could be defined in UI encodings?
    if (action.value.field) {
      if (action.value.path === "color.scaleType") {
        const interpolationTypePath = `chartConfig.fields.${action.value.field}.color.interpolationType`;
        const nbClassPath = `chartConfig.fields.${action.value.field}.color.nbClass`;

        if (action.value.value === "continuous") {
          setWith(draft, interpolationTypePath, "linear", Object);
          unset(draft, nbClassPath);
        } else if (action.value.value === "discrete") {
          setWith(draft, interpolationTypePath, "jenks", Object);
          setWith(draft, nbClassPath, 3, Object);
        }
      } else if (action.value.path === "color.componentIri") {
        const fieldIri = get(
          draft,
          `chartConfig.fields.${action.value.field}.componentIri`
        );
        const previousComponentIri = get(
          draft,
          `chartConfig.fields.${action.value.field}.color.componentIri`
        ) as string;

        const metadata = getCachedCubeMetadataWithComponentValues(
          draft,
          action.value.locale
        );
        const allComponents = metadata
          ? [...metadata.dimensions, ...metadata.measures]
          : [];
        const component = allComponents.find(
          (d) => d.iri === action.value.value
        );

        // Clear old filters when switching to a new component.
        if (previousComponentIri !== fieldIri) {
          unset(draft, `chartConfig.filters["${previousComponentIri}"]`);
        }

        if (!component) {
          setWith(
            draft,
            `chartConfig.fields.${action.value.field}.color`,
            DEFAULT_FIXED_COLOR_FIELD,
            Object
          );
        } else {
          const previousComponent = allComponents.find(
            (d) => d.iri === previousComponentIri
          );
          const previousPalette = get(
            draft,
            `chartConfig.fields.${action.value.field}.color.palette`
          );

          if (
            canDimensionBeMultiFiltered(component) ||
            isOrdinalMeasure(component)
          ) {
            const palette = getDefaultCategoricalPaletteName(
              component,
              previousPalette
            );
            setWith(
              draft,
              `chartConfig.fields.${action.value.field}.color`,
              {
                type: "categorical",
                componentIri: component.iri,
                palette,
                colorMapping: mapValueIrisToColor({
                  palette,
                  dimensionValues: component.values,
                }),
              },
              Object
            );
          } else if (isNumericalMeasure(component)) {
            if (
              (previousComponent && !isNumericalMeasure(previousComponent)) ||
              !previousComponent
            ) {
              const newField: NumericalColorField = {
                type: "numerical",
                componentIri: component.iri,
                palette: previousPalette || "oranges",
                scaleType: "continuous",
                interpolationType: "linear",
              };

              setWith(
                draft,
                `chartConfig.fields.${action.value.field}.color`,
                newField,
                Object
              );
            }
          }
        }
      }
    }

    setWith(
      draft,
      action.value.field === null
        ? `chartConfig.${action.value.path}`
        : `chartConfig.fields["${action.value.field}"].${action.value.path}`,
      action.value.value,
      Object
    );
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
    const path = `fields.${field}${
      colorConfigPath ? `.${colorConfigPath}` : ""
    }`;
    const fieldValue = get(draft.chartConfig, path) as
      | (GenericField & { palette: string })
      | undefined;

    if (fieldValue?.componentIri === dimensionIri) {
      const colorMapping = mapValueIrisToColor({
        palette: fieldValue.palette,
        dimensionValues: values,
        random,
      });
      setWith(draft.chartConfig, `${path}.colorMapping`, colorMapping);
    }
  }

  return draft;
};

export const handleInteractiveFilterChanged = (
  draft: ConfiguratorState,
  action: Extract<
    ConfiguratorStateAction,
    { type: "INTERACTIVE_FILTER_CHANGED" }
  >
) => {
  if (draft.state === "CONFIGURING_CHART") {
    setWith(
      draft,
      "chartConfig.interactiveFiltersConfig",
      action.value,
      Object
    );
  }

  return draft;
};

export const handleInteractiveFilterTimeSliderReset = (
  draft: ConfiguratorState
) => {
  if (draft.state === "CONFIGURING_CHART") {
    if (draft.chartConfig.interactiveFiltersConfig) {
      draft.chartConfig.interactiveFiltersConfig.timeSlider.componentIri = "";
    }
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
        const metadata = getCachedCubeMetadataWithComponentValues(
          draft,
          locale
        );

        if (metadata) {
          const { dimensions, measures } = metadata;
          const previousConfig = current(draft.chartConfig);
          draft.chartConfig = getChartConfigAdjustedToChartType({
            chartConfig: previousConfig,
            newChartType: chartType,
            dimensions,
            measures,
          });
          draft.activeField = undefined;
          draft.chartConfig = deriveFiltersFromFields(
            draft.chartConfig,
            metadata.dimensions
          );
        }
      }

      return draft;

    case "ACTIVE_FIELD_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
        draft.activeField = action.value;
      }
      return draft;

    case "CHART_FIELD_CHANGED":
      return handleChartFieldChanged(draft, action);

    case "CHART_FIELD_DELETED":
      if (draft.state === "CONFIGURING_CHART") {
        delete (draft.chartConfig.fields as GenericFields)[action.value.field];

        const metadata = getCachedCubeMetadataWithComponentValues(
          draft,
          action.value.locale
        );
        const dimensions = metadata?.dimensions || [];

        draft.chartConfig = deriveFiltersFromFields(
          draft.chartConfig,
          dimensions
        );
      }

      return draft;

    case "CHART_OPTION_CHANGED":
      return handleChartOptionChanged(draft, action);

    case "CHART_PALETTE_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
        setWith(
          draft,
          `chartConfig.fields["${action.value.field}"].${
            action.value.colorConfigPath
              ? `${action.value.colorConfigPath}.`
              : ""
          }palette`,
          action.value.palette,
          Object
        );
        setWith(
          draft,
          `chartConfig.fields["${action.value.field}"].${
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
        setWith(
          draft,
          `chartConfig.fields["${action.value.field}"].${
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
        setWith(
          draft,
          `chartConfig.fields["${action.value.field}"].${
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
        setWith(draft, `meta.${action.value.path}`, action.value.value, Object);
      }
      return draft;

    case "INTERACTIVE_FILTER_CHANGED":
      return handleInteractiveFilterChanged(draft, action);

    case "INTERACTIVE_FILTER_TIME_SLIDER_RESET":
      return handleInteractiveFilterTimeSliderReset(draft);

    case "CHART_CONFIG_REPLACED":
      if (draft.state === "CONFIGURING_CHART") {
        draft.chartConfig = deriveFiltersFromFields(
          action.value.chartConfig,
          action.value.dataSetMetadata.dimensions
        );
      }

      return draft;

    case "CHART_CONFIG_FILTER_SET_SINGLE":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, value } = action.value;

        if (value === FIELD_VALUE_NONE) {
          delete draft.chartConfig.filters[dimensionIri];
        } else {
          draft.chartConfig.filters[dimensionIri] = {
            type: "single",
            value,
          };
        }
      }
      return draft;

    case "CHART_CONFIG_FILTER_REMOVE_SINGLE":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri } = action.value;
        delete draft.chartConfig.filters[dimensionIri];
        const newIFConfig = toggleInteractiveFilterDataDimension(
          draft.chartConfig.interactiveFiltersConfig,
          dimensionIri,
          false
        );
        draft.chartConfig.interactiveFiltersConfig = newIFConfig;
      }
      return draft;

    case "CHART_CONFIG_UPDATE_COLOR_MAPPING":
      return updateColorMapping(draft, action);

    case "CHART_CONFIG_FILTER_SET_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, values } = action.value;
        draft.chartConfig.filters[dimensionIri] = {
          type: "multi",
          values: Object.fromEntries(values.map((v) => [v, true])),
        };
      }
      return draft;

    case "CHART_CONFIG_FILTER_ADD_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, values, allValues } = action.value;
        const f = draft.chartConfig.filters[dimensionIri];
        const valuesUpdate = Object.fromEntries(
          values.map((v: string) => [v, true as true])
        );
        if (f && f.type === "multi") {
          f.values = {
            ...f.values,
            ...valuesUpdate,
          };
          // If all values are selected, we remove the filter again!
          if (allValues.every((v) => v in f.values)) {
            delete draft.chartConfig.filters[dimensionIri];
          }
        } else {
          draft.chartConfig.filters[dimensionIri] = {
            type: "multi",
            values: valuesUpdate,
          };
        }
      }
      return draft;

    case "CHART_CONFIG_FILTER_REMOVE_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, values, allValues } = action.value;
        const f = draft.chartConfig.filters[dimensionIri];

        if (f && f.type === "multi" && Object.keys(f.values).length > 0) {
          // If there are existing object keys, we just remove the current one
          for (let v of values) {
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
          draft.chartConfig.filters[dimensionIri] = {
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
        delete draft.chartConfig.filters[dimensionIri];
      }
      return draft;

    case "CHART_CONFIG_FILTER_SET_NONE_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri } = action.value;
        draft.chartConfig.filters[dimensionIri] = {
          type: "multi",
          values: {},
        };
      }
      return draft;

    case "CHART_CONFIG_FILTER_SET_RANGE":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, from, to } = action.value;
        draft.chartConfig.filters[dimensionIri] = {
          type: "range",
          from,
          to,
        };
      }
      return draft;

    case "CHART_CONFIG_FILTERS_UPDATE":
      if (draft.state === "CONFIGURING_CHART") {
        const { filters } = action.value;
        draft.chartConfig.filters = filters;
      }
      return draft;

    case "IMPUTATION_TYPE_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
        if (isAreaConfig(draft.chartConfig)) {
          draft.chartConfig.fields.y.imputationType = action.value.type;
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

    default:
      throw unreachableError(action);
  }
};

export const ConfiguratorStateContext = createContext<
  [ConfiguratorState, Dispatch<ConfiguratorStateAction>] | undefined
>(undefined);

type ChartId = string;
type DatasetIri = string;

export const initChartStateFromChart = async (
  from: ChartId
): Promise<ConfiguratorStateConfiguringChart | undefined> => {
  const config = await fetchChartConfig(from);

  if (config && config.data) {
    const {
      dataSet,
      dataSource = DEFAULT_DATA_SOURCE,
      meta,
      chartConfig,
    } = config.data;
    const migratedChartConfig = migrateChartConfig(chartConfig);

    return {
      key: undefined,
      state: "CONFIGURING_CHART",
      dataSet,
      dataSource,
      meta,
      chartConfig: migratedChartConfig,
      activeField: undefined,
    };
  }
};

export const initChartStateFromCube = async (
  client: Client,
  datasetIri: DatasetIri,
  dataSource: DataSource,
  locale: string
): Promise<ConfiguratorState | undefined> => {
  const { data } = await client
    .query<
      DataCubeMetadataWithComponentValuesQuery,
      DataCubeMetadataWithComponentValuesQueryVariables
    >(DataCubeMetadataWithComponentValuesDocument, {
      iri: datasetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    })
    .toPromise();
  if (!data || !data?.dataCubeByIri) {
    console.warn(`Could not fetch cube with iri ${datasetIri}`);
    return;
  }
  return transitionStepNext(
    getStateWithCurrentDataSource({ ...emptyState, dataSet: datasetIri }),
    data.dataCubeByIri
  );
};

/**
 * Tries to parse state from database.
 */
export const initChartStateFromDatabase = async (
  chartId: string
): Promise<ConfiguratorState | undefined> => {
  const config = await fetchChartConfig(chartId);
  if (config) {
    let parsedState;
    try {
      const chartConfigData = config.data;
      const migratedChartConfig = migrateChartConfig(
        chartConfigData.chartConfig
      );
      parsedState = decodeConfiguratorState({
        ...config.data,
        state: "CONFIGURING_CHART",
        key: config.key,
        chartConfig: migratedChartConfig,
      });
    } catch (e) {
      console.error("Error while parsing stored state", e);
      // Ignore errors since we are returning undefined and removing bad state from localStorage
    }
    return parsedState;
  } else {
    throw new Error(`Cannot found chart config ${chartId}`);
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
  const locale = useLocale();
  const stateAndDispatch = useImmerReducer(reducer, initialState);
  const [state, dispatch] = stateAndDispatch;
  const { asPath, push, replace, query } = useRouter();
  const client = useClient();

  // Re-initialize state on page load
  useEffect(() => {
    let stateToInitialize = getStateWithCurrentDataSource(initialState);

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
          newChartState = await initChartStateFromDatabase(chartId);
          if (!newChartState) {
            if (allowDefaultRedirect) replace(`/create/new`);
          }
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
    initialState,
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
    // Automatically saves config to the database
    const run = async () => {
      try {
        switch (state.state) {
          case "CONFIGURING_CHART": {
            if (!state.key) {
              const result = await createChartConfigFromConfiguratorState(
                state
              );
              replace(`/create/${result.key}`);
              return;
            } else {
              await updateChartConfigFromConfiguratorState(
                state.key,
                state,
                true
              );
              return;
            }
          }
          case "PUBLISHING": {
            try {
              if (!state.key) {
                throw new Error("Cannot publish chart without key");
              }
              const result = await updateChartConfigFromConfiguratorState(
                state.key,
                state,
                false
              );

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
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();
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
  chartId: string;
  children?: ReactNode;
  initialState?: ConfiguratorState;
  allowDefaultRedirect?: boolean;
  readonly?: boolean;
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

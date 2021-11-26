import produce from "immer";
import setWith from "lodash/setWith";
import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { Client, useClient } from "urql";
import { Reducer, useImmerReducer } from "use-immer";
import { ImputationType, isAreaConfig, isColumnConfig } from ".";
import { fetchChartConfig, saveChartConfig } from "../api";
import {
  getFieldComponentIris,
  getGroupedFieldIris,
  getHiddenFieldIris,
  getInitialConfig,
  getPossibleChartType,
} from "../charts";
import {
  DataCubeMetadataWithComponentValuesDocument,
  DataCubeMetadataWithComponentValuesQuery,
  DimensionMetaDataFragment,
} from "../graphql/query-hooks";
import { DataCubeMetadata } from "../graphql/types";
import { createChartId } from "../lib/create-chart-id";
import { unreachableError } from "../lib/unreachable";
import { useLocale } from "../locales/use-locale";
import { mapColorsToComponentValuesIris } from "./components/ui-helpers";
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
} from "./config-types";
import { FIELD_VALUE_NONE } from "./constants";

export type ConfiguratorStateAction =
  | { type: "INITIALIZED"; value: ConfiguratorState }
  | { type: "STEP_NEXT"; dataSetMetadata: DataCubeMetadata }
  | {
      type: "STEP_PREVIOUS";
      to?: Exclude<ConfiguratorState["state"], "INITIAL" | "PUBLISHING">;
    }
  | {
      type: "DATASET_SELECTED";
      dataSet: string | undefined;
    }
  | {
      type: "CHART_TYPE_CHANGED";
      value: { chartType: ChartType; dataSetMetadata: DataCubeMetadata };
    }
  | {
      type: "ACTIVE_FIELD_CHANGED";
      value: string | undefined;
    }
  | {
      type: "CHART_FIELD_CHANGED";
      value: {
        field: string;
        componentIri: string;
        dataSetMetadata: DataCubeMetadata;
      };
    }
  | {
      type: "CHART_OPTION_CHANGED";
      value: {
        path: string;
        field: string | null;
        value: string | boolean | Record<string, string> | undefined;
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
        field: string;
        dataSetMetadata: DataCubeMetadata;
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
      type: "CHART_CONFIG_REPLACED";
      value: { chartConfig: ChartConfig; dataSetMetadata: DataCubeMetadata };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_SINGLE";
      value: { dimensionIri: string; value: string };
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

const LOCALSTORAGE_PREFIX = "vizualize-configurator-state";
export const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

const INITIAL_STATE: ConfiguratorState = {
  state: "INITIAL",
  dataSet: undefined,
  activeField: undefined,
};

const emptyState: ConfiguratorStateSelectingDataSet = {
  state: "SELECTING_DATASET",
  dataSet: undefined,
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

export const getFilterValue = (
  state: ConfiguratorState,
  dimensionIri: string
): FilterValue | undefined => {
  return state.state !== "INITIAL" && state.state !== "SELECTING_DATASET"
    ? state.chartConfig.filters[dimensionIri]
    : undefined;
};

const deriveFiltersFromFields = produce(
  (chartConfig: ChartConfig, { dimensions }: DataCubeMetadata) => {
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

      dimensions.forEach((dimension) =>
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
  dimension: DimensionMetaDataFragment;
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
  dimension: DimensionMetaDataFragment;
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
      filters[dimension.iri] = {
        type: "single",
        value: dimension.values[0].value,
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
          meta: dataSetMetadata,
        });

        const chartConfig = deriveFiltersFromFields(
          getInitialConfig({
            chartType: possibleChartTypes[0],
            dimensions: dataSetMetadata.dimensions,
            measures: dataSetMetadata.measures,
          }),
          dataSetMetadata
        );

        return {
          state: "SELECTING_CHART_TYPE",
          dataSet: draft.dataSet,
          meta: draft.meta,
          activeField: undefined,
          chartConfig,
        };
      }
      break;
    case "SELECTING_CHART_TYPE":
      return {
        ...draft,
        activeField: undefined,
        state: "CONFIGURING_CHART",
      };
    case "CONFIGURING_CHART":
      return {
        ...draft,
        activeField: undefined,
        state: "DESCRIBING_CHART",
      };
    case "DESCRIBING_CHART":
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
    case "SELECTING_CHART_TYPE":
    case "CONFIGURING_CHART":
    case "DESCRIBING_CHART":
      // These are all interchangeable in terms of validity
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
    case "SELECTING_CHART_TYPE":
      return "SELECTING_DATASET";
    case "CONFIGURING_CHART":
      return "SELECTING_CHART_TYPE";
    case "DESCRIBING_CHART":
      return "CONFIGURING_CHART";
    case "PUBLISHING":
      return "DESCRIBING_CHART";
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
    case "SELECTING_CHART_TYPE":
      return {
        ...draft,
        activeField: undefined,
        state: stepTo,
      };
    case "CONFIGURING_CHART":
      return {
        ...draft,
        activeField: undefined,
        state: stepTo,
      };
    case "DESCRIBING_CHART":
      return {
        ...draft,
        activeField: undefined,
        state: stepTo,
      };
    default:
      return draft;
  }
};

export const canTransitionToPreviousStep = (
  state: ConfiguratorState
): boolean => {
  // All states are interchangeable in terms of validity
  return true;
};

const reducer: Reducer<ConfiguratorState, ConfiguratorStateAction> = (
  draft,
  action
) => {
  switch (action.type) {
    case "INITIALIZED":
      // Never restore from an UNINITIALIZED state
      return action.value.state === "INITIAL" ? emptyState : action.value;
    case "DATASET_SELECTED":
      if (draft.state === "SELECTING_DATASET") {
        draft.dataSet = action.dataSet;
      }
      return draft;
    case "CHART_TYPE_CHANGED":
      if (draft.state === "SELECTING_CHART_TYPE") {
        // setWith(draft, action.value.path, action.value.value, Object);
        const { chartType, dataSetMetadata } = action.value;

        draft.chartConfig = getInitialConfig({
          chartType,
          dimensions: dataSetMetadata.dimensions,
          measures: dataSetMetadata.measures,
        });
        draft.activeField = undefined;

        draft.chartConfig = deriveFiltersFromFields(
          draft.chartConfig,
          dataSetMetadata
        );
      }
      return draft;

    case "ACTIVE_FIELD_CHANGED":
      if (
        draft.state === "CONFIGURING_CHART" ||
        draft.state === "DESCRIBING_CHART"
      )
        draft.activeField = action.value;
      return draft;

    case "CHART_FIELD_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
        const f = (draft.chartConfig.fields as GenericFields)[
          action.value.field
        ];
        if (!f) {
          // The field was not defined before
          if (action.value.field === "segment") {
            const component = action.value.dataSetMetadata.dimensions.find(
              (dim) => dim.iri === action.value.componentIri
            );
            const colorMapping =
              component &&
              mapColorsToComponentValuesIris({
                palette: "category10",
                component,
              });
            // FIXME: This should be more chart specific
            // (no "stacked" for scatterplots for instance)
            // Filter for table to make TS happy :/
            // if (draft.chartConfig.chartType !== "table") {
            draft.chartConfig.fields.segment = {
              componentIri: action.value.componentIri,
              palette: "category10",
              type: "stacked",
              sorting: {
                sortingType: "byDimensionLabel",
                sortingOrder: "asc",
              },
              colorMapping: colorMapping,
            };

            // Remove this component from the interactive filter, if it is there
            if (draft.chartConfig.interactiveFiltersConfig) {
              draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris =
                draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris.filter(
                  (c) => c !== action.value.componentIri
                );
            }
            // }
          }
        } else {
          // The field is being updated
          if (
            // draft.chartConfig.chartType !== "table" &&
            action.value.field === "segment" &&
            "segment" in draft.chartConfig.fields &&
            draft.chartConfig.fields.segment &&
            "palette" in draft.chartConfig.fields.segment
          ) {
            const component = action.value.dataSetMetadata.dimensions.find(
              (dim) => dim.iri === action.value.componentIri
            );
            const colorMapping =
              component &&
              mapColorsToComponentValuesIris({
                palette:
                  draft.chartConfig.fields.segment.palette || "category10",
                component,
              });

            draft.chartConfig.fields.segment.componentIri =
              action.value.componentIri;
            draft.chartConfig.fields.segment.colorMapping = colorMapping;

            // Remove this component from the interactive filter, if it is there
            if (draft.chartConfig.interactiveFiltersConfig) {
              draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris =
                draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris.filter(
                  (c) => c !== action.value.componentIri
                );
            }
          } else {
            const component = action.value.dataSetMetadata.dimensions.find(
              (dim) => dim.iri === action.value.componentIri
            );
            // Reset other field options
            (draft.chartConfig.fields as GenericFields)[action.value.field] = {
              componentIri: action.value.componentIri,
            };
            // if x !== time, also deactivate interactive time filter
            if (
              isColumnConfig(draft.chartConfig) &&
              action.value.field === "x" &&
              component?.__typename !== "TemporalDimension" &&
              draft.chartConfig.interactiveFiltersConfig
            ) {
              setWith(
                draft,
                `chartConfig.interactiveFiltersConfig.time.active`,
                false,
                Object
              );
            }
            // Remove this component from the interactive filter, if it is there
            if (draft.chartConfig.interactiveFiltersConfig) {
              draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris =
                draft.chartConfig.interactiveFiltersConfig.dataFilters.componentIris.filter(
                  (c) => c !== action.value.componentIri
                );
            }
          }
        }

        draft.chartConfig = deriveFiltersFromFields(
          draft.chartConfig,
          action.value.dataSetMetadata
        );
      }
      return draft;

    case "CHART_FIELD_DELETED":
      if (draft.state === "CONFIGURING_CHART") {
        delete (draft.chartConfig.fields as GenericFields)[action.value.field];

        draft.chartConfig = deriveFiltersFromFields(
          draft.chartConfig,
          action.value.dataSetMetadata
        );
      }
      return draft;

    case "CHART_OPTION_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
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
      if (draft.state === "DESCRIBING_CHART") {
        setWith(draft, `meta.${action.value.path}`, action.value.value, Object);
      }
      return draft;

    case "INTERACTIVE_FILTER_CHANGED":
      if (draft.state === "DESCRIBING_CHART") {
        setWith(
          draft,
          `chartConfig.interactiveFiltersConfig`,
          action.value,
          Object
        );
      }
      return draft;

    case "CHART_CONFIG_REPLACED":
      if (draft.state === "CONFIGURING_CHART") {
        draft.chartConfig = deriveFiltersFromFields(
          action.value.chartConfig,
          action.value.dataSetMetadata
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

const ConfiguratorStateContext = createContext<
  [ConfiguratorState, Dispatch<ConfiguratorStateAction>] | undefined
>(undefined);

type ChartId = string;
type DatasetIri = string;

export const initChartStateFromChart = async (
  from: ChartId
): Promise<ConfiguratorState | undefined> => {
  const config = await fetchChartConfig(from);
  if (config && config.data) {
    const { dataSet, meta, chartConfig } = config.data;
    return {
      state: "CONFIGURING_CHART",
      dataSet,
      meta,
      chartConfig,
      activeField: undefined,
    };
  }
};

export const initChartStateFromCube = async (
  client: Client,
  datasetIri: DatasetIri,
  locale: string
): Promise<ConfiguratorState | undefined> => {
  const { data } = await client
    .query<DataCubeMetadataWithComponentValuesQuery>(
      DataCubeMetadataWithComponentValuesDocument,
      {
        iri: datasetIri,
        locale,
      }
    )
    .toPromise();
  if (!data || !data?.dataCubeByIri) {
    console.warn(`Could not fetch cube with iri ${datasetIri}`);
    return;
  }
  return transitionStepNext(
    {
      ...emptyState,
      dataSet: datasetIri,
    },
    data.dataCubeByIri
  );
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
      parsedState = decodeConfiguratorState(JSON.parse(storedState));
    } catch (e) {
      console.error("Error while parsing stored state", e);
      // Ignore errors since we are returning undefined and removing bad state from localStorage
    }
    if (parsedState) {
      return parsedState;
    } else {
      console.warn(
        "Attempted to restore invalid state. Removing from localStorage.",
        parsedState
      );
      window.localStorage.removeItem(getLocalStorageKey(chartId));
    }
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
  const locale = useLocale();
  const stateAndDispatch = useImmerReducer(reducer, initialState);
  const [state, dispatch] = stateAndDispatch;
  const { asPath, push, replace, query } = useRouter();
  const client = useClient();

  // Re-initialize state on page load
  useEffect(() => {
    let stateToInitialize: ConfiguratorState = initialState;

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
              locale
            );
          }
        } else {
          newChartState = await initChartStateFromLocalStorage(chartId);
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
    try {
      switch (state.state) {
        case "CONFIGURING_CHART":
        case "DESCRIBING_CHART":
        case "SELECTING_CHART_TYPE":
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
              const result = await saveChartConfig(state);

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

              await push(
                {
                  pathname: `/v/${result.key}`,
                  query: { publishSuccess: true },
                },
                `/v/${result.key}` // Hide publishSuccess=true from URL
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
  }, [state, dispatch, chartId, push, asPath, locale, query.from]);

  return (
    <ConfiguratorStateContext.Provider value={stateAndDispatch}>
      {children}
    </ConfiguratorStateContext.Provider>
  );
};

export const ConfiguratorStateProvider = ({
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

export const useConfiguratorState = () => {
  const ctx = useContext(ConfiguratorStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need an <ConfiguratorStateProvider> to useConfiguratorState"
    );
  }

  return ctx;
};

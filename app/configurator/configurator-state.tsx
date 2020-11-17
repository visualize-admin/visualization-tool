import setWith from "lodash/setWith";
import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { Reducer, useImmerReducer } from "use-immer";
import { DataCubeMetadata } from "../graphql/types";
import { unreachableError } from "../lib/unreachable";
import { useLocale } from "../locales/use-locale";
import { createChartId } from "../lib/create-chart-id";
import {
  getFieldComponentIris,
  getFilteredFieldIris,
  getInitialConfig,
} from "../charts";
import {
  ChartConfig,
  ChartType,
  ConfiguratorState,
  ConfiguratorStatePublishing,
  ConfiguratorStateSelectingDataSet,
  decodeConfiguratorState,
  FilterValue,
  FilterValueMultiValues,
  GenericFields,
} from "./config-types";
import { mapColorsToComponentValuesIris } from "./components/ui-helpers";
import { createDraft } from "immer";

export type ConfiguratorStateAction =
  | { type: "INITIALIZED"; value: ConfiguratorState }
  | { type: "STEP_NEXT"; dataSetMetadata: DataCubeMetadata }
  | {
      type: "STEP_PREVIOUS";
      to?: Exclude<ConfiguratorState["state"], "INITIAL" | "PUBLISHING">;
    }
  | {
      type: "DATASET_SELECTED";
      dataSet: string;
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
        field: string;
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
      type: "CHART_CONFIG_REPLACED";
      value: { chartConfig: ChartConfig; dataSetMetadata: DataCubeMetadata };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_SINGLE";
      value: { dimensionIri: string; value: string };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_MULTI";
      value: { dimensionIri: string; value: string; allValues: string[] };
    }
  | {
      type: "CHART_CONFIG_FILTER_ADD_MULTI";
      value: { dimensionIri: string; value: string; allValues: string[] };
    }
  | {
      type: "CHART_CONFIG_FILTER_REMOVE_MULTI";
      value: { dimensionIri: string; value: string; allValues: string[] };
    }
  | {
      type: "CHART_CONFIG_FILTER_RESET_MULTI";
      value: { dimensionIri: string };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_NONE_MULTI";
      value: { dimensionIri: string };
    }
  | { type: "PUBLISH_FAILED" }
  | { type: "PUBLISHED"; value: string };

export type ActionType<
  ConfiguratorStateAction
> = ConfiguratorStateAction[keyof ConfiguratorStateAction];

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

const deriveFiltersFromFields = (
  chartConfig: ChartConfig,
  { dimensions }: DataCubeMetadata
) => {
  // 1. we need filters for all dimensions
  // 2. if a dimension is mapped to a field, it should be a multi filter, otherwise a single filter
  // 3a. if the filter type is correct, we leave it alone
  // 3b. if there's a mis-match, then we try to convert multi -> single and single -> multi
  const { fields, filters } = chartConfig;

  const fieldDimensionIris = getFieldComponentIris(fields);
  const filteredFieldIris = getFilteredFieldIris(fields);

  const isField = (iri: string) => fieldDimensionIris.has(iri);
  const isPreFiltered = (iri: string) => filteredFieldIris.has(iri);
  const isFiltered = (iri: string) => !isField(iri) || isPreFiltered(iri);

  dimensions.forEach((dimension) => {
    const f = filters[dimension.iri];
    if (f !== undefined) {
      // Fix wrong filter type
      if (!isFiltered(dimension.iri) && f.type === "single") {
        // Remove filter
        delete filters[dimension.iri];
      } else if (isFiltered(dimension.iri) && f.type === "multi") {
        filters[dimension.iri] = {
          type: "single",
          value: Object.keys(f.values)[0],
        };
      }
    } else {
      // Add filter for this dim if it's not one of the selected multi filter fields
      if (isFiltered(dimension.iri)) {
        filters[dimension.iri] = {
          type: "single",
          value: dimension.values[0].value,
        };
      }
    }
  });

  return chartConfig;
};

const transitionStepNext = (
  draft: ConfiguratorState,
  dataSetMetadata: DataCubeMetadata
): ConfiguratorState => {
  switch (draft.state) {
    case "SELECTING_DATASET":
      if (draft.dataSet) {
        const chartConfig = getInitialConfig({
          chartType: "column",
          dimensions: dataSetMetadata.dimensions,
          measures: dataSetMetadata.measures,
        });

        deriveFiltersFromFields(chartConfig, dataSetMetadata);

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

        deriveFiltersFromFields(draft.chartConfig, dataSetMetadata);
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
            if (draft.chartConfig.chartType !== "table") {
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
            }
          }
        } else {
          // The field is being updated
          if (
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
          } else {
            // Reset other field options
            (draft.chartConfig.fields as GenericFields)[action.value.field] = {
              componentIri: action.value.componentIri,
            };
          }
        }

        deriveFiltersFromFields(
          draft.chartConfig,
          action.value.dataSetMetadata
        );
      }
      return draft;

    case "CHART_FIELD_DELETED":
      if (draft.state === "CONFIGURING_CHART") {
        delete (draft.chartConfig.fields as GenericFields)[action.value.field];

        deriveFiltersFromFields(
          draft.chartConfig,
          action.value.dataSetMetadata
        );
      }
      return draft;

    case "CHART_OPTION_CHANGED":
      if (draft.state === "CONFIGURING_CHART") {
        setWith(
          draft,
          `chartConfig.fields["${action.value.field}"].${action.value.path}`,
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

    case "CHART_CONFIG_REPLACED":
      if (draft.state === "CONFIGURING_CHART") {
        draft.chartConfig = createDraft(action.value.chartConfig);

        deriveFiltersFromFields(
          draft.chartConfig,
          action.value.dataSetMetadata
        );
      }
      return draft;

    case "CHART_CONFIG_FILTER_SET_SINGLE":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, value } = action.value;
        draft.chartConfig.filters[dimensionIri] = { type: "single", value };
      }
      return draft;

    case "CHART_CONFIG_FILTER_SET_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, value } = action.value;
        draft.chartConfig.filters[dimensionIri] = {
          type: "multi",
          values: { [value]: true },
        };
      }
      return draft;

    case "CHART_CONFIG_FILTER_ADD_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, value, allValues } = action.value;
        const f = draft.chartConfig.filters[dimensionIri];
        if (f && f.type === "multi") {
          f.values = { ...f.values, [value]: true };
          // If all values are selected, we remove the filter again!
          if (allValues.every((v) => v in f.values)) {
            delete draft.chartConfig.filters[dimensionIri];
          }
        } else {
          draft.chartConfig.filters[dimensionIri] = {
            type: "multi",
            values: { [value]: true },
          };
        }
      }
      return draft;

    case "CHART_CONFIG_FILTER_REMOVE_MULTI":
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, value, allValues } = action.value;
        const f = draft.chartConfig.filters[dimensionIri];

        if (f && f.type === "multi" && Object.keys(f.values).length > 0) {
          // If there are existing object keys, we just remove the current one
          delete f.values[value];
        } else {
          // Otherwise we set the filters to all values minus the current one
          const values = allValues.reduce<FilterValueMultiValues>(
            (_values, v) => {
              if (v !== value) {
                _values[v] = true;
              }
              return _values;
            },
            {}
          );
          draft.chartConfig.filters[dimensionIri] = {
            type: "multi",
            values,
          };
        }
      }
      return draft;

    case "CHART_CONFIG_FILTER_RESET_MULTI":
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

const ConfiguratorStateProviderInternal = ({
  chartId,
  children,
  initialState = INITIAL_STATE,
}: {
  key: string;
  chartId: string;
  children?: ReactNode;
  initialState?: ConfiguratorState;
}) => {
  const locale = useLocale();
  const stateAndDispatch = useImmerReducer(reducer, initialState);
  const [state, dispatch] = stateAndDispatch;
  const { asPath, push, replace, query } = useRouter();

  // Re-initialize state on page load
  useEffect(() => {
    let stateToInitialize: ConfiguratorState = initialState;

    const initialize = async () => {
      try {
        if (chartId === "new" && query.from) {
          const config = await fetch(
            `/api/config/${query.from}`
          ).then((result) => result.json());
          if (config && config.data) {
            const { dataSet, meta, chartConfig } = config.data;
            stateToInitialize = {
              state: "CONFIGURING_CHART",
              dataSet,
              meta,
              chartConfig,
              activeField: undefined,
            };
          }
        }
        if (chartId !== "new") {
          const storedState = window.localStorage.getItem(
            getLocalStorageKey(chartId)
          );
          if (storedState) {
            const parsedState = decodeConfiguratorState(
              JSON.parse(storedState)
            );
            if (parsedState) {
              stateToInitialize = parsedState;
            } else {
              console.warn(
                "Attempted to restore invalid state. Removing from localStorage.",
                parsedState
              );
              window.localStorage.removeItem(getLocalStorageKey(chartId));
            }
          } else {
            replace(`/[locale]/create/[chartId]`, `/${locale}/create/new`);
          }
        }
      } catch {
      } finally {
        dispatch({ type: "INITIALIZED", value: stateToInitialize });
      }
    };
    initialize();
  }, [dispatch, chartId, replace, initialState, query, locale]);

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
            push(
              `/[locale]/create/[chartId]`,
              `/${locale}/create/${newChartId}`
            );
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
              const result = await save(state);
              await push(
                {
                  pathname: `/[locale]/v/[chartId]`,
                  query: { publishSuccess: true },
                },
                `/${locale}/v/${result.key}`
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

type ReturnVal = {
  key: string;
};
const save = async (state: ConfiguratorStatePublishing): Promise<ReturnVal> => {
  return fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataSet: state.dataSet,
      meta: state.meta,
      chartConfig: state.chartConfig,
    }),
  }).then((res) => res.json());
};

export const ConfiguratorStateProvider = ({
  chartId,
  children,
  initialState,
}: {
  chartId: string;
  children?: ReactNode;
  initialState?: ConfiguratorState;
}) => {
  // Ensure that the state is reset by using the `chartId` as `key`
  return (
    <ConfiguratorStateProviderInternal
      key={chartId}
      chartId={chartId}
      initialState={initialState}
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

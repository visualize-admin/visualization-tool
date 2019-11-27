import setWith from "lodash/setWith";
import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect
} from "react";
import { Reducer, useImmerReducer } from "use-immer";
import { createChartId } from "./chart-id";
import {
  ConfiguratorState,
  ConfiguratorStatePublishing,
  FilterValue,
  FilterValueMulti,
  ChartConfig,
  FieldType,
  ChartType,
  ConfiguratorStateSelectingDataSet,
  decodeConfiguratorState
} from "./config-types";
import { DataSetMetadata } from "./data-cube";
import { getInitialFields } from "./charts";

export type ConfiguratorStateAction =
  | { type: "INITIALIZED"; value: ConfiguratorState }
  | { type: "STEP_NEXT"; dataSetMetadata: DataSetMetadata }
  | { type: "STEP_PREVIOUS" }
  | {
      type: "DATASET_SELECTED";
      dataSet: string;
    }
  | {
      type: "CHART_TYPE_CHANGED";
      value: { chartType: ChartType; dataSetMetadata: DataSetMetadata };
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
        dataSetMetadata: DataSetMetadata;
      };
    }
  | {
      type: "CHART_OPTION_CHANGED";
      value: {
        path: string;
        field: string;
        value: string;
      };
    }
  | {
      type: "CHART_DESCRIPTION_CHANGED";
      value: { path: string | string[]; value: $FixMe };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_SINGLE";
      value: { dimensionIri: string; value: string };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_MULTI";
      value: { dimensionIri: string; values: FilterValueMulti["values"] };
    }
  | { type: "PUBLISH_FAILED" }
  | { type: "PUBLISHED"; value: string };

export type ActionType<
  ConfiguratorStateAction
> = ConfiguratorStateAction[keyof ConfiguratorStateAction];

const LOCALSTORAGE_PREFIX = "vizualize-configurator-state";
export const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

const initialState: ConfiguratorState = {
  state: "INITIAL",
  dataSet: undefined,
  activeField: undefined
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
      en: ""
    },
    description: {
      de: "",
      fr: "",
      it: "",
      en: ""
    }
  },
  activeField: undefined
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
  { dimensions }: DataSetMetadata
) => {
  // 1. we need filters for all dimensions
  // 2. if a dimension is mapped to a field, it should be a multi filter, otherwise a single filter
  // 3a. if the filter type is correct, we leave it alone
  // 3b. if there's a mis-match, then we try to convert multi -> single and single -> multi
  const { fields, filters } = chartConfig;

  const fieldDimensionIris = new Set(
    Object.values<FieldType>(fields).map(({ componentIri }) => componentIri)
  );

  const isField = (iri: string) => fieldDimensionIris.has(iri);

  dimensions.forEach(dimension => {
    if (filters[dimension.component.iri.value] !== undefined) {
      // Fix wrong filter type
      if (
        isField(dimension.component.iri.value) &&
        filters[dimension.component.iri.value].type === "single"
      ) {
        filters[dimension.component.iri.value] = { type: "multi", values: {} };
      } else if (
        !isField(dimension.component.iri.value) &&
        filters[dimension.component.iri.value].type === "multi"
      ) {
        filters[dimension.component.iri.value] = {
          type: "single",
          value: dimension.values[0].value.value
        };
      }
    } else {
      // Add filter for this dim
      if (isField(dimension.component.iri.value)) {
        filters[dimension.component.iri.value] = { type: "multi", values: {} };
      } else {
        filters[dimension.component.iri.value] = {
          type: "single",
          value: dimension.values[0].value.value
        };
      }
      // Check
    }
  });

  return chartConfig;
};

const transitionStepNext = (
  draft: ConfiguratorState,
  dataSetMetadata: DataSetMetadata
): ConfiguratorState => {
  switch (draft.state) {
    case "SELECTING_DATASET":
      if (draft.dataSet) {
        const chartConfig: ChartConfig = {
          chartType: "column",
          fields: getInitialFields({
            chartType: "column",
            dimensions: dataSetMetadata.dimensions,
            measures: dataSetMetadata.measures
          }),
          filters: {}
        };

        deriveFiltersFromFields(chartConfig, dataSetMetadata);

        return {
          state: "SELECTING_CHART_TYPE",
          dataSet: draft.dataSet,
          meta: draft.meta,
          activeField: undefined,
          chartConfig
        };
      }
      break;
    case "SELECTING_CHART_TYPE":
      return {
        ...draft,
        activeField: undefined,
        state: "CONFIGURING_CHART"
      };
    case "CONFIGURING_CHART":
      return {
        ...draft,
        activeField: undefined,
        state: "DESCRIBING_CHART"
      };
    case "DESCRIBING_CHART":
      return {
        ...draft,
        activeField: undefined,
        state: "PUBLISHING"
      };
    //    case "PUBLISHING":
    // NO next step?
    default:
      console.warn("Unhandled STEP_NEXT from", draft.state);
      break;
  }
  return draft;
};

export const canTransitionToNextStep = (
  state: ConfiguratorState,
  dataSetMetadata: DataSetMetadata | undefined
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

const transitionStepPrevious = (
  draft: ConfiguratorState
): ConfiguratorState => {
  switch (draft.state) {
    case "SELECTING_DATASET":
      return draft;
    case "SELECTING_CHART_TYPE":
      return {
        ...draft,
        activeField: undefined,
        chartConfig: undefined,
        state: "SELECTING_DATASET"
      };
    case "CONFIGURING_CHART":
      return {
        ...draft,
        activeField: undefined,
        state: "SELECTING_CHART_TYPE"
      };
    case "DESCRIBING_CHART":
      return {
        ...draft,
        activeField: undefined,
        state: "CONFIGURING_CHART"
      };
    case "PUBLISHING":
      return {
        ...draft,
        activeField: undefined,
        state: "DESCRIBING_CHART"
      };
  }
  return draft;
};

export const canTransitionToPreviousStep = (
  state: ConfiguratorState
): boolean => {
  switch (state.state) {
    case "PUBLISHED":
      return false;
    default:
      // These are all interchangeable in terms of validity
      return true;
  }
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

        draft.chartConfig = {
          chartType,
          fields: getInitialFields({
            chartType,
            dimensions: dataSetMetadata.dimensions,
            measures: dataSetMetadata.measures
          }),
          filters: {}
        };
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
      if (
        draft.state === "CONFIGURING_CHART"
        //  && draft.chartConfig.chartType === "column"
      ) {
        const f = draft.chartConfig.fields[action.value.field];
        if (!f) {
          if (action.value.field === "segment") {
            draft.chartConfig.fields[action.value.field] = {
              componentIri: action.value.componentIri,
              palette: "category10",
              type: "stacked"
            };
          }
        } else {
          f.componentIri = action.value.componentIri;
        }

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
          `chartConfig.fields.${action.value.field}.${action.value.path}`,
          action.value.value,
          Object
        );
      }
      return draft;

    case "CHART_DESCRIPTION_CHANGED":
      if (draft.state === "DESCRIBING_CHART") {
        setWith(draft, `meta.${action.value.path}`, action.value.value, Object);
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
        const { dimensionIri, values } = action.value;
        const f = draft.chartConfig.filters[dimensionIri];
        if (f && f.type === "multi") {
          f.values = { ...f.values, ...values };
        } else {
          draft.chartConfig.filters[dimensionIri] = {
            type: "multi",
            values
          };
        }
      }
      return draft;

    // State transitions
    case "STEP_NEXT":
      return transitionStepNext(draft, action.dataSetMetadata);
      
    case "STEP_PREVIOUS":
      return transitionStepPrevious(draft);

    // Special state transitions
    case "PUBLISH_FAILED":
      if (draft.state === "PUBLISHING") {
        return transitionStepPrevious(draft);
      }
      return draft;

    case "PUBLISHED":
      if (draft.state === "PUBLISHING") {
        return {
          ...draft,
          activeField: undefined,
          configKey: action.value,
          state: "PUBLISHED"
        };
      }
      return draft;

    default:
      return draft;
  }
};

const ConfiguratorStateContext = createContext<
  [ConfiguratorState, Dispatch<ConfiguratorStateAction>] | undefined
>(undefined);

const ConfiguratorStateProviderInternal = ({
  chartId,
  children
}: {
  key: string;
  chartId: string;
  children?: ReactNode;
}) => {
  const stateAndDispatch = useImmerReducer(reducer, initialState);
  const [state, dispatch] = stateAndDispatch;
  const { asPath, push, replace } = useRouter();

  // Re-initialize state on page load
  useEffect(() => {
    let stateToInitialize: ConfiguratorState = initialState;
    try {
      if (chartId !== "new") {
        const storedState = window.localStorage.getItem(
          getLocalStorageKey(chartId)
        );
        if (storedState) {
          const parsedState = decodeConfiguratorState(JSON.parse(storedState));
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
          replace(
            `/[locale]/chart/[chartId]`,
            asPath.replace(/\/chart\/.+$/, "/chart/new")
          );
        }
      }
    } catch {
    } finally {
      dispatch({ type: "INITIALIZED", value: stateToInitialize });
    }
  }, [dispatch, chartId, replace, asPath]);

  useEffect(() => {
    try {
      switch (state.state) {
        case "CONFIGURING_CHART":
        case "DESCRIBING_CHART":
        case "SELECTING_CHART_TYPE":
          if (chartId === "new") {
            const newChartId = createChartId();
            // Store current state in localstorage
            window.localStorage.setItem(
              getLocalStorageKey(newChartId),
              JSON.stringify(state)
            );
            push(
              `/[locale]/chart/[chartId]`,
              (asPath as string).replace(/new$/, newChartId)
            );
          } else {
            // Store current state in localstorage
            window.localStorage.setItem(
              getLocalStorageKey(chartId),
              JSON.stringify(state)
            );
          }
          return;
        case "PUBLISHED":
          // Store current state in localstorage
          window.localStorage.setItem(
            getLocalStorageKey(chartId),
            JSON.stringify(state)
          );
          return;
        case "PUBLISHING":
          (async () => {
            try {
              const result = await save(state);
              dispatch({ type: "PUBLISHED", value: result.key });
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
  }, [state, dispatch, chartId, push, asPath]);

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
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      dataSet: state.dataSet,
      chartConfig: state.chartConfig
    })
  }).then(res => res.json());
};

export const ConfiguratorStateProvider = ({
  chartId,
  children
}: {
  chartId: string;
  children?: ReactNode;
}) => {
  // Ensure that the state is reset by using the `chartId` as `key`
  return (
    <ConfiguratorStateProviderInternal key={chartId} chartId={chartId}>
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

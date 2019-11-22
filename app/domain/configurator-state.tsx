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
  isValidConfiguratorState,
  ChartConfig,
  FieldType,
  ChartType,
  ConfiguratorStateSelectingDataSet
} from "./config-types";
import { DataSetMetadata } from "./data-cube";
import { getInitialFields } from "./charts";

export type ConfiguratorStateAction =
  | { type: "INITIALIZED"; value: ConfiguratorState }
  | { type: "DATASET_SELECTED"; value: { dataSet: string; title?: string } }
  | {
      type: "CHART_TYPE_PREVIEWED";
      value: { chartType: ChartType; dataSetMetadata: DataSetMetadata };
    }
  | {
      type: "CHART_TYPE_SELECTED";
    }
  | {
      type: "CONTROL_TAB_CHANGED";
      value: string;
    }
  | {
      type: "CHART_CONFIG_CHANGED";
      value: { path: string | string[]; value: $FixMe };
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
      type: "CHART_CONFIGURED";
    }
  | {
      type: "CHART_ANNOTATION_TAB_CHANGED";
      value: string;
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
  | { type: "PUBLISH" }
  | { type: "PUBLISH_FAILED" }
  | { type: "PUBLISHED"; value: string };

export type ActionType<
  ConfiguratorStateAction
> = ConfiguratorStateAction[keyof ConfiguratorStateAction];

const LOCALSTORAGE_PREFIX = "vizualize-configurator-state";
export const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

const initialState: ConfiguratorState = {
  state: "INITIAL"
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
  activeField: ""
};

export const getFilterValue = (
  state: ConfiguratorState,
  dimensionIri: string
): FilterValue | undefined => {
  return state.state !== "INITIAL" &&
    state.state !== "SELECTING_DATASET" &&
    state.state !== "PRE_SELECTING_CHART_TYPE"
    ? state.chartConfig.filters[dimensionIri]
    : undefined;
};

const deriveFiltersFromFields = (
  { fields, filters }: ChartConfig,
  { dimensions }: DataSetMetadata
) => {
  // 1. we need filters for all dimensions
  // 2. if a dimension is mapped to a field, it should be a multi filter, otherwise a single filter
  // 3a. if the filter type is correct, we leave it alone
  // 3b. if there's a mis-match, then we try to convert multi -> single and single -> multi

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

  return filters;
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
      draft.state = "PRE_SELECTING_CHART_TYPE";
      if (draft.state === "PRE_SELECTING_CHART_TYPE") {
        const { dataSet } = action.value;
        draft.dataSet = dataSet;
        draft.activeField = undefined;
      }
      return draft;

    case "CHART_TYPE_PREVIEWED":
      if (
        draft.state === "SELECTING_CHART_TYPE" ||
        draft.state === "PRE_SELECTING_CHART_TYPE"
      ) {
        draft.state = "SELECTING_CHART_TYPE";
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

        if (draft.state === "SELECTING_CHART_TYPE") {
          deriveFiltersFromFields(draft.chartConfig, dataSetMetadata);
        }
      }
      return draft;

    case "CHART_TYPE_SELECTED":
      draft.state = "CONFIGURING_CHART";
      if (draft.state === "CONFIGURING_CHART") {
        draft.activeField = undefined;
      }
      return draft;

    case "CONTROL_TAB_CHANGED":
      draft.state = "CONFIGURING_CHART";
      if (draft.state === "CONFIGURING_CHART") {
        draft.activeField = action.value;
      }
      return draft;

    case "CHART_CONFIG_CHANGED":
      draft.state = "CONFIGURING_CHART";
      if (draft.state === "CONFIGURING_CHART") {
        setWith(
          draft.chartConfig,
          action.value.path,
          action.value.value,
          Object
        );
      }
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

    case "CHART_CONFIGURED":
      draft.state = "DESCRIBING_CHART";
      return draft;

    case "CHART_ANNOTATION_TAB_CHANGED":
      draft.state = "DESCRIBING_CHART";
      if (draft.state === "DESCRIBING_CHART") {
        draft.activeField = action.value;
      }
      return draft;

    case "CHART_DESCRIPTION_CHANGED":
      draft.state = "DESCRIBING_CHART";
      if (draft.state === "DESCRIBING_CHART") {
        setWith(draft, `meta.${action.value.path}`, action.value.value, Object);
      }
      return draft;

    case "CHART_CONFIG_FILTER_SET_SINGLE":
      draft.state = "CONFIGURING_CHART";
      if (draft.state === "CONFIGURING_CHART") {
        const { dimensionIri, value } = action.value;
        draft.chartConfig.filters[dimensionIri] = { type: "single", value };
      }
      return draft;

    case "CHART_CONFIG_FILTER_SET_MULTI":
      draft.state = "CONFIGURING_CHART";
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

    case "PUBLISH":
      draft.state = "PUBLISHING";
      return draft;

    case "PUBLISH_FAILED":
      // Recover by going back to CONFIGURING_CHART state
      draft.state = "CONFIGURING_CHART";
      return draft;

    case "PUBLISHED":
      draft.state = "PUBLISHED";
      if (draft.state === "PUBLISHED") {
        draft.configKey = action.value;
      }
      return draft;
    default:
      return;
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
          const parsedState = JSON.parse(storedState);
          if (isValidConfiguratorState(parsedState)) {
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

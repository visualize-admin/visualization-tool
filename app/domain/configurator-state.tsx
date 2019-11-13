import {
  useEffect,
  createContext,
  Dispatch,
  useContext,
  ReactNode
} from "react";
import { Reducer, useImmerReducer } from "use-immer";
import setWith from "lodash/setWith";

import {
  isValidConfiguratorState,
  ConfiguratorState,
  ConfiguratorStatePublishing,
  FilterValueMulti,
  Filters,
  FilterValue
} from "./config-types";
import { useRouter } from "next/router";
import { createChartId } from "./chart-id";

export type ConfiguratorStateAction =
  | { type: "INITIALIZED"; value: ConfiguratorState }
  | { type: "DATASET_SELECTED"; value: string }
  | {
      type: "CHART_TYPE_PREVIEWED";
      value: { path: string | string[]; value: $FixMe };
    }
  | {
      type: "CHART_TYPE_SELECTED";
      // value: { path: string | string[]; value: any };
    }
  | {
      type: "CHART_CONFIG_CHANGED";
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

const LOCALSTORAGE_PREFIX = "vizualize-configurator-state";
export const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

const initialState: ConfiguratorState = {
  state: "INITIAL"
};

const emptyState: ConfiguratorState = {
  state: "SELECTING_DATASET",
  dataSet: undefined,
  chartConfig: { chartType: "none", filters: {} }
};

export const getFilterValue = (
  state: ConfiguratorState,
  dimensionIri: string
): FilterValue | undefined => {
  return state.state !== "INITIAL"
    ? state.chartConfig.filters[dimensionIri]
    : undefined;
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
      draft.state = "SELECTING_CHART_TYPE";
      if (draft.state === "SELECTING_CHART_TYPE") {
        draft.dataSet = action.value;
      }
      return draft;

    case "CHART_TYPE_PREVIEWED":
      draft.state = "SELECTING_CHART_TYPE";
      if (draft.state === "SELECTING_CHART_TYPE") {
        setWith(draft, action.value.path, action.value.value, Object);
      }
      return draft;
    case "CHART_TYPE_SELECTED":
      draft.state = "CONFIGURING_CHART";
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

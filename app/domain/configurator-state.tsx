import {
  useEffect,
  createContext,
  Dispatch,
  useContext,
  ReactNode
} from "react";
import { Reducer, useImmerReducer } from "use-immer";
import { Immutable } from "immer";
import set from "lodash/set";

type ChartConfig = any;

export type ConfiguratorState = Immutable<
  | {
      state: "INITIAL";
    }
  | {
      state: "CONFIGURING_CHART";
      dataSet: string | undefined;
      chartType: string | undefined;
      chartConfig: ChartConfig;
    }
  | {
      state: "IN_PROGRESS";
      dataSet: string | undefined;
      chartType: string | undefined;
      chartConfig: ChartConfig;
    }
  | {
      state: "PUBLISHING";
      dataSet: string;
      chartType: string;
      chartConfig: ChartConfig;
    }
  | {
      state: "PUBLISHED";
      dataSet: string;
      chartType: string;
      configKey: string;
      chartConfig: ChartConfig;
    }
>;

export type ConfiguratorStateAction =
  | { type: "INITIALIZED"; value: ConfiguratorState }
  | { type: "DATASET_SELECTED"; value: string }
  | {
      type: "CHART_TYPE_CHANGED";
      value: { path: string | string[]; value: any };
    }
  | {
      type: "CHART_CONFIG_CHANGED";
      value: { path: string | string[]; value: any };
    }
  | { type: "PUBLISH" }
  | { type: "PUBLISH_FAILED" }
  | { type: "PUBLISHED"; value: string };

const LOCALSTORAGE_PREFIX = "vizualize-app-state";
const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

const initialState: ConfiguratorState = {
  state: "INITIAL"
};

const emptyState: ConfiguratorState = {
  state: "IN_PROGRESS",
  dataSet: undefined,
  chartType: undefined,
  chartConfig: { title: {} }
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
      draft.state = "CONFIGURING_CHART";
      if (draft.state === "CONFIGURING_CHART") {
        draft.dataSet = action.value;
      }
      return draft;
    case "CHART_TYPE_CHANGED":
      draft.state = "CONFIGURING_CHART";
      if (draft.state === "CONFIGURING_CHART") {
        set(draft, action.value.path, action.value.value);
      }
      return draft;

    case "CHART_CONFIG_CHANGED":
      draft.state = "CONFIGURING_CHART";
      if (draft.state === "CONFIGURING_CHART") {
        set(draft, action.value.path, action.value.value);
      }
      return draft;
    case "PUBLISH":
      draft.state = "PUBLISHING";
      return draft;
    case "PUBLISH_FAILED":
      // Recover by going back to In-progress state
      draft.state = "IN_PROGRESS";
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

export const ConfiguratorStateProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const stateAndDispatch = useImmerReducer(reducer, initialState);
  return (
    <ConfiguratorStateContext.Provider value={stateAndDispatch}>
      {children}
    </ConfiguratorStateContext.Provider>
  );
};

type ReturnVal = {
  key: string;
};
const save = async (values: any): Promise<ReturnVal> => {
  return fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(values)
  }).then(res => res.json());
};

export const useConfiguratorState = ({ chartId }: { chartId: string }) => {
  const ctx = useContext(ConfiguratorStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need an <ConfiguratorStateProvider> to useConfiguratorState"
    );
  }

  const [state, dispatch] = ctx;

  // Re-initialize state on page load
  useEffect(() => {
    let stateToInitialize = initialState;
    try {
      const storedState = window.localStorage.getItem(
        getLocalStorageKey(chartId)
      );
      if (storedState) {
        // TODO: validate that stored state is actually a valid ConfiguratorState (with io-ts)
        stateToInitialize = JSON.parse(storedState);
      }
    } catch {
    } finally {
      dispatch({ type: "INITIALIZED", value: stateToInitialize });
    }
  }, [dispatch, chartId]);

  useEffect(() => {
    try {
      switch (state.state) {
        case "IN_PROGRESS":
        case "CONFIGURING_CHART":
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
              const result = await save(state.chartConfig);
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
  }, [state, dispatch, chartId]);

  return [state, dispatch] as const;
};

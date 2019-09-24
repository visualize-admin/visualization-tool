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
      state: "IN_PROGRESS";
      dataSet: string | undefined;
      chartType: string | undefined;
      chartConfig: ChartConfig;
    }
  | {
      state: "PUBLISHED";
      dataSet: string;
      chartType: string;
      chartConfig: ChartConfig;
    }
>;

type ConfiguratorStateAction =
  | { type: "INITIALIZED"; value: ConfiguratorState }
  | { type: "DATASET_SELECTED"; value: string }
  | { type: "CHART_TYPE_SELECTED"; value: string }
  | {
      type: "CHART_CONFIG_CHANGED";
      value: { path: string | string[]; value: any };
    }
  | { type: "PUBLISHED" };

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
  chartConfig: {}
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
      draft.state = "IN_PROGRESS";
      if (draft.state === "IN_PROGRESS") {
        draft.dataSet = action.value;
      }
      return draft;
    case "CHART_TYPE_SELECTED":
      draft.state = "IN_PROGRESS";
      if (draft.state === "IN_PROGRESS") {
        draft.chartType = action.value;
      }
      return draft;
    case "CHART_CONFIG_CHANGED":
      draft.state = "IN_PROGRESS";
      if (draft.state === "IN_PROGRESS") {
        set(draft, action.value.path, action.value.value);
      }
      return draft;
    case "PUBLISHED":
      draft.state = "PUBLISHED";
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

  // Store current state in localstorage
  useEffect(() => {
    try {
      if (state.state !== "INITIAL") {
        window.localStorage.setItem(
          getLocalStorageKey(chartId),
          JSON.stringify(state)
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, [state, chartId]);

  return [state, dispatch] as const;
};

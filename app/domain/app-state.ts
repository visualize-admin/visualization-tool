import { useEffect } from "react";
import { Reducer, useImmerReducer } from "use-immer";
import { Immutable } from "immer";

type ChartConfig = any;

type AppState = Immutable<
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

type AppStateAction =
  | { type: "INITIALIZED"; value: AppState }
  | { type: "DATASET_SELECTED"; value: string }
  | { type: "CHART_TYPE_SELECTED"; value: string }
  | { type: "CHART_CONFIG_CHANGED"; value: ChartConfig };

const LOCALSTORAGE_PREFIX = "vizualize-app-state";
const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

const initialState: AppState = {
  state: "INITIAL"
};

const emptyState: AppState = {
  state: "IN_PROGRESS",
  dataSet: undefined,
  chartType: undefined,
  chartConfig: {}
};

const reducer: Reducer<AppState, AppStateAction> = (draft, action) => {
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
    default:
      return;
  }
};

export const useAppState = ({ chartId }: { chartId: string }) => {
  const [state, dispatch] = useImmerReducer(reducer, initialState);

  // Re-initialize state on page load
  useEffect(() => {
    let stateToInitialize = initialState;
    try {
      const storedState = window.localStorage.getItem(
        getLocalStorageKey(chartId)
      );
      if (storedState) {
        // TODO: validate that stored state is actually a valid AppState (with io-ts)
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

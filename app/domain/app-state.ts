import { useEffect } from "react";
import { Reducer, useImmerReducer } from "use-immer";

type AppState =
  | {
      state: "UNINITIALIZED";
      selectedDataSet: undefined;
      selectedChartType: undefined;
    }
  | {
      state: "INITIAL";
      selectedDataSet: undefined;
      selectedChartType: undefined;
    }
  | {
      state: "SELECT_CHART";
      selectedDataSet: string;
      selectedChartType: undefined;
    }
  | {
      state: "CONFIGURE_CHART";
      selectedDataSet: string;
      selectedChartType: string;
    };

type AppStateAction =
  | { type: "INITIALIZE"; value: AppState }
  | { type: "SELECT_DATASET"; value: string }
  | { type: "SELECT_CHART"; value: number };

const LOCALSTORAGE_PREFIX = "vizualize-app-state";

const uninitializedState: AppState = {
  state: "UNINITIALIZED",
  selectedDataSet: undefined,
  selectedChartType: undefined
};

const initialState: AppState = {
  state: "INITIAL",
  selectedDataSet: undefined,
  selectedChartType: undefined
};

const reducer: Reducer<AppState, AppStateAction> = (draft, action) => {
  switch (action.type) {
    case "INITIALIZE":
      // Never restore from an UNINITIALIZED state
      return action.value.state === "UNINITIALIZED"
        ? initialState
        : action.value;
    case "SELECT_DATASET":
      draft.state = "SELECT_CHART";
      if (draft.state === "SELECT_CHART") {
        // FIXME: do this
        draft.selectedDataSet = action.value;
      }
      return draft;
    case "SELECT_CHART":
    default:
      return;
  }
};

export const useAppState = () => {
  const [state, dispatch] = useImmerReducer(reducer, uninitializedState);

  // Re-initialize state on page load
  useEffect(() => {
    let stateToInitialize = initialState;
    try {
      const storedState = window.localStorage.getItem(LOCALSTORAGE_PREFIX);
      if (storedState) {
        // TODO: validate that stored state is actually a valid AppState (with io-ts)
        stateToInitialize = JSON.parse(storedState);
      }
    } catch {
    } finally {
      dispatch({ type: "INITIALIZE", value: stateToInitialize });
    }
  }, [dispatch]);

  // Store current state in localstorage
  useEffect(() => {
    try {
      if (state.state !== "UNINITIALIZED") {
        window.localStorage.setItem(LOCALSTORAGE_PREFIX, JSON.stringify(state));
      }
    } catch (e) {
      console.error(e);
    }
  }, [state]);

  return [state, dispatch] as const;
};

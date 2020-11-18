import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer,
} from "react";

type InteractiveFiltersState =
  | {
      segment: string;
    }
  | {};

type InteractiveFiltersStateAction =
  | {
      type: "ADD_INTERACTIVE_FILTER";
      value: { segment: string };
    }
  | {
      type: "REMOVE_INTERACTIVE_FILTER";
      value: { segment: string };
    };

const INTERACTIVE_FILTERS_INITIAL_STATE: InteractiveFiltersState = {};

// Reducer
const InteractiveFiltersStateReducer = (
  state: InteractiveFiltersState,
  action: InteractiveFiltersStateAction
) => {
  switch (action.type) {
    case "ADD_INTERACTIVE_FILTER":
      return {
        ...state,
        [action.value.segment]: true,
      };
    case "REMOVE_INTERACTIVE_FILTER":
      const draftState = { ...state };

      delete (draftState as InteractiveFiltersState)[
        action.value.segment as keyof InteractiveFiltersState
      ];
      return { ...draftState };

    default:
      throw new Error();
  }
};

// Provider
const InteractiveFiltersStateContext = createContext<
  [InteractiveFiltersState, Dispatch<InteractiveFiltersStateAction>] | undefined
>(undefined);

export const useInteractiveFilters = () => {
  const ctx = useContext(InteractiveFiltersStateContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <InteractiveFiltersProvider /> to useInteractiveFilters()"
    );
  }
  return ctx;
};

// Component
export const InteractiveFiltersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer<
    Reducer<InteractiveFiltersState, InteractiveFiltersStateAction>
  >(InteractiveFiltersStateReducer, INTERACTIVE_FILTERS_INITIAL_STATE);

  return (
    <InteractiveFiltersStateContext.Provider value={[state, dispatch]}>
      {children}
    </InteractiveFiltersStateContext.Provider>
  );
};

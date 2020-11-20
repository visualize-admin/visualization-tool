import { Reducer, useImmerReducer } from "use-immer";
import { createContext, Dispatch, ReactNode, useContext } from "react";

type InteractiveFiltersState = {
  categories: $FixMe; //{}; // { [x: string]: boolean };
  time: { from: Date | undefined; to: Date | undefined };
};

type InteractiveFiltersStateAction =
  | {
      type: "ADD_INTERACTIVE_FILTER";
      value: string;
    }
  | {
      type: "REMOVE_INTERACTIVE_FILTER";
      value: string;
    }
  | {
      type: "ADD_TIME_FILTER";
      value: [Date, Date];
    }
  | {
      type: "RESET_INTERACTIVE_FILTERS";
    };

const INTERACTIVE_FILTERS_INITIAL_STATE: InteractiveFiltersState = {
  categories: {},
  time: { from: undefined, to: undefined },
};

// Reducer
const InteractiveFiltersStateReducer = (
  draft: InteractiveFiltersState,
  action: InteractiveFiltersStateAction
) => {
  switch (action.type) {
    case "ADD_INTERACTIVE_FILTER":
      return {
        ...draft,
        categories: { ...draft.categories, [action.value]: true },
      };
    case "REMOVE_INTERACTIVE_FILTER":
      const { categories } = draft;
      const category = categories[action.value];

      if (category) delete categories[action.value];
      return draft;
    case "ADD_TIME_FILTER":
      return {
        ...draft,
        time: { from: action.value[0], to: action.value[1] },
      };
    case "RESET_INTERACTIVE_FILTERS":
      return {
        ...draft,
        categories: {},
        time: { from: undefined, to: undefined },
      };

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
  const [state, dispatch] = useImmerReducer<
    Reducer<InteractiveFiltersState, InteractiveFiltersStateAction>
  >(InteractiveFiltersStateReducer, INTERACTIVE_FILTERS_INITIAL_STATE);

  return (
    <InteractiveFiltersStateContext.Provider value={[state, dispatch]}>
      {children}
    </InteractiveFiltersStateContext.Provider>
  );
};

import { useImmerReducer } from "use-immer";
import { createContext, Dispatch, ReactNode, useContext } from "react";
import { FilterValueSingle } from "../../configurator";
import { FIELD_VALUE_NONE } from "../../configurator/constants";

export type InteractiveFiltersState = {
  categories: { [x: string]: boolean };
  time: { from: Date | undefined; to: Date | undefined };
  dataFilters: { [x: string]: FilterValueSingle };
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
      value: Date[];
    }
  | {
      type: "RESET_DATA_FILTER";
    }
  | {
      type: "SET_DATA_FILTER";
      value: { [x: string]: FilterValueSingle };
    }
  | {
      type: "UPDATE_DATA_FILTER";
      value: { dimensionIri: string; dimensionValueIri: string };
    }
  | {
      type: "RESET_INTERACTIVE_CATEGORIES";
    };

const INTERACTIVE_FILTERS_INITIAL_STATE: InteractiveFiltersState = {
  categories: {},
  time: { from: undefined, to: undefined },
  dataFilters: {},
};

// Reducer
const InteractiveFiltersStateReducer = (
  draft: InteractiveFiltersState,
  action: InteractiveFiltersStateAction
) => {
  switch (action.type) {
    case "ADD_INTERACTIVE_FILTER":
      draft.categories = { ...draft.categories, [action.value]: true };
      return draft;
    case "REMOVE_INTERACTIVE_FILTER":
      const { categories } = draft;
      if (categories) {
        const category = categories[action.value];
        if (category) delete categories[action.value];
      }
      return draft;
    case "ADD_TIME_FILTER":
      draft.time = { from: action.value[0], to: action.value[1] };
      return draft;
    case "RESET_DATA_FILTER":
      draft.dataFilters = {};
      return draft;
    case "SET_DATA_FILTER":
      draft.dataFilters = action.value;
      return draft;
    case "UPDATE_DATA_FILTER":
      if (action.value.dimensionValueIri === FIELD_VALUE_NONE) {
        delete draft.dataFilters[action.value.dimensionIri];
      } else {
        draft.dataFilters[action.value.dimensionIri] = {
          type: "single",
          value: action.value.dimensionValueIri,
        };
      }

      return draft;

    case "RESET_INTERACTIVE_CATEGORIES":
      draft.categories = {};
      return draft;

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
    InteractiveFiltersState,
    InteractiveFiltersStateAction
    // @ts-ignore
  >(InteractiveFiltersStateReducer, INTERACTIVE_FILTERS_INITIAL_STATE);

  return (
    <InteractiveFiltersStateContext.Provider value={[state, dispatch]}>
      {children}
    </InteractiveFiltersStateContext.Provider>
  );
};

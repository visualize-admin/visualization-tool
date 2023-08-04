import { createContext, Dispatch, ReactNode, useContext } from "react";
import { useImmerReducer } from "use-immer";

import { CalculationType, FilterValueSingle } from "@/configurator";

export type InteractiveFiltersState = {
  categories: {
    [x: string]: boolean;
  };
  timeRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  timeSlider:
    | { type: "interval"; value: Date | undefined }
    | { type: "ordinal"; value: string | undefined };
  dataFilters: {
    [x: string]: FilterValueSingle;
  };
  calculation: {
    type: CalculationType | undefined;
  };
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
      type: "SET_TIME_RANGE_FILTER";
      value: [Date, Date];
    }
  | {
      type: "SET_TIME_SLIDER_FILTER";
      value:
        | {
            type: "interval";
            value: Date | undefined;
          }
        | {
            type: "ordinal";
            value: string | undefined;
          };
    }
  | {
      type: "RESET_TIME_SLIDER_FILTER";
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
      value: {
        dimensionIri: string;
        dimensionValueIri: FilterValueSingle["value"];
      };
    }
  | {
      type: "RESET_INTERACTIVE_CATEGORIES";
    }
  | {
      type: "SET_CALCULATION_TYPE";
      value: CalculationType;
    };

const INTERACTIVE_FILTERS_INITIAL_STATE: InteractiveFiltersState = {
  categories: {},
  timeRange: { from: undefined, to: undefined },
  timeSlider: { type: "interval", value: undefined },
  dataFilters: {},
  calculation: { type: undefined },
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
    case "SET_TIME_RANGE_FILTER":
      draft.timeRange = { from: action.value[0], to: action.value[1] };
      return draft;
    case "SET_TIME_SLIDER_FILTER":
      draft.timeSlider = action.value;
      return draft;
    case "RESET_TIME_SLIDER_FILTER":
      draft.timeSlider.value = undefined;
      return draft;
    case "RESET_DATA_FILTER":
      draft.dataFilters = {};
      return draft;
    case "SET_DATA_FILTER":
      draft.dataFilters = action.value;
      return draft;
    case "UPDATE_DATA_FILTER":
      draft.dataFilters[action.value.dimensionIri] = {
        type: "single",
        value: action.value.dimensionValueIri,
      };

      return draft;
    case "RESET_INTERACTIVE_CATEGORIES":
      draft.categories = {};
      return draft;
    case "SET_CALCULATION_TYPE":
      draft.calculation.type = action.value;
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
  >(InteractiveFiltersStateReducer, INTERACTIVE_FILTERS_INITIAL_STATE);

  return (
    <InteractiveFiltersStateContext.Provider value={[state, dispatch]}>
      {children}
    </InteractiveFiltersStateContext.Provider>
  );
};

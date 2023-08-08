import create from "zustand";

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
    | {
        type: "interval";
        value: Date | undefined;
      }
    | {
        type: "ordinal";
        value: string | undefined;
      };
  dataFilters: {
    [x: string]: FilterValueSingle;
  };
  calculation: {
    type: CalculationType | undefined;
  };
};

export type InteractiveFiltersStateActions = {
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  resetCategories: () => void;
  setTimeRange: (from: Date, to: Date) => void;
  setTimeSlider: (timeSlider: InteractiveFiltersState["timeSlider"]) => void;
  resetTimeSlider: () => void;
  setDataFilters: (dataFilters: InteractiveFiltersState["dataFilters"]) => void;
  updateDataFilter: (
    dimensionIri: string,
    dimensionValueIri: FilterValueSingle["value"]
  ) => void;
  resetDataFilters: () => void;
  setCalculationType: (calculationType: CalculationType) => void;
};

export const useInteractiveFiltersStore = create<
  InteractiveFiltersState & InteractiveFiltersStateActions
>((set) => {
  return {
    categories: {},
    addCategory: (category: string) => {
      return set((state) => {
        return {
          ...state,
          categories: { ...state.categories, [category]: true },
        };
      });
    },
    removeCategory: (category: string) => {
      return set((state) => {
        const { categories } = state;
        delete categories[category];
        return { ...state, categories };
      });
    },
    resetCategories: () => {
      return set((state) => {
        return { ...state, categories: {} };
      });
    },
    timeRange: {
      from: undefined,
      to: undefined,
    },
    setTimeRange: (from: Date, to: Date) => {
      return set((state) => {
        return { ...state, timeRange: { from, to } };
      });
    },
    timeSlider: {
      type: "interval",
      value: undefined,
    },
    setTimeSlider: ({ type, value }: InteractiveFiltersState["timeSlider"]) => {
      return set((state) => {
        return {
          ...state,
          timeSlider: {
            type,
            value,
          } as InteractiveFiltersState["timeSlider"],
        };
      });
    },
    resetTimeSlider: () => {
      return set((state) => {
        return {
          ...state,
          timeSlider: { ...state.timeSlider, value: undefined },
        };
      });
    },
    dataFilters: {},
    setDataFilters: (dataFilters: InteractiveFiltersState["dataFilters"]) => {
      return set((state) => {
        return { ...state, dataFilters };
      });
    },
    updateDataFilter: (
      dimensionIri: string,
      dimensionValueIri: FilterValueSingle["value"]
    ) => {
      return set((state) => {
        return {
          ...state,
          dataFilters: {
            ...state.dataFilters,
            [dimensionIri]: {
              type: "single",
              value: dimensionValueIri,
            },
          },
        };
      });
    },
    resetDataFilters: () => {
      return set((state) => {
        return { ...state, dataFilters: {} };
      });
    },
    calculation: {
      type: undefined,
    },
    setCalculationType: (calculationType: CalculationType) => {
      return set((state) => {
        return {
          ...state,
          calculation: { type: calculationType },
        };
      });
    },
  };
});

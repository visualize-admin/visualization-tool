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
  timeSlider: TimeSlider;
  dataFilters: DataFilters;
  calculation: {
    type: CalculationType | undefined;
  };
};

type DataFilters = {
  [d: string]: FilterValueSingle;
};

type TimeSlider =
  | {
      type: "interval";
      value: Date | undefined;
    }
  | {
      type: "ordinal";
      value: string | undefined;
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
      set((state) => ({
        categories: { ...state.categories, [category]: true },
      }));
    },
    removeCategory: (category: string) => {
      set((state) => {
        delete state.categories[category];
        return { categories: { ...state.categories } };
      });
    },
    resetCategories: () => {
      set({
        categories: {},
      });
    },
    timeRange: {
      from: undefined,
      to: undefined,
    },
    setTimeRange: (from: Date, to: Date) => {
      set({
        timeRange: { from, to },
      });
    },
    timeSlider: {
      type: "interval",
      value: undefined,
    },
    setTimeSlider: ({ type, value }: TimeSlider) => {
      set({
        timeSlider: { type, value } as TimeSlider,
      });
    },
    resetTimeSlider: () => {
      set((state) => ({
        timeSlider: { ...state.timeSlider, value: undefined },
      }));
    },
    dataFilters: {},
    setDataFilters: (dataFilters: DataFilters) => {
      set({ dataFilters });
    },
    updateDataFilter: (
      dimensionIri: string,
      dimensionValueIri: FilterValueSingle["value"]
    ) => {
      set((state) => ({
        dataFilters: {
          ...state.dataFilters,
          [dimensionIri]: {
            type: "single",
            value: dimensionValueIri,
          },
        },
      }));
    },
    resetDataFilters: () => {
      set({ dataFilters: {} });
    },
    calculation: {
      type: undefined,
    },
    setCalculationType: (calculationType: CalculationType) => {
      set({ calculation: { type: calculationType } });
    },
  };
});

import React, { createContext, useContext, useState } from "react";
import create, { StateCreator, StoreApi, UseBoundStore } from "zustand";

import { CalculationType, FilterValueSingle } from "@/configurator";
import {
  ExtractState,
  UseBoundStoreWithSelector,
  createBoundUseStoreWithSelector,
} from "@/stores/utils";

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

export type DataFilters = Record<string, FilterValueSingle>;

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

type State = InteractiveFiltersState & InteractiveFiltersStateActions;

const interactiveFiltersStoreCreator: StateCreator<State> = (set) => {
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
};

const InteractiveFiltersContext = createContext<
  | [UseBoundStore<StoreApi<State>>, UseBoundStoreWithSelector<StoreApi<State>>]
  | undefined
>(undefined);

export const InteractiveFiltersProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const [state] = useState<
    [UseBoundStore<StoreApi<State>>, UseBoundStoreWithSelector<StoreApi<State>>]
  >(() => {
    const store = create(interactiveFiltersStoreCreator);
    return [store, createBoundUseStoreWithSelector(store)];
  });

  return (
    <InteractiveFiltersContext.Provider value={state}>
      {children}
    </InteractiveFiltersContext.Provider>
  );
};

export const useInteractiveFilters = <T extends unknown>(
  selector: (state: ExtractState<StoreApi<State>>) => T
) => {
  const ctx = useContext(InteractiveFiltersContext);

  if (!ctx) {
    throw new Error(
      "useInteractiveFilters must be called inside a InteractiveFiltersContext.Provider!"
    );
  }

  const [, useStore] = ctx;

  return useStore(selector);
};

export const useInteractiveFiltersRaw = () => {
  const ctx = useContext(InteractiveFiltersContext);

  if (!ctx) {
    throw new Error(
      "useInteractiveFiltersRaw must be called inside a InteractiveFiltersContext.Provider!"
    );
  }

  const [store] = ctx;

  return store;
};

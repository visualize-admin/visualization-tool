import groupBy from "lodash/groupBy";
import React, { createContext, useContext, useMemo, useRef } from "react";
import create, { StateCreator, StoreApi, UseBoundStore } from "zustand";

import {
  CalculationType,
  ChartConfig,
  FilterValueSingle,
  InteractiveFiltersConfig,
} from "@/configurator";
import {
  ExtractState,
  UseBoundStoreWithSelector,
  createBoundUseStoreWithSelector,
} from "@/stores/utils";
import { assert } from "@/utils/assert";

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

export type State = InteractiveFiltersState & InteractiveFiltersStateActions;

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

type InteractiveFiltersContextValue = [
  UseBoundStore<StoreApi<State>>["getState"],
  UseBoundStoreWithSelector<StoreApi<State>>,
  StoreApi<State>,
];

type SharedFilters = {
  type: "timeRange" | "dataFilters";
  value?: NonNullable<InteractiveFiltersConfig>["timeRange"];
  iri: string;
}[];
const InteractiveFiltersContext = createContext<
  | {
      stores: Record<ChartConfig["key"], InteractiveFiltersContextValue>;
      sharedFilters: SharedFilters;
    }
  | undefined
>(undefined);

export const getSharedFilters = (
  chartConfigs: ChartConfig[]
): SharedFilters => {
  const allActiveFilters = chartConfigs.flatMap((c) => {
    const interactiveFiltersConfig = c.interactiveFiltersConfig;
    if (!interactiveFiltersConfig) {
      return [];
    }
    const { timeRange, dataFilters, legend } = interactiveFiltersConfig;
    return [
      { type: "timeRange" as const, value: timeRange },
      // ...dataFilters.componentIris.map((ci) => ({
      //   type: "dataFilters" as const,
      //   value: {
      //     ...dataFilters,
      //     componentIri: ci,
      //   },
      // })),
      // { type: "legend" as const, value: legend },
    ].filter((x) => x.value.active);
  });

  const sharedFilters = Object.entries(
    // TODO implement recognizing shared filters across joined by dimensions
    groupBy(allActiveFilters, (x) => `${x.type} - ${x.value.componentIri}`)
  ).filter(([iri, filters]) => filters.length > 1);

  return sharedFilters.map(([iri, filters]) => ({
    iri: filters[0].value.componentIri,
    type: filters[0].type,
    value: (() => {
      const type = filters[0].type;
      switch (type) {
        case "timeRange":
          return filters[0].value;
        // case "legend":
        //   return filters[0].value;
        // case "dataFilters":
        //   return filters[0].value;
        default:
          const _exhaustiveCheck: never = type;
          throw new Error(`Unhandled type: ${_exhaustiveCheck}`);
      }
    })(),
  }));
};

/**
 * Creates and provide all the interactive filters stores for the given chartConfigs.
 */
export const InteractiveFiltersProvider = ({
  children,
  chartConfigs,
}: React.PropsWithChildren<{
  chartConfigs: ChartConfig[];
}>) => {
  const storeRefs = useRef<Record<ChartConfig["key"], StoreApi<State>>>({});

  const sharedFilters = useMemo(() => {
    return getSharedFilters(chartConfigs);
  }, [chartConfigs]);

  const stores = useMemo<
    Record<ChartConfig["key"], InteractiveFiltersContextValue>
  >(() => {
    return Object.fromEntries(
      chartConfigs.map((chartConfig) => {
        const store =
          storeRefs.current[chartConfig.key] ??
          create(interactiveFiltersStoreCreator);
        const ctxValue: InteractiveFiltersContextValue = [
          store.getState,
          createBoundUseStoreWithSelector(store),
          store,
        ];
        return [chartConfig.key, ctxValue];
      })
    );
  }, [chartConfigs]);

  const ctxValue = useMemo(
    () => ({ stores, sharedFilters }),
    [stores, sharedFilters]
  );

  return (
    <InteractiveFiltersContext.Provider value={ctxValue}>
      {children}
    </InteractiveFiltersContext.Provider>
  );
};

/**
 * Provides the chartConfig key to children, so that they know which interactive filters
 * store they should use.
 */
const InteractiveFiltersChartContext = React.createContext<
  ChartConfig["key"] | null
>(null);

export const InteractiveFiltersChartProvider = ({
  chartConfigKey,
  children,
}: React.PropsWithChildren<{ chartConfigKey: ChartConfig["key"] }>) => {
  return (
    <InteractiveFiltersChartContext.Provider value={chartConfigKey}>
      {children}
    </InteractiveFiltersChartContext.Provider>
  );
};

export const useChartInteractiveFilters = <T extends unknown>(
  selector: (state: ExtractState<StoreApi<State>>) => T
) => {
  const ctx = useContext(InteractiveFiltersContext);
  const key = useContext(InteractiveFiltersChartContext);

  assert(
    ctx,
    "useInteractiveFilters must be called inside a InteractiveFiltersContext.Provider!"
  );
  assert(
    key,
    "useInteractiveFilters must be called inside a InteractiveFiltersChartContext.Provider!"
  );

  const [, useStore] = ctx.stores[key];

  return useStore(selector);
};

export const useInteractiveFiltersGetState = () => {
  const ctx = useContext(InteractiveFiltersContext);
  const key = useContext(InteractiveFiltersChartContext);

  assert(
    ctx,
    "useInteractiveFilters must be called inside a InteractiveFiltersContext.Provider!"
  );
  assert(
    key,
    "useInteractiveFilters must be called inside a InteractiveFiltersChartContext.Provider!"
  );

  const [getState] = ctx.stores[key];

  return getState;
};

export const useDashboardInteractiveFilters = () => {
  const ctx = useContext(InteractiveFiltersContext);

  assert(
    ctx,
    "useInteractiveFilters must be called inside a InteractiveFiltersContext.Provider!"
  );

  return ctx;
};

import uniq from "lodash/uniq";
import React, { createContext, useContext, useMemo, useRef } from "react";
import create, { StateCreator, StoreApi, UseBoundStore } from "zustand";

import { getChartSpec } from "@/charts/chart-config-ui-options";
import {
  CalculationType,
  ChartConfig,
  FilterValueSingle,
} from "@/configurator";
import { truthy } from "@/domain/types";
import { getOriginalIds, isJoinById } from "@/graphql/join";
import {
  createBoundUseStoreWithSelector,
  ExtractState,
  UseBoundStoreWithSelector,
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
    dimensionId: string,
    dimensionValue: FilterValueSingle["value"]
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
      dimensionId: string,
      dimensionValue: FilterValueSingle["value"]
    ) => {
      set((state) => ({
        dataFilters: {
          ...state.dataFilters,
          [dimensionId]: {
            type: "single",
            value: dimensionValue,
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

export type InteractiveFiltersStore = StoreApi<State>;
export type InteractiveFiltersContextValue = [
  UseBoundStore<StoreApi<State>>["getState"],
  UseBoundStoreWithSelector<StoreApi<State>>,
  InteractiveFiltersStore,
];

const InteractiveFiltersContext = createContext<
  | {
      potentialTimeRangeFilterIds: string[];
      potentialDataFilterIds: string[];
      stores: Record<ChartConfig["key"], InteractiveFiltersContextValue>;
    }
  | undefined
>(undefined);

const getPotentialTimeRangeFilterIds = (chartConfigs: ChartConfig[]) => {
  const temporalDimensions = chartConfigs.flatMap((config) => {
    const chartSpec = getChartSpec(config);
    const temporalEncodings = chartSpec.encodings.filter((x) =>
      x.componentTypes.some(
        (x) => x === "TemporalDimension" || x === "TemporalEntityDimension"
      )
    );
    const chartTemporalDimensions = temporalEncodings
      .map((encoding) => {
        const field =
          encoding.field in config.fields
            ? // @ts-expect-error ts(7053) - Not possible to narrow down here, but we check for undefined below
              config.fields[encoding.field]
            : undefined;
        if (field && "componentId" in field) {
          return {
            /** Unjoined dimension */
            componentId: isJoinById(field.componentId as string)
              ? getOriginalIds(field.componentId, config)[0]
              : field.componentId,
            chartKey: config.key,
          };
        }
      })
      .filter(truthy);

    return chartTemporalDimensions;
  });

  return temporalDimensions.map((dimension) => dimension.componentId);
};

const getPotentialDataFilterIds = (chartConfigs: ChartConfig[]) => {
  return uniq(
    chartConfigs.flatMap((config) => {
      return config.cubes
        .map((cube) => cube.filters)
        .flatMap((filters) => {
          return Object.entries(filters)
            .filter(([_, filter]) => filter.type === "single")
            .map(([dimensionId]) => dimensionId);
        });
    })
  );
};

/**
 * Creates and provides all the interactive filters stores for the given chartConfigs.
 */
export const InteractiveFiltersProvider = ({
  children,
  chartConfigs,
}: React.PropsWithChildren<{
  chartConfigs: ChartConfig[];
}>) => {
  const storeRefs = useRef<Record<ChartConfig["key"], StoreApi<State>>>({});

  const potentialTimeRangeFilterIds = useMemo(() => {
    return getPotentialTimeRangeFilterIds(chartConfigs);
  }, [chartConfigs]);
  const potentialDataFilterIds = useMemo(() => {
    return getPotentialDataFilterIds(chartConfigs);
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
    () => ({
      potentialTimeRangeFilterIds,
      potentialDataFilterIds,
      stores,
    }),
    [potentialTimeRangeFilterIds, potentialDataFilterIds, stores]
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
    `ctx=${ctx}. useChartInteractiveFilters must be called inside a InteractiveFiltersChartProvider.`
  );
  assert(
    key,
    `key=${key}. useChartInteractiveFilters must be called inside a InteractiveFiltersChartProvider.`
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

export const setDataFilter = (
  store: InteractiveFiltersStore,
  key: string,
  value: string
) => {
  store.setState({
    dataFilters: {
      ...store.getState().dataFilters,
      [key]: { type: "single", value },
    },
  });
};

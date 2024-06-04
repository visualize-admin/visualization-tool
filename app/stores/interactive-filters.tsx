import groupBy from "lodash/groupBy";
import React, { createContext, useContext, useMemo, useRef } from "react";
import create, { StateCreator, StoreApi, UseBoundStore } from "zustand";

import { getChartSpec } from "@/charts/chart-config-ui-options";
import {
  CalculationType,
  ChartConfig,
  FilterValueSingle,
  hasChartConfigs,
  InteractiveFiltersConfig,
  useConfiguratorState,
} from "@/configurator";
import { truthy } from "@/domain/types";
import { getOriginalIris, isJoinById } from "@/graphql/join";
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

export type SharedFilter = {
  type: "timeRange";
} & NonNullable<InteractiveFiltersConfig>["timeRange"];

export type PotentialSharedFilter = Pick<SharedFilter, "type" | "componentIri">;

const InteractiveFiltersContext = createContext<
  | {
      stores: Record<ChartConfig["key"], InteractiveFiltersContextValue>;
      potentialSharedFilters: PotentialSharedFilter[];
      sharedFilters: SharedFilter[];
    }
  | undefined
>(undefined);

/**
 * Returns filters that are shared across multiple charts.
 */
export const getPotentialSharedFilters = (
  chartConfigs: ChartConfig[]
): PotentialSharedFilter[] => {
  const temporalDimensions = chartConfigs.flatMap((config) => {
    const chartSpec = getChartSpec(config);
    const temporalEncodings = chartSpec.encodings.filter((x) =>
      x.componentTypes.some((x) => x === "TemporalDimension")
    );
    const chartTemporalDimensions = temporalEncodings
      .map((encoding) => {
        const field =
          encoding.field in config.fields
            ? // @ts-expect-error ts(7053) - Not possible to narrow down here, but we check for undefined below
              config.fields[encoding.field]
            : undefined;
        if (field && "componentIri" in field) {
          return {
            /** Unjoined dimension */
            componentIri: isJoinById(field.componentIri as string)
              ? getOriginalIris(field.componentIri, config)[0]
              : field.componentIri,
            chartKey: config.key,
          };
        }
      })
      .filter(truthy);

    return chartTemporalDimensions;
  });

  const sharedTemporalDimensions = Object.values(
    groupBy(temporalDimensions, (x) => x.componentIri)
  ).filter((x) => x.length > 1);

  return sharedTemporalDimensions.map((x) => {
    return {
      type: "timeRange",
      componentIri: x[0].componentIri,
    };
  });
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
  const [state] = useConfiguratorState(hasChartConfigs);
  const storeRefs = useRef<Record<ChartConfig["key"], StoreApi<State>>>({});

  const potentialSharedFilters = useMemo(() => {
    return getPotentialSharedFilters(chartConfigs);
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

  const sharedFilters = state.dashboardFilters?.filters;

  const ctxValue = useMemo(
    () => ({
      stores,
      potentialSharedFilters,
      sharedFilters: sharedFilters ?? [],
    }),
    [stores, potentialSharedFilters, sharedFilters]
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

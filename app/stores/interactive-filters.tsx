import isEqual from "lodash/isEqual";
import uniq from "lodash/uniq";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
} from "react";
import create, { StateCreator, StoreApi, UseBoundStore } from "zustand";

import { getChartSpec } from "@/charts/chart-config-ui-options";
import {
  CalculationType,
  ChartConfig,
  FilterValue,
  FilterValueSingle,
} from "@/config-types";
import { canDimensionBeMultiFiltered, Component } from "@/domain/data";
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
  annotations: {
    [x: string]: boolean;
  };
};

export type DataFilters = Record<string, FilterValue>;

type TimeSlider =
  | {
      type: "interval";
      value: Date | undefined;
    }
  | {
      type: "ordinal";
      value: string | undefined;
    };

type InteractiveFiltersStateActions = {
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
  setMultiDataFilter: (dimensionId: string, values: string[]) => void;
  addDataFilterValue: (dimensionId: string, value: string) => void;
  removeDataFilterValue: (dimensionId: string, value: string) => void;
  resetDataFilters: () => void;
  setCalculationType: (calculationType: CalculationType) => void;
  setAnnotations: (annotations: InteractiveFiltersState["annotations"]) => void;
  updateAnnotation: (key: string, show: boolean) => void;
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
    setMultiDataFilter: (dimensionId: string, values: string[]) => {
      set((state) => ({
        dataFilters: {
          ...state.dataFilters,
          [dimensionId]: {
            type: "multi",
            values: Object.fromEntries(values.map((v) => [v, true])),
          },
        },
      }));
    },
    addDataFilterValue: (dimensionId: string, value: string) => {
      set((state) => {
        const currentFilter = state.dataFilters[dimensionId];

        if (currentFilter?.type === "single") {
          return {
            dataFilters: {
              ...state.dataFilters,
              [dimensionId]: {
                type: "multi",
                values: {
                  [currentFilter.value as string]: true,
                  [value]: true,
                },
              },
            },
          };
        }

        if (currentFilter?.type === "multi") {
          return {
            dataFilters: {
              ...state.dataFilters,
              [dimensionId]: {
                type: "multi",
                values: {
                  ...currentFilter.values,
                  [value]: true,
                },
              },
            },
          };
        }

        return {
          dataFilters: {
            ...state.dataFilters,
            [dimensionId]: {
              type: "multi",
              values: { [value]: true },
            },
          },
        };
      });
    },
    removeDataFilterValue: (dimensionId: string, value: string) => {
      set((state) => {
        const currentFilter = state.dataFilters[dimensionId];

        if (currentFilter?.type === "multi") {
          const newValues = { ...currentFilter.values };
          delete newValues[value];

          const remainingValues = Object.keys(newValues);

          if (remainingValues.length === 1) {
            return {
              dataFilters: {
                ...state.dataFilters,
                [dimensionId]: {
                  type: "single",
                  value: remainingValues[0],
                },
              },
            };
          }

          if (remainingValues.length === 0) {
            const newDataFilters = { ...state.dataFilters };
            delete newDataFilters[dimensionId];
            return { dataFilters: newDataFilters };
          }

          return {
            dataFilters: {
              ...state.dataFilters,
              [dimensionId]: {
                type: "multi",
                values: newValues,
              },
            },
          };
        }

        if (currentFilter?.type === "single" && currentFilter.value === value) {
          const newDataFilters = { ...state.dataFilters };
          delete newDataFilters[dimensionId];
          return { dataFilters: newDataFilters };
        }

        return { dataFilters: state.dataFilters };
      });
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
    annotations: {},
    setAnnotations: (annotations: InteractiveFiltersState["annotations"]) => {
      set({ annotations });
    },
    updateAnnotation: (key: string, show: boolean) => {
      set((state) => ({
        annotations: {
          ...state.annotations,
          [key]: show,
        },
      }));
    },
  };
};

type InteractiveFiltersStore = StoreApi<State>;
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
          const candidateIds = isJoinById(field.componentId as string)
            ? getOriginalIds(field.componentId, config)
            : [field.componentId];

          return candidateIds.map((componentId) => ({
            componentId,
            chartKey: config.key,
          }));
        }
      })
      .flat()
      .filter(truthy);

    return chartTemporalDimensions;
  });

  return temporalDimensions.map((dimension) => dimension.componentId);
};

export const getPotentialDataFilterIds = (chartConfigs: ChartConfig[]) => {
  const dimensionIdCounts = new Map<string, number>();

  chartConfigs.forEach((config) => {
    const dimensionIds = uniq(
      config.cubes
        .map((cube) => cube.filters)
        .flatMap((filters) => {
          return Object.entries(filters)
            .filter(
              ([_, filter]) =>
                filter.type === "single" || filter.type === "multi"
            )
            .map(([dimensionId]) => dimensionId)
            .concat(
              config.chartType === "table"
                ? Object.entries(config.fields)
                    .map(([componentId, field]) =>
                      canDimensionBeMultiFiltered({
                        __typename: field.componentType,
                      } as Component)
                        ? componentId
                        : undefined
                    )
                    .filter(truthy)
                : []
            );
        })
    );

    dimensionIds.forEach((dimensionId) => {
      dimensionIdCounts.set(
        dimensionId,
        (dimensionIdCounts.get(dimensionId) ?? 0) + 1
      );
    });
  });

  const sharedDimensionIds = Array.from(dimensionIdCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([dimensionId]) => dimensionId);

  return sharedDimensionIds;
};

/**
 * Creates and provides all the interactive filters stores for the given chartConfigs.
 */
export const InteractiveFiltersProvider = ({
  children,
  chartConfigs,
}: PropsWithChildren<{
  chartConfigs: ChartConfig[];
}>) => {
  const storeRefs = useRef<Record<ChartConfig["key"], StoreApi<State>>>({});
  const boundSelectorRefs = useRef<
    Record<ChartConfig["key"], UseBoundStoreWithSelector<StoreApi<State>>>
  >({});

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

        storeRefs.current[chartConfig.key] = store;

        if (!boundSelectorRefs.current[chartConfig.key]) {
          boundSelectorRefs.current[chartConfig.key] =
            createBoundUseStoreWithSelector(store);
        }

        const ctxValue: InteractiveFiltersContextValue = [
          store.getState,
          boundSelectorRefs.current[chartConfig.key],
          store,
        ];

        return [chartConfig.key, ctxValue];
      })
    );
  }, [chartConfigs]);

  const ctxValueRef = useRef<{
    potentialTimeRangeFilterIds: string[];
    potentialDataFilterIds: string[];
    stores: Record<ChartConfig["key"], InteractiveFiltersContextValue>;
  }>();

  const newCtxValue = {
    potentialTimeRangeFilterIds,
    potentialDataFilterIds,
    stores,
  };

  if (!ctxValueRef.current || !isEqual(ctxValueRef.current, newCtxValue)) {
    ctxValueRef.current = newCtxValue;
  }

  const ctxValue = ctxValueRef.current;

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
const InteractiveFiltersChartContext = createContext<ChartConfig["key"] | null>(
  null
);

export const InteractiveFiltersChartProvider = ({
  chartConfigKey,
  children,
}: PropsWithChildren<{ chartConfigKey: ChartConfig["key"] }>) => {
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

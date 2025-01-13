import {
  Box,
  BoxProps,
  SelectChangeEvent,
  Slider,
  sliderClasses,
  useEventCallback,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import uniq from "lodash/uniq";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  DataFilterGenericDimension,
  DataFilterHierarchyDimension,
  DataFilterTemporalDimension,
} from "@/charts/shared/chart-data-filters";
import { useCombinedTemporalDimension } from "@/charts/shared/use-combined-temporal-dimension";
import {
  ChartConfig,
  DashboardTimeRangeFilter,
  hasChartConfigs,
  InteractiveFiltersTimeRange,
  isLayouting,
  useConfiguratorState,
} from "@/configurator";
import {
  parseDate,
  timeUnitToFormatter,
  timeUnitToParser,
} from "@/configurator/components/ui-helpers";
import { isTemporalDimension } from "@/domain/data";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { TimeUnit } from "@/graphql/query-hooks";
import { useTimeout } from "@/hooks/use-timeout";
import { useLocale } from "@/locales/use-locale";
import {
  setDataFilter,
  useDashboardInteractiveFilters,
} from "@/stores/interactive-filters";
import { useTransitionStore } from "@/stores/transition";
import { assert } from "@/utils/assert";
import useEvent from "@/utils/use-event";

export const DashboardInteractiveFilters = (props: BoxProps) => {
  const { sx, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [state] = useConfiguratorState(hasChartConfigs);
  const layouting = isLayouting(state);
  const { dashboardFilters } = state;
  const { timeRange, dataFilters } = dashboardFilters ?? {
    timeRange: undefined,
    dataFilters: undefined,
  };
  const showTimeRange = !!timeRange?.active;
  const showDataFilters = !!dataFilters?.componentIds.length;

  useEffect(() => {
    if (layouting && (showTimeRange || showDataFilters)) {
      ref.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [layouting, showDataFilters, showTimeRange]);

  return showTimeRange || showDataFilters ? (
    <Box ref={ref} {...rest} sx={{ ...sx, mb: 4 }}>
      {showTimeRange ? (
        <DashboardTimeRangeSlider
          filter={timeRange}
          mounted={timeRange.active}
        />
      ) : null}
      {showDataFilters ? (
        <DashboardDataFilters componentIds={dataFilters.componentIds} />
      ) : null}
    </Box>
  ) : null;
};

const useTimeRangeRangeStyles = makeStyles((theme: Theme) => ({
  slider: {
    maxWidth: `calc(100% - ${theme.spacing(6)})`,
    margin: theme.spacing(6, 4, 2),
    [`& .${sliderClasses.track}`]: {
      height: 1,
    },
    [`& .${sliderClasses.rail}.${sliderClasses.rail}`]: {
      backgroundColor: theme.palette.grey[600],
    },
    [`& .${sliderClasses.valueLabel}`]: {
      padding: theme.spacing(1, 2),
    },
  },
}));

const valueToTimeRange = (value: number[]) => {
  const from = new Date(value[0] * 1000);
  const to = new Date(value[1] * 1000);
  if (!from || !to) {
    return;
  }
  return {
    type: "range",
    from: from,
    to: to,
  };
};

const presetToTimeRange = (
  presets: Pick<InteractiveFiltersTimeRange["presets"], "from" | "to">,
  timeUnit: TimeUnit
) => {
  if (!timeUnit) {
    return;
  }
  const parser = timeUnitToParser[timeUnit];
  return [
    toUnixSeconds(parser(presets.from)),
    toUnixSeconds(parser(presets.to)),
  ];
};

const toUnixSeconds = (x: Date | null) => {
  if (x) {
    return +x / 1000;
  }
  return 0;
};

const DashboardTimeRangeSlider = ({
  filter,
  mounted,
}: {
  filter: DashboardTimeRangeFilter;
  mounted: boolean;
}) => {
  const classes = useTimeRangeRangeStyles();
  const dashboardInteractiveFilters = useDashboardInteractiveFilters();
  const setEnableTransition = useTransitionStore((state) => state.setEnable);
  const presets = filter.presets;
  assert(
    presets,
    "Filter presets should be defined when time range filter is rendered"
  );

  const timeUnit = filter.timeUnit as TimeUnit;
  const [timeRange, setTimeRange] = useState(() =>
    // timeUnit can still be an empty string
    timeUnit ? presetToTimeRange(presets, timeUnit) : undefined
  );

  const valueLabelFormat = useEventCallback((value: number) => {
    if (!timeUnit) {
      return "";
    }
    const date = new Date(value * 1000);
    return timeUnitToFormatter[timeUnit](date);
  });

  const handleChangeSlider = useEventCallback((value: number | number[]) => {
    assert(Array.isArray(value), "Value should be an array of two numbers");
    if (!timeUnit) {
      return;
    }
    const newTimeRange = valueToTimeRange(value);
    if (!newTimeRange) {
      return;
    }
    setEnableTransition(false);
    for (const [_getState, _useStore, store] of Object.values(
      dashboardInteractiveFilters.stores
    )) {
      store.setState({ timeRange: newTimeRange });
      setTimeRange([value[0], value[1]]);
    }
  });

  useEffect(
    function initTimeRangeAfterDataFetch() {
      if (timeRange || !timeUnit) {
        return;
      }
      const parser = timeUnitToParser[timeUnit];
      handleChangeSlider([
        toUnixSeconds(parser(presets.from)),
        toUnixSeconds(parser(presets.to)),
      ]);
    },
    [timeRange, timeUnit, presets, handleChangeSlider]
  );

  useEffect(() => {
    if (presets.from && presets.to && timeUnit) {
      const parser = timeUnitToParser[timeUnit];
      setTimeRange([
        toUnixSeconds(parser(presets.from)),
        toUnixSeconds(parser(presets.to)),
      ]);
    }
  }, [presets.from, presets.to, timeUnit]);

  const mountedForSomeTime = useTimeout(500, mounted);
  const combinedTemporalDimension = useCombinedTemporalDimension();
  const sliderRange = useMemo(() => {
    const { values } = combinedTemporalDimension;
    const min = values[0]?.value;
    const max = values[values.length - 1]?.value;

    if (!min || !max) {
      return;
    }

    return [
      toUnixSeconds(parseDate(min as string)),
      toUnixSeconds(parseDate(max as string)),
    ];
  }, [combinedTemporalDimension]);

  if (!timeRange || !filter.active || !sliderRange) {
    return null;
  }

  return (
    <Slider
      className={classes.slider}
      onChange={(_ev, value) => handleChangeSlider(value)}
      onChangeCommitted={() => setEnableTransition(true)}
      valueLabelFormat={valueLabelFormat}
      step={null}
      min={sliderRange[0]}
      max={sliderRange[1]}
      valueLabelDisplay={mountedForSomeTime ? "on" : "off"}
      value={timeRange}
      marks={combinedTemporalDimension.values.map(({ value }) => ({
        value: toUnixSeconds(parseDate(value as string)),
      }))}
    />
  );
};

const useDataFilterStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: theme.spacing(2),
  },
  filter: {
    display: "flex",
    flex: "1 1 100%",
    width: "100%",
    marginRight: theme.spacing(3),
    "&:last-of-type": {
      marginRight: 0,
    },
    "& > div": {
      width: "100%",
    },
  },
}));

type Stores = ReturnType<typeof useDashboardInteractiveFilters>["stores"];

export const saveDataFiltersSnapshot = (
  chartConfigs: ChartConfig[],
  stores: Stores,
  componentId: string
) => {
  const snapshot = Object.fromEntries(
    Object.entries(stores).map(([key, [_getState, _useStore, store]]) => {
      const state = store.getState();
      const filterValue = state.dataFilters[componentId];
      return [key, filterValue];
    })
  );

  return () => {
    for (const [chartKey, [_getState, _useStore, store]] of Object.entries(
      stores
    )) {
      if (chartConfigs.map((config) => config.key).includes(chartKey)) {
        const dataFilters = store.getState().dataFilters;
        const filterValue = snapshot[chartKey];
        if (filterValue) {
          dataFilters[componentId] = filterValue;
          store.setState({ dataFilters });
        } else {
          delete dataFilters[componentId];
          store.setState({ dataFilters });
        }
      }
    }
  };
};

const DashboardDataFilters = ({ componentIds }: { componentIds: string[] }) => {
  const classes = useDataFilterStyles();
  return (
    <div className={classes.wrapper}>
      {componentIds.map((componentId) => (
        <DataFilter key={componentId} componentId={componentId} />
      ))}
    </div>
  );
};

const DataFilter = ({ componentId }: { componentId: string }) => {
  const locale = useLocale();
  const classes = useDataFilterStyles();
  const [{ chartConfigs, dataSource, dashboardFilters }] =
    useConfiguratorState(hasChartConfigs);
  const dashboardInteractiveFilters = useDashboardInteractiveFilters();
  const relevantChartConfigs = chartConfigs.filter((config) =>
    config.cubes.some((cube) => Object.keys(cube.filters).includes(componentId))
  );
  const cubeIris = uniq(
    chartConfigs.flatMap((config) =>
      config.cubes
        .filter((cube) => Object.keys(cube.filters).includes(componentId))
        .map((cube) => cube.iri)
    )
  );

  if (cubeIris.length > 1) {
    console.error(
      `Data filter ${componentId} is used in multiple cubes: ${cubeIris.join(", ")}`
    );
  }

  const cubeIri = cubeIris[0];

  const [{ data }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: [
        {
          iri: cubeIri,
          componentIds: [componentId],
          loadValues: true,
        },
      ],
    },
    keepPreviousData: true,
  });

  const dimension = data?.dataCubesComponents.dimensions[0];

  const [value, setValue] = useState<string>();
  const handleChange = useEvent(
    (
      e:
        | SelectChangeEvent<unknown>
        | ChangeEvent<HTMLSelectElement>
        | { target: { value: string } }
    ) => {
      const newValue = e.target.value as string;
      setValue(newValue);

      for (const [chartKey, [_getState, _useStore, store]] of Object.entries(
        dashboardInteractiveFilters.stores
      )) {
        if (
          relevantChartConfigs.map((config) => config.key).includes(chartKey)
        ) {
          setDataFilter(store, componentId, newValue);
        }
      }
    }
  );

  // Syncs the interactive filter value with the config value
  useEffect(() => {
    const value = dashboardFilters?.dataFilters.filters[componentId].value as
      | string
      | undefined;
    if (value) {
      handleChange({ target: { value } });
    }
  }, [componentId, handleChange, dashboardFilters?.dataFilters.filters]);

  useEffect(() => {
    const restoreSnapshot = saveDataFiltersSnapshot(
      relevantChartConfigs,
      dashboardInteractiveFilters.stores,
      componentId
    );

    const value = dashboardFilters?.dataFilters.filters[componentId]?.value as
      | string
      | undefined;

    if (value) {
      handleChange({ target: { value } } as ChangeEvent<HTMLSelectElement>);
    } else if (dimension?.values.length) {
      handleChange({
        target: { value: dimension.values[0].value as string },
      } as ChangeEvent<HTMLSelectElement>);
    }

    return () => {
      restoreSnapshot();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension?.values]);
  const disabled = !dimension?.values.length;
  const hierarchy = dimension?.hierarchy;

  return dimension && value ? (
    <div className={classes.filter}>
      {isTemporalDimension(dimension) ? (
        <DataFilterTemporalDimension
          value={value}
          dimension={dimension}
          onChange={handleChange}
          disabled={disabled}
        />
      ) : hierarchy ? (
        <DataFilterHierarchyDimension
          value={value}
          dimension={dimension}
          onChange={handleChange}
          hierarchy={hierarchy}
          disabled={disabled}
        />
      ) : (
        <DataFilterGenericDimension
          value={value}
          dimension={dimension}
          onChange={handleChange}
          disabled={disabled}
        />
      )}
    </div>
  ) : null;
};

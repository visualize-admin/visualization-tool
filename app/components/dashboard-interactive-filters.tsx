import {
  Collapse,
  Slider,
  sliderClasses,
  useEventCallback,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { useEffect, useMemo, useState } from "react";

import {
  hasChartConfigs,
  InteractiveFiltersTimeRange,
  useConfiguratorState,
} from "@/configurator";
import {
  timeUnitToFormatter,
  timeUnitToParser,
} from "@/configurator/components/ui-helpers";
import { canDimensionBeTimeFiltered } from "@/domain/data";
import { useConfigsCubeComponents } from "@/graphql/hooks";
import { TimeUnit } from "@/graphql/query-hooks";
import { useLocale } from "@/src";
import {
  SharedFilter,
  useDashboardInteractiveFilters,
} from "@/stores/interactive-filters";
import { assert } from "@/utils/assert";

import { useTimeout } from "../hooks/use-timeout";

const useStyles = makeStyles((theme: Theme) => ({
  slider: {
    maxWidth: 800,
    margin: theme.spacing(6, 4, 2),

    [`& .${sliderClasses.track}`]: {
      height: 1,
    },
    [`& .${sliderClasses.rail}.${sliderClasses.rail}`]: {
      backgroundColor: theme.palette.grey[600],
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
  presets: InteractiveFiltersTimeRange["presets"],
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
  filter: Extract<SharedFilter, { type: "timeRange" }>;
  mounted: boolean;
}) => {
  const classes = useStyles();

  const dashboardInteractiveFilters = useDashboardInteractiveFilters();

  const [state] = useConfiguratorState(hasChartConfigs);
  const locale = useLocale();

  const [data] = useConfigsCubeComponents({
    variables: {
      state,
      locale,
    },
  });

  const timeUnit = useMemo(() => {
    const dim = data?.data?.dataCubesComponents?.dimensions?.find(
      (d) => d.iri === filter.componentIri
    );
    return canDimensionBeTimeFiltered(dim) ? dim.timeUnit : undefined;
  }, [data?.data?.dataCubesComponents?.dimensions, filter.componentIri]);

  const presets = filter.presets;
  assert(
    presets,
    "Filter presets should be defined when time range filter is rendered"
  );

  // In Unix timestamp
  const [timeRange, setTimeRange] = useState(() =>
    timeUnit ? presetToTimeRange(presets, timeUnit) : undefined
  );

  const { min, max } = useMemo(() => {
    if (!timeUnit || !presets) {
      return { min: 0, max: 0 };
    }
    const parser = timeUnitToParser[timeUnit];
    return {
      min: toUnixSeconds(parser(presets.from)),
      max: toUnixSeconds(parser(presets.to)),
    };
  }, [timeUnit, presets]);

  const step = stepFromTimeUnit(timeUnit);

  const valueLabelFormat = useEventCallback((value: number) => {
    if (!timeUnit) {
      return "";
    }
    const d = new Date(value * 1000);
    return timeUnitToFormatter[timeUnit](d);
  });

  const handleChangeSlider = useEventCallback(
    (componentIri: string, value: number | number[]) => {
      assert(Array.isArray(value), "Value should be an array of two numbers");
      if (!componentIri || !timeUnit) {
        return;
      }
      const newTimeRange = valueToTimeRange(value);
      if (!newTimeRange) {
        return;
      }
      for (const [_getState, _useStore, store] of Object.values(
        dashboardInteractiveFilters.stores
      )) {
        store.setState({ timeRange: newTimeRange });
        setTimeRange([value[0], value[1]]);
      }
    }
  );

  useEffect(
    function initTimeRangeAfterDataFetch() {
      if (timeRange || !timeUnit) {
        return;
      }

      const parser = timeUnitToParser[timeUnit];
      handleChangeSlider(filter.componentIri, [
        toUnixSeconds(parser(presets.from)),
        toUnixSeconds(parser(presets.to)),
      ]);
    },
    [timeRange, timeUnit, presets, handleChangeSlider, filter.componentIri]
  );

  useEffect(() => {
    if (filter.presets.from && filter.presets.to && timeUnit) {
      const parser = timeUnitToParser[timeUnit];
      setTimeRange([
        toUnixSeconds(parser(filter.presets.from)),
        toUnixSeconds(parser(filter.presets.to)),
      ]);
    }
  }, [filter.presets.from, filter.presets.to, timeUnit]);

  const mountedForSomeTime = useTimeout(500, mounted);

  if (!filter || !timeRange || filter.type !== "timeRange" || !filter.active) {
    return null;
  }

  return (
    <Slider
      className={classes.slider}
      key={filter.componentIri}
      onChange={(_ev, value) => handleChangeSlider(filter.componentIri, value)}
      min={min}
      max={max}
      valueLabelFormat={valueLabelFormat}
      step={step}
      valueLabelDisplay={mountedForSomeTime ? "on" : "off"}
      value={timeRange}
      marks={(max - min) / (step ?? 1) < 50}
    />
  );
};

export const DashboardInteractiveFilters = () => {
  const dashboardInteractiveFilters = useDashboardInteractiveFilters();

  return (
    <>
      {dashboardInteractiveFilters.sharedFilters.map((filter) => {
        if (filter.type !== "timeRange" || !filter.active) {
          return null;
        }

        return (
          <Collapse in={filter.active} key={filter.componentIri}>
            <div>
              <DashboardTimeRangeSlider
                filter={filter}
                mounted={filter.active}
              />
            </div>
          </Collapse>
        );
      })}
    </>
  );
};

function stepFromTimeUnit(timeUnit: TimeUnit | undefined) {
  if (!timeUnit) {
    return 0;
  }

  switch (timeUnit) {
    case "Year":
      return 1 * 60 * 60 * 24 * 365;
    case "Month":
      return 1 * 60 * 60 * 24 * 30;
    case "Week":
      return 1 * 60 * 60 * 24 * 7;
    case "Day":
      return 1 * 60 * 60 * 24;
    case "Hour":
      return 1 * 60 * 60;
    case "Minute":
      return 1 * 60;
    case "Second":
      return 1;
  }
}

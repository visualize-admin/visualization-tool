import { Box, Button, sliderClasses, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import orderBy from "lodash/orderBy";
import {
  ChangeEvent,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { ChartState, useChartState } from "@/charts/shared/chart-state";
import { TableChartState } from "@/charts/table/table-state";
import { Slider as GenericSlider } from "@/components/form";
import { AnimationField, Filters, SortingField } from "@/config-types";
import { parseDate } from "@/configurator/components/ui-helpers";
import { hasChartConfigs } from "@/configurator/configurator-state";
import {
  Dimension,
  isTemporalDimension,
  isTemporalEntityDimension,
  isTemporalOrdinalDimension,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { useTimeFormatUnit } from "@/formatters";
import { Icon } from "@/icons";
import { useConfiguratorState } from "@/src";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";
import { Timeline, TimelineProps } from "@/utils/observables";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

const TimelineContext = createContext<Timeline | undefined>(undefined);

const useTimeline = () => {
  const timeline = useContext(TimelineContext);

  if (!timeline) {
    throw Error(
      "useTimeline must be called inside a TimelineContext.Provider!"
    );
  }

  useSyncExternalStore(timeline.subscribe, timeline.getUpdateKey);

  return timeline;
};

type TimeSliderProps = {
  filters: Filters;
  dimensions: Dimension[];
} & AnimationField;

export const TimeSlider = (props: TimeSliderProps) => {
  const {
    componentId,
    showPlayButton,
    type: animationType,
    duration: animationDuration,
    filters,
    dimensions,
  } = props;

  const [state] = useConfiguratorState(hasChartConfigs);
  const dimension = useMemo(() => {
    return dimensions.find((d) => d.id === componentId);
  }, [componentId, dimensions]);
  const temporal = isTemporalDimension(dimension);
  const temporalEntity = isTemporalEntityDimension(dimension);
  const temporalOrdinal = isTemporalOrdinalDimension(dimension);

  if (!(temporal || temporalEntity || temporalOrdinal)) {
    throw Error("You can only use TimeSlider with temporal dimensions!");
  }

  const timeFormatUnit = useTimeFormatUnit();
  const timeUnit = "timeUnit" in dimension ? dimension.timeUnit : undefined;

  // No TimeSlider for tables.
  const chartState = useChartState() as NonNullable<
    Exclude<ChartState, TableChartState>
  >;
  const dimensionFilter = filters[dimension.id];
  const timelineProps: TimelineProps = useMemo(() => {
    const commonProps = {
      animationType,
      msDuration: animationDuration * 1000,
    };
    const uniqueValues = Array.from(
      new Set(
        chartState.allData
          .map((d) => d[dimension.id])
          .filter(truthy) as string[]
      )
    );

    if (temporal) {
      const msValues = uniqueValues.map((d) => parseDate(d).getTime());
      const formatValue = (d: number) => timeFormatUnit(new Date(d), timeUnit!);

      return {
        type: "interval",
        msValues,
        formatValue,
        ...commonProps,
      };
    } else {
      const sorting: NonNullable<SortingField["sorting"]> = {
        sortingType: "byAuto",
        sortingOrder: "asc",
      };
      const sorters = makeDimensionValueSorters(dimension, {
        dimensionFilter,
        sorting,
      });
      const sortingOrders = getSortingOrders(sorters, sorting);
      const sortedData = orderBy(uniqueValues, sorters, sortingOrders);

      return {
        type: "ordinal",
        sortedData,
        ...commonProps,
      };
    }
  }, [
    animationType,
    animationDuration,
    chartState.allData,
    temporal,
    dimension,
    timeFormatUnit,
    timeUnit,
    dimensionFilter,
  ]);

  const timeline = useMemo(() => {
    return new Timeline(timelineProps);
  }, [timelineProps]);

  if (state.dashboardFilters?.timeRange.active) {
    return null;
  }

  return (
    <TimelineContext.Provider value={timeline}>
      <Root showPlayButton={showPlayButton} />
    </TimelineContext.Provider>
  );
};

const Root = ({ showPlayButton }: { showPlayButton: boolean }) => {
  const timeline = useTimeline();
  const [min, max] = timeline.formattedExtent;

  return (
    <Box
      {...DISABLE_SCREENSHOT_ATTR}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        mb: 5,
        mr: 2.5,
      }}
    >
      {showPlayButton && <PlayButton />}
      <div style={{ position: "relative", width: "100%" }}>
        <Slider />
        <Typography
          variant="caption"
          sx={{ position: "absolute", left: 0, mt: 2 }}
        >
          {min}
        </Typography>
        <Typography
          variant="caption"
          sx={{ position: "absolute", right: 0, mt: 2 }}
        >
          {max}
        </Typography>
      </div>
    </Box>
  );
};

const PlayButton = () => {
  const timeline = useTimeline();

  const onClick = useEvent(() => {
    timeline.playing ? timeline.stop() : timeline.start();
  });

  return (
    <Button
      onClick={onClick}
      variant="outlined"
      sx={{
        minHeight: 32,
        minWidth: 32,
        p: 0,
        borderRadius: "50%",
      }}
    >
      <Icon name={timeline.playing ? "pause" : "play"} size={16} />
    </Button>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",

    [`& .${sliderClasses.root}`]: {
      height: "6px",

      [`& .${sliderClasses.thumb}`]: {
        width: "16px",
        height: "16px",
      },
    },
  },

  playing: {
    [`& .${sliderClasses.thumb}`]: {
      transition: "none",
    },

    [`& .${sliderClasses.track}`]: {
      transition: "none",
    },
  },
}));

const Slider = () => {
  const timeline = useTimeline();
  const timeSlider = useChartInteractiveFilters((d) => d.timeSlider);
  const setTimeSlider = useChartInteractiveFilters((d) => d.setTimeSlider);
  const classes = useStyles();

  const marks = useMemo(() => {
    return timeline.domain.map((d) => ({ value: d })) ?? [];
  }, [timeline.domain]);

  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    timeline.setProgress(+e.target.value);
  });

  const onClick = useEvent(() => {
    timeline.stop();
  });

  useEffect(() => {
    if (timeline.type !== timeSlider.type) {
      setTimeSlider({
        type: timeline.type,
        value: undefined,
      });
    }

    if (
      timeline.type === "interval" &&
      timeSlider.type === "interval" &&
      timeSlider.value?.getTime() !== timeline.value
    ) {
      setTimeSlider({
        type: "interval",
        value: new Date(timeline.value),
      });
    }

    if (
      timeline.type === "ordinal" &&
      timeSlider.type === "ordinal" &&
      timeSlider?.value !== timeline.value
    ) {
      setTimeSlider({
        type: "ordinal",
        value: timeline.value as string,
      });
    }
  }, [
    timeline.value,
    timeline.type,
    timeSlider.type,
    timeSlider.value,
    setTimeSlider,
  ]);

  return (
    <GenericSlider
      name="time-slider"
      renderTextInput={false}
      min={0}
      max={1}
      step={null}
      marks={marks}
      value={timeline.progress}
      onChange={onChange}
      onClick={onClick}
      valueLabelDisplay="on"
      valueLabelFormat={timeline.formattedValue}
      className={clsx(classes.root, timeline.playing && classes.playing)}
    />
  );
};

import { Box, Button, Typography } from "@mui/material";
import orderBy from "lodash/orderBy";
import React, { ChangeEvent } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { ChartState, useChartState } from "@/charts/shared/chart-state";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { TableChartState } from "@/charts/table/table-state";
import { Slider as GenericSlider } from "@/components/form";
import { AnimationField, Filters, SortingField } from "@/config-types";
import { parseDate } from "@/configurator/components/ui-helpers";
import { isTemporalDimension, isTemporalOrdinalDimension } from "@/domain/data";
import { useTimeFormatUnit } from "@/formatters";
import { DimensionMetadataFragment, TimeUnit } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { Timeline, TimelineProps } from "@/utils/observables";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";

const TimelineContext = React.createContext<Timeline | undefined>(undefined);

const useTimeline = () => {
  const timeline = React.useContext(TimelineContext);

  if (!timeline) {
    throw new Error(
      "useTimeline must be called inside a TimelineContext.Provider!"
    );
  }

  useSyncExternalStore(timeline.subscribe, timeline.getUpdateKey);

  return timeline;
};

type TimeSliderProps = {
  filters: Filters;
  dimensions: DimensionMetadataFragment[];
} & AnimationField;

export const TimeSlider = (props: TimeSliderProps) => {
  const {
    componentIri,
    showPlayButton,
    type: animationType,
    duration: animationDuration,
    filters,
    dimensions,
  } = props;
  const component = React.useMemo(() => {
    return dimensions.find((d) => d.iri === componentIri);
  }, [componentIri, dimensions]);

  const hasTimeUnit = isTemporalDimension(component);
  if (!(hasTimeUnit || isTemporalOrdinalDimension(component))) {
    throw new Error("You can only use TimeSlider with temporal dimensions!");
  }

  const timeFormatUnit = useTimeFormatUnit();
  const timeUnit = hasTimeUnit ? component.timeUnit ?? TimeUnit.Day : undefined;

  // No TimeSlider for tables.
  const chartState = useChartState() as NonNullable<
    Exclude<ChartState, TableChartState>
  >;

  const componentFilter = filters[component.iri];

  const timelineProps: TimelineProps = React.useMemo(() => {
    const commonProps = {
      animationType,
      msDuration: animationDuration * 1000,
    };
    const uniqueValues = Array.from(
      new Set(
        chartState.allData
          .map((d) => d[component.iri])
          .filter(Boolean) as string[]
      )
    );

    if (hasTimeUnit) {
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
      const sorters = makeDimensionValueSorters(component, {
        dimensionFilter: componentFilter,
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
    hasTimeUnit,
    animationType,
    animationDuration,
    chartState.allData,
    component,
    timeFormatUnit,
    timeUnit,
    componentFilter,
  ]);

  const timeline = React.useMemo(() => {
    return new Timeline(timelineProps);
  }, [timelineProps]);

  return (
    <TimelineContext.Provider value={timeline}>
      <Root showPlayButton={showPlayButton} />
    </TimelineContext.Provider>
  );
};

const Root = ({ showPlayButton }: { showPlayButton: boolean }) => {
  const timeline = useTimeline();
  const chartState = useChartState();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        mb: 5,
        mr: `${chartState.bounds.margins.right}px`,
      }}
    >
      {showPlayButton && <PlayButton />}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          ml: `${showPlayButton ? 0 : 32}px`,
        }}
      >
        <Slider />
        <Typography variant="caption" sx={{ position: "absolute", left: 0 }}>
          {timeline.formattedExtent[0]}
        </Typography>
        <Typography variant="caption" sx={{ position: "absolute", right: 0 }}>
          {timeline.formattedExtent[1]}
        </Typography>
      </Box>
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
      sx={{
        display: "flex",
        justifyContent: "center",
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

const Slider = () => {
  const timeline = useTimeline();
  const [IFState, dispatch] = useInteractiveFilters();

  const marks = React.useMemo(() => {
    return timeline.domain.map((d) => ({ value: d })) ?? [];
  }, [timeline.domain]);

  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    timeline.setProgress(+e.target.value);
  });

  const onClick = useEvent(() => {
    timeline.stop();
  });

  React.useEffect(() => {
    if (timeline.type !== IFState.timeSlider.type) {
      dispatch({
        type: "SET_TIME_SLIDER_FILTER",
        value: {
          type: timeline.type,
          value: undefined,
        },
      });
    }

    if (
      timeline.type === "interval" &&
      IFState.timeSlider.type === "interval" &&
      IFState.timeSlider.value?.getTime() !== timeline.value
    ) {
      dispatch({
        type: "SET_TIME_SLIDER_FILTER",
        value: {
          type: "interval",
          value: new Date(timeline.value),
        },
      });
    }

    if (
      timeline.type === "ordinal" &&
      IFState.timeSlider.type === "ordinal" &&
      IFState.timeSlider?.value !== timeline.value
    ) {
      dispatch({
        type: "SET_TIME_SLIDER_FILTER",
        value: {
          type: "ordinal",
          value: timeline.value as string,
        },
      });
    }
  }, [
    timeline.value,
    timeline.type,
    IFState.timeSlider.type,
    IFState.timeSlider.value,
    dispatch,
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
      sx={{
        width: "100%",

        "& .MuiSlider-root": {
          height: "6px",

          "& .MuiSlider-thumb": {
            width: "16px",
            height: "16px",
            // Disable transitions when playing, otherwise it appears to be laggy.
            ...(timeline.playing && {
              transition: "none",
            }),
          },

          ...(timeline.playing && {
            "& .MuiSlider-track": {
              transition: "none",
            },
          }),
        },
      }}
    />
  );
};

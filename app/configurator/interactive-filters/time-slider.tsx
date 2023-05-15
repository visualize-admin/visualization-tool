import { Box, Button, Typography } from "@mui/material";
import React, { ChangeEvent } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { ChartState, useChartState } from "@/charts/shared/use-chart-state";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { TableChartState } from "@/charts/table/table-state";
import { Slider as GenericSlider } from "@/components/form";
import { parseDate } from "@/configurator/components/ui-helpers";
import { AnimationType } from "@/configurator/config-types";
import { useTimeFormatUnit } from "@/formatters";
import { DimensionMetadataFragment, TimeUnit } from "@/graphql/query-hooks";
import { TemporalDimension } from "@/graphql/resolver-types";
import { Icon } from "@/icons";
import { Timeline } from "@/utils/observables";
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

export const TimeSlider = ({
  componentIri,
  dimensions,
  showPlayButton,
  animationDuration,
  animationType,
}: {
  componentIri?: string;
  dimensions: DimensionMetadataFragment[];
  showPlayButton: boolean;
  /** Animation duration in seconds. */
  animationDuration: number;
  animationType: AnimationType;
}) => {
  const component = React.useMemo(() => {
    return dimensions.find((d) => d.iri === componentIri) as
      | TemporalDimension
      | undefined;
  }, [componentIri, dimensions]);

  const timeFormatUnit = useTimeFormatUnit();
  const timeUnit = component?.timeUnit ?? TimeUnit.Day;
  const formatDate = React.useCallback(
    (d: number) => {
      return timeFormatUnit(new Date(d), timeUnit);
    },
    [timeFormatUnit, timeUnit]
  );
  // No TimeSlider for tables.
  const chartState = useChartState() as NonNullable<
    Exclude<ChartState, TableChartState>
  >;

  const timelineData: number[] = React.useMemo(() => {
    // FIXME: enable interactive filters for maps!
    if (component && chartState.chartType !== "map") {
      const uniqueValues = [
        ...new Set(
          chartState.allData.map((d) => d[component.iri]).filter(Boolean)
        ),
      ] as string[];

      return uniqueValues.map((d) => parseDate(d).getTime());
    }

    return [];
  }, [
    chartState.chartType,
    // @ts-ignore - allData is not yet there for the maps
    chartState.allData,
    component,
  ]);

  const timeline = React.useMemo(() => {
    return new Timeline({
      type: animationType,
      msDuration: animationDuration * 1000,
      msValues: timelineData,
      formatMsValue: formatDate,
    });
  }, [animationType, animationDuration, timelineData, formatDate]);

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
    // Dispatch time slider update event when progress changes.
    if (IFState.timeSlider.value?.getTime() !== timeline.value) {
      dispatch({
        type: "SET_TIME_SLIDER_FILTER",
        value: new Date(timeline.value),
      });
    }
  }, [timeline.value, IFState.timeSlider.value, dispatch]);

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

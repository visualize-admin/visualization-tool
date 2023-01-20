import { Box, Button, Typography } from "@mui/material";
import React, { ChangeEvent } from "react";

import { ChartState, useChartState } from "@/charts/shared/use-chart-state";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { TableChartState } from "@/charts/table/table-state";
import { Slider as GenericSlider } from "@/components/form";
import { parseDate } from "@/configurator/components/ui-helpers";
import { useTimeFormatUnit } from "@/formatters";
import { DimensionMetadataFragment, TimeUnit } from "@/graphql/query-hooks";
import { TemporalDimension } from "@/graphql/resolver-types";
import { Icon } from "@/icons";
import { Timeline } from "@/utils/observables";
import useEvent from "@/utils/use-event";

const TimelineContext = React.createContext<Timeline | undefined>(undefined);

const useTimeline = () => {
  // This is a "hack" to force re-rendering of the component using the hook.
  const [_, setS] = React.useState(0);
  const timeline = React.useContext(TimelineContext);

  React.useEffect(() => {
    const callback = () => setS((s) => s + 1);
    timeline?.subscribe(callback);

    return () => timeline?.unsubscribe(callback);
  }, [timeline]);

  return timeline;
};

export const TimeSlider = ({
  componentIri,
  dimensions,
}: {
  componentIri?: string;
  dimensions: DimensionMetadataFragment[];
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
    return new Timeline(timelineData, formatDate);
  }, [timelineData, formatDate]);

  return (
    <TimelineContext.Provider value={timeline}>
      <Root />
    </TimelineContext.Provider>
  );
};

const Root = () => {
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
      <PlayButton />
      <Box sx={{ position: "relative", width: "100%" }}>
        <Slider />
        <Typography variant="caption" sx={{ position: "absolute", left: 0 }}>
          {timeline?.formattedExtent[0]}
        </Typography>
        <Typography variant="caption" sx={{ position: "absolute", right: 0 }}>
          {timeline?.formattedExtent[1]}
        </Typography>
      </Box>
    </Box>
  );
};

const PlayButton = () => {
  const timeline = useTimeline();

  const onClick = useEvent(() => {
    timeline?.playing ? timeline.stop() : timeline?.start();
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
      <Icon name={timeline?.playing ? "pause" : "play"} size={16} />
    </Button>
  );
};

const Slider = () => {
  const timeline = useTimeline();
  const [IFState, dispatch] = useInteractiveFilters();

  const marks = React.useMemo(() => {
    return timeline?.domain.map((d) => ({ value: d })) ?? [];
  }, [timeline?.domain]);

  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    timeline?.setProgress(+e.target.value);
  });

  const onClick = useEvent(() => {
    timeline?.stop();
  });

  React.useEffect(() => {
    // Dispatch time slider update event when progress changes.
    if (
      timeline?.value !== undefined &&
      IFState.timeSlider.value?.getTime() !== timeline.value
    ) {
      dispatch({
        type: "SET_TIME_SLIDER_FILTER",
        value: new Date(timeline.value),
      });
    }
  }, [timeline?.value, IFState.timeSlider.value, dispatch]);

  return (
    <GenericSlider
      name="time-slider"
      renderTextInput={false}
      min={0}
      max={1}
      step={null}
      marks={marks}
      value={timeline?.progress ?? 0}
      onChange={onChange}
      onClick={onClick}
      valueLabelDisplay="on"
      valueLabelFormat={timeline?.formattedValue}
      sx={{
        width: "100%",

        "& .MuiSlider-root": {
          height: "6px",

          "& .MuiSlider-thumb": {
            width: "16px",
            height: "16px",
            // Disable transitions when playing, otherwise it appears to be laggy.
            ...(timeline?.playing && {
              transition: "none",
            }),
          },

          ...(timeline?.playing && {
            "& .MuiSlider-track": {
              transition: "none",
            },
          }),
        },
      }}
    />
  );
};

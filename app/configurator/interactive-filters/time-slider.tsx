import { Mark } from "@mui/base";
import { Box, Button, Typography } from "@mui/material";
import { ascending, bisect, scaleLinear } from "d3";
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

type SliderDatum = {
  ms: number;
  formattedDate: string;
};

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
  const timeline = React.useMemo(() => new Timeline(), []);

  return (
    <TimelineContext.Provider value={timeline}>
      <Root component={component} />
    </TimelineContext.Provider>
  );
};

const Root = ({ component }: { component?: TemporalDimension }) => {
  const formatDate = useTimeFormatUnit();
  const timeUnit = component?.timeUnit ?? TimeUnit.Day;
  // No TimeSlider for tables.
  const chartState = useChartState() as NonNullable<
    Exclude<ChartState, TableChartState>
  >;

  const sliderData: SliderDatum[] = React.useMemo(() => {
    // FIXME: enable interactive filters for maps!
    if (component && chartState.chartType !== "map") {
      const uniqueValues = [
        ...new Set(
          chartState.allData.map((d) => d[component.iri]).filter(Boolean)
        ),
      ] as string[];

      return uniqueValues
        .map((d) => {
          const date = parseDate(d);

          return {
            ms: date.getTime(),
            formattedDate: formatDate(date, timeUnit),
          };
        })
        .sort((a, b) => ascending(a.ms, b.ms));
    }

    return [];
  }, [
    chartState.chartType,
    // @ts-ignore - allData is not yet there for the maps
    chartState.allData,
    component,
    formatDate,
    timeUnit,
  ]);

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
        <Slider data={sliderData} />
        <Typography variant="caption" sx={{ position: "absolute", left: 0 }}>
          {sliderData[0].formattedDate}
        </Typography>
        <Typography variant="caption" sx={{ position: "absolute", right: 0 }}>
          {sliderData[sliderData.length - 1].formattedDate}
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

/** Slider component.
 *
 * @param data - Data to be used for the slider. Must be sorted by ms!
 */
const Slider = ({ data }: { data: SliderDatum[] }) => {
  const timeline = useTimeline();
  const [IFState, dispatch] = useInteractiveFilters();

  const { sortedMs, msScale, marks } = React.useMemo(() => {
    const sortedMs = data.map((d) => d.ms);
    const msScale = scaleLinear();

    if (sortedMs.length) {
      const [min, max] = [sortedMs[0], sortedMs[sortedMs.length - 1]];
      msScale.range([min, max]);
    }

    const marks: Mark[] = data.map((d) => ({
      value: msScale.invert(d.ms),
    }));

    return { sortedMs, msScale, marks };
  }, [data]);

  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    timeline?.setProgress(+e.target.value);
  });

  const onClick = useEvent(() => {
    timeline?.stop();
  });

  const currentValue = React.useMemo(() => {
    const tMs = Math.round(msScale(timeline?.progress ?? 0));
    const i = bisect(sortedMs, tMs);

    return data[i - 1];
  }, [msScale, timeline?.progress, data, sortedMs]);

  React.useEffect(() => {
    // Dispatch time slider update event when progress changes.
    if (IFState.timeSlider.value?.getTime() !== currentValue.ms) {
      dispatch({
        type: "SET_TIME_SLIDER_FILTER",
        value: new Date(currentValue.ms),
      });
    }
  }, [IFState.timeSlider.value, currentValue, dispatch]);

  return (
    <GenericSlider
      name="time-slider"
      renderTextInput={false}
      min={0}
      max={1}
      // TODO: base on ANIMATION_DURATION?
      step={0.0001}
      marks={marks}
      value={timeline?.progress ?? 0}
      onChange={onChange}
      onClick={onClick}
      valueLabelDisplay="on"
      valueLabelFormat={currentValue?.formattedDate}
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

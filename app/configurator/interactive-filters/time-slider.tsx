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
import useEvent from "@/utils/use-event";

// TODO: make this configurable
const ANIMATION_DURATION = 10000;

type TimeSliderState = {
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  animating: boolean;
  setAnimating: React.Dispatch<React.SetStateAction<boolean>>;
};

const TimeSliderStateContext = React.createContext<TimeSliderState>({
  progress: 0,
  setProgress: () => {},
  animating: false,
  setAnimating: () => {},
});

const useTimeSliderState = () => {
  const ctx = React.useContext(TimeSliderStateContext);

  if (!ctx) {
    throw new Error(
      "You need to wrap your component in <TimeSliderStateProvider /> to useTimeSliderContext()"
    );
  }

  return ctx;
};

export const TimeSliderStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [progress, setProgress] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);

  return (
    <TimeSliderStateContext.Provider
      value={{ progress, setProgress, animating, setAnimating }}
    >
      {children}
    </TimeSliderStateContext.Provider>
  );
};

export const TimeSlider = ({
  componentIri,
  dimensions,
}: {
  componentIri?: string;
  dimensions: DimensionMetadataFragment[];
}) => {
  const component = React.useMemo(() => {
    return dimensions.find((d) => d.iri === componentIri);
  }, [componentIri, dimensions]) as TemporalDimension | undefined;

  return (
    <TimeSliderStateProvider>
      <Root component={component} />
    </TimeSliderStateProvider>
  );
};

const Root = ({ component }: { component?: TemporalDimension }) => {
  const formatDate = useTimeFormatUnit();
  const timeUnit = component?.timeUnit ?? TimeUnit.Day;

  const chartState = useChartState() as NonNullable<
    Exclude<ChartState, TableChartState>
  >;

  const sortedData = React.useMemo(() => {
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

  const { progress, setProgress, animating, setAnimating } =
    useTimeSliderState();
  // Keeping track of requestAnimationFrame to be able to cancel it.
  const requestRef = React.useRef<number>();
  // Keeping track of the start time to be able to calculate the current progress.
  const startTimestampRef = React.useRef<number>();
  // Animation can start from a specific progress.
  const startProgressRef = React.useRef<number>();

  const animate = React.useCallback(
    (timestamp: number) => {
      if (!startTimestampRef.current) {
        if (startProgressRef.current) {
          startTimestampRef.current =
            timestamp - startProgressRef.current * ANIMATION_DURATION;
        } else {
          startTimestampRef.current = timestamp;
        }
      }

      if (timestamp - startTimestampRef.current > ANIMATION_DURATION) {
        setProgress(1);
        setAnimating(false);
      } else {
        const progress =
          (timestamp - startTimestampRef.current) / ANIMATION_DURATION;
        setProgress(progress);

        requestRef.current = requestAnimationFrame(animate);
      }
    },
    [setProgress, setAnimating]
  );

  React.useEffect(() => {
    if (animating) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      startTimestampRef.current = undefined;
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animating, animate]);

  React.useEffect(() => {
    if (animating) {
      startProgressRef.current = progress;
    } else {
      startProgressRef.current = undefined;
    }
  }, [animating, progress]);

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
        <Slider sortedData={sortedData} />
        <Typography variant="caption" sx={{ position: "absolute", left: 0 }}>
          {sortedData[0].formattedDate}
        </Typography>
        <Typography variant="caption" sx={{ position: "absolute", right: 0 }}>
          {sortedData[sortedData.length - 1].formattedDate}
        </Typography>
      </Box>
    </Box>
  );
};

const PlayButton = () => {
  const { progress, setProgress, animating, setAnimating } =
    useTimeSliderState();

  const onClick = useEvent(() => {
    setAnimating(!animating);

    if (progress === 1) {
      setProgress(0);
    }
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
      <Icon name={animating ? "pause" : "play"} size={16} />
    </Button>
  );
};

const Slider = ({
  sortedData,
}: {
  sortedData: { ms: number; formattedDate: string }[];
}) => {
  const { progress, setProgress, animating, setAnimating } =
    useTimeSliderState();
  const [IFState, dispatch] = useInteractiveFilters();

  const { sortedMiliseconds, msScale, marks } = React.useMemo(() => {
    const sortedMiliseconds = sortedData.map((d) => d.ms);
    const msScale = scaleLinear();

    if (sortedMiliseconds.length) {
      const [min, max] = [
        sortedMiliseconds[0],
        sortedMiliseconds[sortedMiliseconds.length - 1],
      ];

      msScale.range([min, max]);
    }

    const marks: Mark[] = sortedData.map((d) => ({
      value: msScale.invert(d.ms),
    }));

    return { sortedMiliseconds, msScale, marks };
  }, [sortedData]);

  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    setProgress(+e.target.value);
  });

  const onClick = useEvent(() => {
    setAnimating(false);
  });

  // Reset the slider when the data changes.
  React.useEffect(() => {
    setProgress(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedData]);

  const currentValue = React.useMemo(() => {
    if (msScale) {
      const tMs = Math.round(msScale(progress));
      const i = bisect(sortedMiliseconds, tMs);
      const updateDatum = sortedData[i - 1];

      return updateDatum;
    }
  }, [msScale, progress, sortedData, sortedMiliseconds]);

  React.useEffect(() => {
    if (currentValue) {
      // Dispatch time slider update event when progress changes.
      if (IFState.timeSlider.value?.getTime() !== currentValue.ms) {
        dispatch({
          type: "SET_TIME_SLIDER_FILTER",
          value: new Date(currentValue.ms),
        });
      }
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
      value={progress}
      // @ts-ignore
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
            // Disable transitions when animating, otherwise it appears to be laggy.
            ...(animating && {
              transition: "none",
            }),
          },

          ...(animating && {
            "& .MuiSlider-track": {
              transition: "none",
            },
          }),
        },
      }}
    />
  );
};

import { Box, Button } from "@mui/material";
import { bisect, scaleLinear } from "d3";
import React, { ChangeEvent } from "react";

import { ChartState, useChartState } from "@/charts/shared/use-chart-state";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { TableChartState } from "@/charts/table/table-state";
import { Slider as GenericSlider } from "@/components/form";
import { parseDate } from "@/configurator/components/ui-helpers";
import { Icon } from "@/icons";
import useEvent from "@/utils/use-event";

// TODO: make this configurable
const ANIMATION_DURATION = 4000;

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

export const TimeSlider = ({ componentIri }: { componentIri?: string }) => {
  return (
    <TimeSliderStateProvider>
      <Root componentIri={componentIri} />
    </TimeSliderStateProvider>
  );
};

const Root = ({ componentIri }: { componentIri?: string }) => {
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 5 }}>
      <PlayButton />
      <Slider componentIri={componentIri} />
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

const Slider = ({ componentIri }: { componentIri?: string }) => {
  const { progress, setProgress, animating, setAnimating } =
    useTimeSliderState();
  const [IFState, dispatch] = useInteractiveFilters();
  const chartState = useChartState() as NonNullable<
    Exclude<ChartState, TableChartState>
  >;

  const sortedMs = React.useMemo(() => {
    // FIXME: enable interactive filters for maps!
    if (componentIri && chartState.chartType !== "map") {
      const uniqueValues = [
        ...new Set(
          chartState.allData.map((d) => d[componentIri]).filter(Boolean)
        ),
      ] as string[];

      return uniqueValues.map((d) => parseDate(d).getTime()).sort();
    }

    return [];
    // @ts-ignore - allData is not yet there for the maps
  }, [chartState.chartType, chartState.allData, componentIri]);

  const msScale = React.useMemo(() => {
    if (sortedMs.length) {
      const [min, max] = [sortedMs[0], sortedMs[sortedMs.length - 1]];
      return scaleLinear().range([min, max]);
    }
  }, [sortedMs]);

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
  }, [sortedMs]);

  // Dispatch time slider update event when progress changes.
  React.useEffect(() => {
    if (msScale) {
      const tMs = Math.round(msScale(progress));
      const i = bisect(sortedMs, tMs);
      const updateMs = sortedMs[i - 1];

      if (IFState.timeSlider.value?.getTime() !== updateMs) {
        dispatch({
          type: "SET_TIME_SLIDER_FILTER",
          value: new Date(updateMs),
        });
      }
    }
  }, [IFState.timeSlider.value, msScale, progress, sortedMs, dispatch]);

  return (
    <GenericSlider
      name="time-slider"
      min={0}
      max={1}
      // TODO: base on ANIMATION_DURATION?
      step={0.0001}
      value={progress}
      onChange={onChange}
      onClick={onClick}
      sx={{
        width: "100%",

        // Disable transitions when animating, otherwise it appears to be laggy.
        ...(animating && {
          "& .MuiSlider-thumb": {
            transition: "none",
          },
          "& .MuiSlider-track": {
            transition: "none",
          },
        }),
      }}
    />
  );
};

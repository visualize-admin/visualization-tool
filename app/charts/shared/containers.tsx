import { Box, BoxProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { select } from "d3-selection";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { useChartState } from "@/charts/shared/chart-state";
import { CalculationToggle } from "@/charts/shared/interactive-filter-calculation-toggle";
import { useInteraction } from "@/charts/shared/use-interaction";
import { useObserverRef } from "@/charts/shared/use-size";
import { getChartConfig } from "@/config-utils";
import {
  hasChartConfigs,
  isLayoutingFreeCanvas,
  useConfiguratorState,
} from "@/configurator";
import { useTransitionStore } from "@/stores/transition";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

export const useStyles = makeStyles<{}, {}, "chartContainer">(() => ({
  chartContainer: {
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flexGrow: 1,
  },
}));

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const [state] = useConfiguratorState(hasChartConfigs);
  const chartConfig = getChartConfig(state);
  const isFreeCanvas = isLayoutingFreeCanvas(state);
  const ref = useObserverRef();
  const { bounds } = useChartState();
  const classes = useStyles();
  const outerRef = useScroll();

  return (
    <div ref={outerRef}>
      <div
        // Re-mount to prevent issues with useSize hook when switching between
        // chart types (that might have different sizes).
        key={chartConfig.chartType}
        ref={ref}
        aria-hidden="true"
        className={classes.chartContainer}
        style={{
          height: isFreeCanvas ? "initial" : bounds.height,
          overflow: "scroll",
        }}
      >
        {children}
      </div>
    </div>
  );
};

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value; // Update the ref with the current value after the render
  }, [value]);

  return ref.current; // Return the previous value
}

const useScroll = () => {
  const [, dispatch] = useInteraction();
  const [state, setState] = useState([0, 0]);
  const prev = usePrevious(state);
  const handleRef = useCallback((node: HTMLDivElement) => {
    if (!node) {
      return;
    }
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setState([target.scrollLeft, target.scrollTop]);
    };
    node?.addEventListener("scroll", handleScroll, { capture: true });
  }, []);
  //FIXME: hack to make the state flick between locked and unlocked when scrolling which in turn
  // makes the tooltip render where it's supposed to.
  useEffect(() => {
    if (prev?.[0] !== state[0] || prev?.[1] !== state[1]) {
      dispatch({ type: "INTERACTION_LOCK" });
    } else {
      dispatch({ type: "INTERACTION_UNLOCK" });
    }
  }, [prev, state, dispatch]);
  return handleRef;
};

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const ref = useRef<SVGSVGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const chartState = useChartState();
  const { bounds, interactiveFiltersConfig } = chartState;

  const { width, margins, chartHeight } = bounds;

  useEffect(() => {
    if (ref.current) {
      // Initialize height on mount.
      if (!ref.current.getAttribute("height")) {
        ref.current.setAttribute(
          "height",
          `${chartHeight + margins.bottom + margins.top}`
        );
      }

      const sel = select(ref.current);
      (enableTransition
        ? sel.transition().duration(transitionDuration)
        : sel
      ).attr("height", `${chartHeight + margins.bottom + margins.top}`);
    }
  }, [
    chartHeight,
    margins.bottom,
    margins.top,
    enableTransition,
    transitionDuration,
  ]);

  return (
    <svg
      ref={ref}
      width={width}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {interactiveFiltersConfig?.calculation.active && (
        <foreignObject
          {...DISABLE_SCREENSHOT_ATTR}
          width={width - margins.right}
          y={0}
          height="26"
          style={{ display: "flex", textAlign: "right" }}
        >
          <CalculationToggle />
        </foreignObject>
      )}
      {children}
    </svg>
  );
};

export const ChartControlsContainer = (props: BoxProps) => {
  const { sx, ...rest } = props;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        mt: 2,
        mb: 4,
        ...sx,
      }}
      {...rest}
    />
  );
};

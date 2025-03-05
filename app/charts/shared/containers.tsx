import { Box, BoxProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { select } from "d3-selection";
import { ReactNode, useEffect, useRef } from "react";

import { useChartState } from "@/charts/shared/chart-state";
import { CalculationToggle } from "@/charts/shared/interactive-filter-calculation-toggle";
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

  return (
    <div
      // Re-mount to prevent issues with useSize hook when switching between
      // chart types (that might have different sizes).
      key={chartConfig.chartType}
      ref={ref}
      aria-hidden="true"
      className={classes.chartContainer}
      style={{
        height: isFreeCanvas ? "initial" : bounds.height,
        overflow: "auto",
      }}
    >
      {children}
    </div>
  );
};

export const CHART_SVG_ID = "chart-svg";

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
      id={CHART_SVG_ID}
      width={width}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {interactiveFiltersConfig?.calculation.active && (
        <foreignObject
          {...DISABLE_SCREENSHOT_ATTR}
          width={width - margins.right}
          y={0}
          height={26}
          style={{ display: "flex" }}
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

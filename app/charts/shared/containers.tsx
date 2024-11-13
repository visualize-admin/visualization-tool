import { Box, BoxProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { select } from "d3-selection";
import { ReactNode, useEffect, useRef } from "react";

import { useChartState } from "@/charts/shared/chart-state";
import { CalculationToggle } from "@/charts/shared/interactive-filter-calculation-toggle";
import { useObserverRef } from "@/charts/shared/use-size";
import {
  hasChartConfigs,
  isLayoutingFreeCanvas,
  useConfiguratorState,
} from "@/configurator";
import { useTransitionStore } from "@/stores/transition";

export const useStyles = makeStyles<{}, {}, "chartContainer">(() => ({
  chartContainer: {
    overflow: "hidden",
    position: "relative",
    width: "100%",
    flexGrow: 1,
  },
}));

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const [state] = useConfiguratorState(hasChartConfigs);
  const isFreeCanvas = isLayoutingFreeCanvas(state);
  const ref = useObserverRef();
  const { bounds } = useChartState();
  const classes = useStyles();
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={classes.chartContainer}
      style={{ height: isFreeCanvas ? "initial" : bounds.height }}
    >
      {children}
    </div>
  );
};

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const ref = useRef<SVGSVGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { bounds, interactiveFiltersConfig } = useChartState();
  const { width, height, margins } = bounds;

  useEffect(() => {
    if (ref.current) {
      // Initialize height on mount.
      if (!ref.current.getAttribute("height")) {
        ref.current.setAttribute("height", height.toString());
      }

      const sel = select(ref.current);
      (enableTransition
        ? sel.transition().duration(transitionDuration)
        : sel
      ).attr("height", height);
    }
  }, [height, enableTransition, transitionDuration]);

  return (
    <svg
      ref={ref}
      width={width}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {interactiveFiltersConfig?.calculation.active && (
        <Box
          component="foreignObject"
          width={width - margins.right}
          sx={{ display: "flex", textAlign: "right", height: 26 }}
        >
          <CalculationToggle />
        </Box>
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

import { Box, BoxProps } from "@mui/material";
import { select } from "d3-selection";
import React, { ReactNode } from "react";

import { useChartState } from "@/charts/shared/chart-state";
import { CalculationToggle } from "@/charts/shared/interactive-filter-calculation-toggle";
import { useTransitionStore } from "@/stores/transition";

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const {
    bounds: { width, height },
  } = useChartState();

  React.useEffect(() => {
    if (ref.current) {
      // Initialize height on mount
      if (!ref.current.style.height) {
        ref.current.style.height = `${height}px`;
      }

      const sel = select(ref.current);

      if (enableTransition) {
        sel
          .transition()
          .duration(transitionDuration)
          .style("height", `${height}px`);
      } else {
        sel.style("height", `${height}px`);
      }
    }
  }, [height, enableTransition, transitionDuration]);

  return (
    <div ref={ref} aria-hidden="true" style={{ position: "relative", width }}>
      {children}
    </div>
  );
};

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const ref = React.useRef<SVGSVGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { bounds, interactiveFiltersConfig } = useChartState();
  const { width, height, margins } = bounds;

  React.useEffect(() => {
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
        <foreignObject
          width={width - margins.right}
          height="24"
          style={{ textAlign: "right" }}
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

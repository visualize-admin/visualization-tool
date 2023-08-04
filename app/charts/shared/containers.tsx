import { Box, BoxProps } from "@mui/material";
import { select } from "d3";
import React, { ReactNode } from "react";

import { useChartState } from "@/charts/shared/chart-state";
import { CalculationToggle } from "@/charts/shared/interactive-filter-calculation-toggle";
import { TRANSITION_DURATION } from "@/charts/shared/rendering-utils";

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { bounds } = useChartState();
  const { width, height } = bounds;

  React.useEffect(() => {
    if (ref.current) {
      // Initialize height on mount.
      if (!ref.current.style.height) {
        ref.current.style.height = `${height}px`;
      }

      select(ref.current)
        .transition()
        .duration(TRANSITION_DURATION)
        .style("height", `${height}px`);
    }
  }, [height]);

  return (
    <div ref={ref} aria-hidden="true" style={{ position: "relative", width }}>
      {children}
    </div>
  );
};

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const ref = React.useRef<SVGSVGElement>(null);
  const { bounds, interactiveFiltersConfig } = useChartState();
  const { width, height, margins } = bounds;

  React.useEffect(() => {
    if (ref.current) {
      // Initialize height on mount.
      if (!ref.current.getAttribute("height")) {
        ref.current.setAttribute("height", height.toString());
      }

      select(ref.current)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("height", height);
    }
  }, [height]);

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

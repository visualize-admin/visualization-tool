import { Box, BoxProps } from "@mui/material";
import { ReactNode } from "react";

import { useChartState } from "@/charts/shared/chart-state";
import { CalculationToggle } from "@/charts/shared/interactive-filter-calculation-toggle";

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const { bounds } = useChartState();
  const { width, height } = bounds;

  return (
    <div aria-hidden="true" style={{ position: "relative", width, height }}>
      {children}
    </div>
  );
};

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const { bounds, interactiveFiltersConfig } = useChartState();
  const { width, height, margins } = bounds;

  return (
    <svg
      width={width}
      height={height}
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

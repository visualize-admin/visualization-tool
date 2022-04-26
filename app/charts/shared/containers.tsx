import { ReactNode } from "react";

import { useChartState } from "@/charts/shared/use-chart-state";

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
  const { bounds } = useChartState();
  const { width, height } = bounds;
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {children}
    </svg>
  );
};

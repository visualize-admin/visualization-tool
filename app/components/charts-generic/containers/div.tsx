import React, { ReactNode } from "react";
import { useChartState } from "../use-chart-state";

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const { bounds } = useChartState();
  const { width, height } = bounds;
  return <div style={{ position: "relative", width, height }}>{children}</div>;
};

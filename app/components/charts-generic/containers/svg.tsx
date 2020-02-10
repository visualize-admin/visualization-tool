import React, { ReactNode } from "react";
import { useBounds } from "../use-bounds";

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const bounds = useBounds();
  const { width, height } = bounds;

  // FIXME: Soll nicht absolute sein
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

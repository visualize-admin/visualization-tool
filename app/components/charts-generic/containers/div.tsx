import React, { ReactNode } from "react";
import { useBounds } from "../use-bounds";

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const bounds = useBounds();
  const { width, height } = bounds;

  // FIXME: braucht keine höhe
  return <div style={{ position: "relative", width, height }}>{children} </div>;
};

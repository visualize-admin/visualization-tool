import React, { ReactNode, useEffect } from "react";
import { useResizeObserver } from "../../lib/use-resize-observer";
import { useChartState } from "./chart-state";

export const ChartObserver = ({ children }: { children: ReactNode }) => {
  // @ts-ignore
  const [state, dispatch] = useChartState();

  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();

  useEffect(
    () =>
      dispatch({
        type: "BOUNDS_UPDATE",
        value: {
          bounds: { width, height: width * 0.4 }
        }
      }),
    [width, dispatch]
  );
  return (
    <div ref={resizeRef} aria-hidden="true">
      {children}
    </div>
  );
};

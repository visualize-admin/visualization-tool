import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { useResizeObserver } from "../../lib/use-resize-observer";

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
interface Bounds {
  width: number;
  height: number;
  margins: Margins;
  chartWidth: number;
  chartHeight: number;
}

const INITIAL_BOUNDS: Bounds = {
  width: 1,
  height: 1,
  margins: {
    top: 20,
    right: 20,
    bottom: 50,
    left: 20
  },
  chartWidth: 1,
  chartHeight: 1
};

export const Observer = ({
  children,
  aspectRatio
}: {
  children: ReactNode;
  aspectRatio: number;
}) => {
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();

  const bounds = useMemo(() => {
    const margins = {
      top: 50,
      right: 20,
      bottom: 50,
      left: 20
    };
    const chartWidth = width - margins.left - margins.right;
    const chartHeight = chartWidth * aspectRatio;
    return {
      width: width,
      height: chartHeight + margins.top + margins.bottom,
      margins,
      chartWidth,
      chartHeight
    };
  }, [width, aspectRatio]);
  return (
    <div ref={resizeRef} aria-hidden="true">
      {width > 1 ? (
        <ChartObserverContext.Provider value={bounds}>
          {children}
        </ChartObserverContext.Provider>
      ) : null}
    </div>
  );
};

// Provider
const ChartObserverContext = createContext<Bounds>(INITIAL_BOUNDS);

export const useBounds = () => {
  const ctx = useContext(ChartObserverContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartObserverContextProvider /> to useBounds()"
    );
  }
  return ctx;
};

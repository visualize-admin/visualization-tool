import React, { createContext, ReactNode, useContext } from "react";

import { useTransitionStore } from "@/stores/transition";
import { useResizeObserver } from "@/utils/use-resize-observer";
import { useTimedPrevious } from "@/utils/use-timed-previous";

export type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Bounds = {
  width: number;
  height: number;
  margins: Margins;
  chartWidth: number;
  chartHeight: number;
};

const INITIAL_WIDTH = 1;

export const Observer = ({ children }: { children: ReactNode }) => {
  const [ref, width] = useResizeObserver<HTMLDivElement>();
  const prev = useTimedPrevious(width, 500);
  const isResizing = prev !== width;
  const setEnableTransition = useTransitionStore((state) => state.setEnable);

  React.useEffect(
    () => setEnableTransition(!isResizing),
    [isResizing, setEnableTransition]
  );

  return (
    <div ref={ref} style={{ display: "flex", minHeight: "100%" }}>
      <ChartObserverContext.Provider value={width}>
        {children}
      </ChartObserverContext.Provider>
    </div>
  );
};

const ChartObserverContext = createContext(INITIAL_WIDTH);

export const useWidth = () => {
  const ctx = useContext(ChartObserverContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartObserverContextProvider /> to useWidth()"
    );
  }

  return ctx;
};

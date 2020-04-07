import React, { createContext, ReactNode, useContext } from "react";
import { useResizeObserver } from "../../lib/use-resize-observer";

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export type Width = number;
export interface Bounds {
  width: number;
  height: number;
  margins: Margins;
  chartWidth: number;
  chartHeight: number;
}

const INITIAL_WIDTH: Width = 1;

export const Observer = ({ children }: { children: ReactNode }) => {
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();

  return (
    <div ref={resizeRef} aria-hidden="true">
      {width > 1 ? (
        <ChartObserverContext.Provider value={width}>
          {children}
        </ChartObserverContext.Provider>
      ) : null}
    </div>
  );
};

const ChartObserverContext = createContext<Width>(INITIAL_WIDTH);

export const useWidth = () => {
  const ctx = useContext(ChartObserverContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartObserverContextProvider /> to useWidth()"
    );
  }
  return ctx;
};

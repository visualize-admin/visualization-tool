import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";

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
  aspectRatio: number;
};

const INITIAL_WIDTH = 1;
const INITIAL_HEIGHT = 1;

export const Observer = ({ children }: { children: ReactNode }) => {
  const [ref, width, height] = useResizeObserver<HTMLDivElement>();
  const prev = useTimedPrevious(width, 500);
  const isResizing = prev !== width;
  const setEnableTransition = useTransitionStore((state) => state.setEnable);

  useEffect(
    () => setEnableTransition(!isResizing),
    [isResizing, setEnableTransition]
  );

  const size = useMemo(() => ({ width, height }), [width, height]);

  return (
    <div
      ref={ref}
      style={{ display: "flex", minHeight: "100%", outline: "1px solid red" }}
    >
      <ChartObserverContext.Provider value={size}>
        {children}
      </ChartObserverContext.Provider>
    </div>
  );
};

const ChartObserverContext = createContext({
  width: INITIAL_WIDTH,
  height: INITIAL_HEIGHT,
});

export const useWidth = () => {
  const ctx = useContext(ChartObserverContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartObserverContextProvider /> to useWidth()"
    );
  }

  return ctx.width;
};

export const useHeight = () => {
  const ctx = useContext(ChartObserverContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartObserverContextProvider /> to useWidth()"
    );
  }

  return ctx.height;
};

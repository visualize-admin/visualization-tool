import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { useTransitionStore } from "@/stores/transition";
import { INIT_SIZE, useResizeObserver } from "@/utils/use-resize-observer";
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
  yAxisTitleHeight?: number;
  chartHeight: number;
  aspectRatio: number;
};

const RESIZE_DELAY = 500;

export const CHART_RESIZE_EVENT_TYPE = "VISUALIZE-CHART-RESIZE";

export const Observer = ({ children }: { children: ReactNode }) => {
  const [ref, width, height] = useResizeObserver<HTMLDivElement>();
  const prevWidth = useTimedPrevious(width, RESIZE_DELAY);
  const prevHeight = useTimedPrevious(height, RESIZE_DELAY);
  const isResizing =
    prevWidth !== width ||
    prevHeight !== height ||
    (width === INIT_SIZE && height === INIT_SIZE);
  const brushing = useTransitionStore((state) => state.brushing);
  const setEnableTransition = useTransitionStore((state) => state.setEnable);
  useEffect(() => {
    if (!brushing) {
      setEnableTransition(!isResizing);
    }
  }, [brushing, isResizing, setEnableTransition]);

  const size = useMemo(
    () => ({
      width,
      height,
      ref,
    }),
    [width, height, ref]
  );

  return (
    <ChartObserverContext.Provider value={size}>
      {children}
    </ChartObserverContext.Provider>
  );
};

const ChartObserverContext = createContext(
  undefined as
    | undefined
    | {
        width: number;
        height: number;
        ref: (node: HTMLDivElement) => void;
      }
);

export const useSize = () => {
  const ctx = useContext(ChartObserverContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartObserverContextProvider /> to useSize()"
    );
  }

  return { width: ctx.width, height: ctx.height };
};

export const useObserverRef = () => {
  const ctx = useContext(ChartObserverContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartObserverContextProvider /> to useObserverRef()"
    );
  }

  return ctx.ref;
};

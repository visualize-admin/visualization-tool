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

export const Observer = ({ children }: { children: ReactNode }) => {
  const [ref, width, height] = useResizeObserver<HTMLDivElement>();
  const prev = useTimedPrevious(width, 500);
  const isResizing = prev !== width;
  const setEnableTransition = useTransitionStore((state) => state.setEnable);
  useEffect(() => {
    setEnableTransition(!isResizing);
  }, [isResizing, setEnableTransition]);

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
      "You need to wrap your component in <ChartObserverContextProvider /> to useHeight()"
    );
  }

  return ctx.height;
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

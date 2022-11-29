import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  RefObject,
} from "react";

type Context = {
  state: boolean;
  setState: Dispatch<SetStateAction<boolean>>;
  setStateRaw: Dispatch<SetStateAction<boolean>>;
  containerRef: RefObject<HTMLDivElement>;
  containerHeight: RefObject<"auto" | number>;
  computeContainerHeight: () => void;
};

const ChartTablePreviewContext = createContext<Context>({
  state: true,
  setState: () => {},
  setStateRaw: () => {},
  containerRef: { current: null },
  containerHeight: { current: "auto" },
  computeContainerHeight: () => undefined,
});

export const useChartTablePreview = () => {
  const ctx = useContext(ChartTablePreviewContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartTablePreviewProvider /> to useChartTablePreview()"
    );
  }

  return ctx;
};

/**
 * Keep tracks of whether we are looking at the chart of a table
 * Before changing type, the height of containerRef is measured
 * and passed back into containerHeight.
 */
export const ChartTablePreviewProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, setStateRaw] = useState<boolean>(false);
  const containerHeight = useRef("auto" as "auto" | number);
  const containerRef = useRef<HTMLDivElement>(null);
  const computeContainerHeight = () => {
    if (!containerRef.current) {
      return;
    }
    const bcr = containerRef.current.getBoundingClientRect();
    containerHeight.current = bcr.height;
  };
  const setState = useCallback(
    (v) => {
      computeContainerHeight();
      return setStateRaw(v);
    },
    [setStateRaw]
  );

  const ctx = useMemo(() => {
    return {
      state,
      setState,
      setStateRaw,
      containerRef,
      containerHeight,
      computeContainerHeight,
    };
  }, [setState, state, containerRef, containerHeight, setStateRaw]);
  return (
    <ChartTablePreviewContext.Provider value={ctx}>
      {children}
    </ChartTablePreviewContext.Provider>
  );
};

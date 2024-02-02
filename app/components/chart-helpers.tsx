import debounce from "lodash/debounce";
import React from "react";

type AlignChartElementsContext = {
  reset: () => void;
  maxHeaderHeight: number;
  setMaxHeaderHeight: (height: number) => void;
  maxChartHeight: number;
  setMaxChartHeight: (height: number) => void;
};

const AlignChartElementsContext =
  React.createContext<AlignChartElementsContext>({
    reset: () => {},
    maxHeaderHeight: 0,
    setMaxHeaderHeight: () => {},
    maxChartHeight: 0,
    setMaxChartHeight: () => {},
  });

export const useAlignChartElements = () => {
  const ctx = React.useContext(AlignChartElementsContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <AlignChartElementsProvider /> to useAlignChartElements()"
    );
  }

  return ctx;
};

/** Used to be able to properly align common chart elements in multi-column layouts. */
export const AlignChartElementsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [maxHeaderHeight, setMaxHeaderHeight] = React.useState(0);
  const [maxChartHeight, setMaxChartHeight] = React.useState(0);
  const reset = React.useCallback(() => {
    setMaxHeaderHeight(0);
    setMaxChartHeight(0);
  }, []);

  React.useEffect(() => {
    const resizeReset = debounce(reset, 100);
    window.addEventListener("resize", resizeReset);

    return () => {
      window.removeEventListener("resize", resizeReset);
    };
  }, [reset]);

  return (
    <AlignChartElementsContext.Provider
      value={{
        reset,
        maxHeaderHeight,
        setMaxHeaderHeight,
        maxChartHeight,
        setMaxChartHeight,
      }}
    >
      {children}
    </AlignChartElementsContext.Provider>
  );
};

export const useChartHeaderMarginBottom = () => {
  const alignChartElements = useAlignChartElements();
  const headerRef = React.useRef<HTMLDivElement>(null);
  const oldMargin = React.useRef(0);

  React.useEffect(() => {
    if (headerRef.current) {
      const { height } = headerRef.current.getBoundingClientRect();

      if (height > alignChartElements.maxHeaderHeight) {
        alignChartElements.setMaxHeaderHeight(height);
      }
    }
  }, [alignChartElements]);

  const headerMarginBottom = React.useMemo(() => {
    if (headerRef.current) {
      const { height } = headerRef.current.getBoundingClientRect();
      const newMargin =
        alignChartElements.maxHeaderHeight === 0
          ? oldMargin.current
          : alignChartElements.maxHeaderHeight - height;
      oldMargin.current = newMargin;

      return newMargin;
    }

    return 0;
  }, [alignChartElements.maxHeaderHeight]);

  return { headerRef, headerMarginBottom };
};

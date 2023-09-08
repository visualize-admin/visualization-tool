import React, { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import { hasChartConfigs, useConfiguratorState } from "@/configurator";

type Context = {
  state: boolean;
  setState: Dispatch<SetStateAction<boolean>>;
  setStateRaw: Dispatch<SetStateAction<boolean>>;
  containerRef: RefObject<HTMLDivElement>;
  containerHeight: RefObject<"auto" | number>;
  computeContainerHeight: () => void;
};

const ChartTablePreviewContext = React.createContext<Context>({
  state: true,
  setState: () => {},
  setStateRaw: () => {},
  containerRef: { current: null },
  containerHeight: { current: "auto" },
  computeContainerHeight: () => undefined,
});

export const useChartTablePreview = () => {
  const ctx = React.useContext(ChartTablePreviewContext);

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
  const [configuratorState] = useConfiguratorState(hasChartConfigs);
  const [state, setStateRaw] = React.useState<boolean>(false);
  const containerHeight = React.useRef("auto" as "auto" | number);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const computeContainerHeight = () => {
    if (!containerRef.current) {
      return;
    }

    const bcr = containerRef.current.getBoundingClientRect();
    containerHeight.current = bcr.height;
  };
  const setState = React.useCallback(
    (v) => {
      computeContainerHeight();

      return setStateRaw(v);
    },
    [setStateRaw]
  );

  React.useEffect(() => {
    containerHeight.current = "auto";
  }, [configuratorState.activeChartKey]);

  const ctx = React.useMemo(() => {
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

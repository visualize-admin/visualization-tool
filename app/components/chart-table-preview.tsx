import {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { hasChartConfigs, useConfiguratorState } from "@/configurator";

type Context = {
  isTable: boolean;
  setIsTable: Dispatch<SetStateAction<boolean>>;
  setIsTableRaw: Dispatch<SetStateAction<boolean>>;
  containerRef: RefObject<HTMLDivElement>;
  containerHeight: "auto" | number;
  computeContainerHeight: () => void;
};

const ChartTablePreviewContext = createContext<Context>({
  isTable: false,
  setIsTable: () => {},
  setIsTableRaw: () => {},
  containerRef: { current: null },
  containerHeight: "auto",
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
 * Keeps track of whether we are looking at the chart or a table.
 * Before changing type, the height of containerRef is measured
 * and passed back into containerHeight.
 */
export const ChartTablePreviewProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [configuratorState] = useConfiguratorState(hasChartConfigs);
  const [isTable, setIsTableRaw] = useState<boolean>(false);
  const containerHeight = useRef("auto" as "auto" | number);
  const containerRef = useRef<HTMLDivElement>(null);
  const computeContainerHeight = () => {
    if (!containerRef.current) {
      return;
    }

    const { height } = containerRef.current.getBoundingClientRect();
    containerHeight.current = height;
  };
  const setIsTable = useCallback(
    (v) => {
      computeContainerHeight();
      return setIsTableRaw(v);
    },
    [setIsTableRaw]
  );

  useEffect(() => {
    containerHeight.current = "auto";
  }, [configuratorState.activeChartKey]);

  const ctx = useMemo(() => {
    return {
      isTable,
      setIsTable,
      setIsTableRaw,
      containerRef,
      containerHeight: containerHeight.current,
      computeContainerHeight,
    };
  }, [isTable, setIsTable, setIsTableRaw, containerRef, containerHeight]);

  return (
    <ChartTablePreviewContext.Provider value={ctx}>
      {children}
    </ChartTablePreviewContext.Provider>
  );
};

export const TABLE_PREVIEW_WRAPPER_CLASS_NAME = "table-preview-wrapper";

export const TablePreviewWrapper = ({ children }: { children: ReactNode }) => {
  const { containerRef, containerHeight } = useChartTablePreview();

  return (
    <div
      ref={containerRef}
      className={TABLE_PREVIEW_WRAPPER_CLASS_NAME}
      style={{
        minWidth: 0,
        height: containerHeight,
        marginTop: 16,
        flexGrow: 1,
      }}
    >
      {children}
    </div>
  );
};

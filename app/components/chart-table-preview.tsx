import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useState,
} from "react";

const ChartTablePreviewContext = createContext<
  [boolean, Dispatch<boolean>] | undefined
>(undefined);

export const useChartTablePreview = () => {
  const ctx = useContext(ChartTablePreviewContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartTablePreviewProvider /> to useChartTablePreview()"
    );
  }

  return ctx;
};

export const ChartTablePreviewProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useState<boolean>(false);

  return (
    <ChartTablePreviewContext.Provider value={[state, dispatch]}>
      {children}
    </ChartTablePreviewContext.Provider>
  );
};

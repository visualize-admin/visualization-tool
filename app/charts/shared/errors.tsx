import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { LoadingDataError, NoDataHint } from "../../components/hint";

export type ChartErrorType = "none" | "dataLoading" | "noData";

const ChartErrorContext = createContext<{
  chartError: ChartErrorType;
  setChartError: Dispatch<SetStateAction<ChartErrorType>>;
}>({ chartError: "none", setChartError: () => undefined });

export const ChartErrorProvider = ({ children }: { children: ReactNode }) => {
  const [chartError, setChartError] = useState<ChartErrorType>("none");
  return (
    <ChartErrorContext.Provider value={{ chartError, setChartError }}>
      {children}
    </ChartErrorContext.Provider>
  );
};

export const useChartError = () => {
  return useContext(ChartErrorContext);
};

export const ChartErrorWrapper = ({ children }: { children: ReactNode }) => {
  const { chartError } = useChartError();
  switch (chartError) {
    case "none":
      return <>{children}</>;
    case "dataLoading":
      return <LoadingDataError />;
    case "noData":
      return <NoDataHint />;
  }
};

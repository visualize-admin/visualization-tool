import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { LoadingDataError, NoDataHint } from "../../components/hint";

type ErrorType = "none" | "dataLoading" | "noData";

const ChartErrorContext = createContext<{
  chartError: ErrorType;
  setChartError: Dispatch<SetStateAction<ErrorType>>;
}>({ chartError: "none", setChartError: () => undefined });

export const ChartErrorProvider = ({ children }: { children: ReactNode }) => {
  const [chartError, setChartError] = useState<ErrorType>("none");
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

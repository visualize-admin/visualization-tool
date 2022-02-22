import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type ErrorType = "none" | "dataLoading";

const ChartErrorContext = createContext<{
  error: ErrorType;
  setError: Dispatch<SetStateAction<ErrorType>>;
}>({ error: "none", setError: () => undefined });

export const ChartErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<ErrorType>("none");

  return (
    <ChartErrorContext.Provider value={{ error, setError }}>
      {error === "none" ? children : <div>{error}</div>}
    </ChartErrorContext.Provider>
  );
};

export const useChartErrorContext = () => {
  return useContext(ChartErrorContext);
};

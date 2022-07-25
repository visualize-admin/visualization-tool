import { Switch, Typography } from "@mui/material";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useState,
} from "react";

import Flex from "@/components/flex";

export type DataSource = "RDF" | "SQL";

const DataSourceStateContext = createContext<
  [DataSource, Dispatch<DataSource>] | undefined
>(undefined);

export const useDataSource = () => {
  const ctx = useContext(DataSourceStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap the application in <DataSourceProvider /> to useDataSource()"
    );
  }

  return ctx;
};

export const DataSourceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useState<DataSource>("RDF");

  return (
    <DataSourceStateContext.Provider value={[state, dispatch]}>
      {children}
    </DataSourceStateContext.Provider>
  );
};

export const DataSourceMenu = () => {
  const [dataSource, setDataSource] = useDataSource();
  const isRDF = dataSource === "RDF";

  return (
    <Flex
      sx={{
        order: 3,
        alignItems: "center",
        gap: [1, 2],
        "& > span": { transition: "opacity 0.5s ease" },
      }}
    >
      <Typography variant="tag" sx={{ opacity: isRDF ? 1 : 0.6 }}>
        RDF
      </Typography>
      <Switch
        checked={!isRDF}
        sx={{ m: 0 }}
        onChange={() => setDataSource(isRDF ? "SQL" : "RDF")}
      />
      <Typography variant="tag" sx={{ opacity: !isRDF ? 1 : 0.6 }}>
        SQL
      </Typography>
    </Flex>
  );
};

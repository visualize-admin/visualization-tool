import { Typography } from "@mui/material";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import Flex from "@/components/flex";
import { Label, MinimalisticSelect } from "@/components/form";
import { Option } from "@/configurator";
import {
  convertSourceToEndpoint,
  DataSource,
  convertEndpointToSource,
} from "@/graphql/resolvers/utils";
import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

const TRUSTED_ENDPOINT_OPTIONS: Option[] = [
  {
    value: "sparql+https://lindas.admin.ch/query",
    label: "Prod",
    position: 2,
  },
  {
    value: "sparql+https://int.lindas.admin.ch/query",
    label: "Int",
    position: 1,
  },
];
const TRUSTED_ENDPOINTS: string[] = TRUSTED_ENDPOINT_OPTIONS.map(
  (d) => d.value
);

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
  const [source, setSource] = useState<DataSource>(DEFAULT_DATA_SOURCE);
  const handleSourceChange = (source: DataSource) => {
    localStorage.setItem("endpoint", convertSourceToEndpoint(source));
    setSource(source);
  };

  useEffect(() => {
    const endpoint = localStorage.getItem("endpoint");

    if (endpoint !== null && TRUSTED_ENDPOINTS.includes(endpoint)) {
      setSource(convertEndpointToSource(endpoint));
    } else {
      localStorage.setItem(
        "endpoint",
        convertSourceToEndpoint(DEFAULT_DATA_SOURCE)
      );
    }
  }, []);

  return (
    <DataSourceStateContext.Provider value={[source, handleSourceChange]}>
      {children}
    </DataSourceStateContext.Provider>
  );
};

export const DataSourceMenu = () => {
  const [source, setSource] = useDataSource();

  return (
    <Flex sx={{ alignItems: "center", gap: 1 }}>
      <Label htmlFor="dataSourceSelect">
        <Typography sx={{ fontWeight: "bold", color: "grey.900" }}>
          Data source:
        </Typography>
      </Label>
      <MinimalisticSelect
        id="dataSourceSelect"
        options={TRUSTED_ENDPOINT_OPTIONS}
        value={convertSourceToEndpoint(source)}
        onChange={(e) => {
          setSource(convertEndpointToSource(e.target.value as string));
        }}
      />
    </Flex>
  );
};

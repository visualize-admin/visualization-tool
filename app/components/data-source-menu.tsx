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

const TRUSTED_ENDPOINT_OPTIONS: Option[] = [
  {
    value: "sparql+https://lindas.admin.ch/query",
    label: "LINDAS PROD",
    position: 2,
  },
  {
    value: "sparql+https://int.lindas.admin.ch/query",
    label: "LINDAS INT",
    position: 1,
  },
];
const TRUSTED_ENDPOINTS: string[] = TRUSTED_ENDPOINT_OPTIONS.map(
  (d) => d.value
);

export type DataSourceType = "sparql" | "sql";

export type DataSource = {
  type: DataSourceType;
  url: string;
};

const DEFAULT_DATA_SOURCE: DataSource = {
  type: "sparql",
  url: "https://lindas.admin.ch/query",
};

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

const convertEndpointToSource = (endpoint: string): DataSource => {
  const [type, url] = endpoint.split("+") as [DataSourceType, string];

  return { type, url };
};

const convertSourceToEndpoint = (source: DataSource): string => {
  const { type, url } = source;

  return `${type}+${url}`;
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

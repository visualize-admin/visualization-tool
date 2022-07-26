import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { Select } from "@/components/form";
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

  const router = useRouter();
  const endpoint = router.query.endpoint;

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

  if (endpoint !== undefined && !Array.isArray(endpoint)) {
    const query = router.query;
    delete query.endpoint;

    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });

    if (TRUSTED_ENDPOINTS.includes(endpoint)) {
      handleSourceChange(convertEndpointToSource(endpoint));
    }
  }

  return (
    <DataSourceStateContext.Provider value={[source, handleSourceChange]}>
      {children}
    </DataSourceStateContext.Provider>
  );
};

export const DataSourceMenu = () => {
  const [source, setSource] = useDataSource();

  return (
    <Select
      id="dataSourceSelect"
      options={TRUSTED_ENDPOINT_OPTIONS}
      value={convertSourceToEndpoint(source)}
      onChange={(e) => {
        setSource(convertEndpointToSource(e.target.value as string));
      }}
    />
  );
};

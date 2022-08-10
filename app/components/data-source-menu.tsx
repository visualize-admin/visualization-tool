import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import React from "react";

import Flex from "@/components/flex";
import { Label, MinimalisticSelect } from "@/components/form";
import { Option } from "@/configurator";
import {
  stringifyDataSource,
  DataSource,
  parseDataSource,
  retrieveDataSourceFromLocalStorage,
  saveDataSourceToLocalStorage,
} from "@/graphql/resolvers/utils";
import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

const TRUSTED_DATA_SOURCE_OPTIONS: Option[] = [
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
const TRUSTED_DATA_SOURCES: string[] = TRUSTED_DATA_SOURCE_OPTIONS.map(
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
    saveDataSourceToLocalStorage(stringifyDataSource(source));
    setSource(source);
  };

  useEffect(() => {
    const dataSource = retrieveDataSourceFromLocalStorage();

    if (dataSource !== null && TRUSTED_DATA_SOURCES.includes(dataSource)) {
      setSource(parseDataSource(dataSource));
    } else {
      saveDataSourceToLocalStorage(stringifyDataSource(DEFAULT_DATA_SOURCE));
    }
  }, []);

  return (
    <DataSourceStateContext.Provider value={[source, handleSourceChange]}>
      {children}
    </DataSourceStateContext.Provider>
  );
};

const isDataSourceChangeable = (pathname: string) => {
  if (pathname === "/" || pathname === "/browse") {
    return true;
  } else {
    return false;
  }
};

export const DataSourceMenu = () => {
  const [source, setSource] = useDataSource();
  const router = useRouter();
  const isDisabled = useMemo(() => {
    return !isDataSourceChangeable(router.pathname);
  }, [router.pathname]);

  return (
    <Flex sx={{ alignItems: "center", gap: 1 }}>
      <Label htmlFor="dataSourceSelect">
        <Typography sx={{ fontWeight: "bold", color: "grey.900" }}>
          <Trans id="data.source">Data source</Trans>:
        </Typography>
      </Label>
      <MinimalisticSelect
        id="dataSourceSelect"
        options={TRUSTED_DATA_SOURCE_OPTIONS}
        value={stringifyDataSource(source)}
        onChange={(e) => {
          setSource(parseDataSource(e.target.value as string));
        }}
        disabled={isDisabled}
      />
    </Flex>
  );
};

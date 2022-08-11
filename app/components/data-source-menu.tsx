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
import { DataSource, Option } from "@/configurator";
import { WHITELISTED_DATA_SOURCES } from "@/domain/env";
import {
  stringifyDataSource,
  parseDataSource,
  retrieveDataSourceFromLocalStorage,
  saveDataSourceToLocalStorage,
} from "@/graphql/resolvers/data-source";
import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

export const DATA_SOURCE_OPTIONS: ({ isTrusted: boolean } & Option)[] = [
  {
    value: "sparql+https://lindas.admin.ch/query",
    label: "Prod",
    position: 2,
    isTrusted: true,
  },
  {
    value: "sparql+https://int.lindas.admin.ch/query",
    label: "Int",
    position: 1,
    isTrusted: false,
  },
].filter((d) => WHITELISTED_DATA_SOURCES.includes(d.label));
const DATA_SOURCE_URLS: string[] = DATA_SOURCE_OPTIONS.map((d) => d.value);

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
    saveDataSourceToLocalStorage(source);
    setSource(source);
  };

  useEffect(() => {
    const dataSource = retrieveDataSourceFromLocalStorage();

    if (
      dataSource &&
      DATA_SOURCE_URLS.includes(stringifyDataSource(dataSource))
    ) {
      setSource(dataSource);
    } else {
      saveDataSourceToLocalStorage(DEFAULT_DATA_SOURCE);
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
        options={DATA_SOURCE_OPTIONS}
        value={stringifyDataSource(source)}
        onChange={(e) => {
          setSource(parseDataSource(e.target.value as string));
        }}
        disabled={isDisabled}
      />
    </Flex>
  );
};

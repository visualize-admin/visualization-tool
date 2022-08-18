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
    position: 3,
    isTrusted: true,
  },
  {
    value: "sparql+https://int.lindas.admin.ch/query",
    label: "Int",
    position: 2,
    isTrusted: false,
  },
  {
    value: "sparql+https://test.lindas.admin.ch/query",
    label: "Test",
    position: 1,
    isTrusted: false,
  },
].filter((d) => WHITELISTED_DATA_SOURCES.includes(d.label));
const DATA_SOURCE_URLS: string[] = DATA_SOURCE_OPTIONS.map((d) => d.value);

export const useIsTrustedDataSource = (dataSource: DataSource) => {
  return useMemo(() => {
    const stringifiedDataSource = stringifyDataSource(dataSource);
    return DATA_SOURCE_OPTIONS.find((d) => d.value === stringifiedDataSource)
      ?.isTrusted;
  }, [dataSource]);
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

export const DataSourceProvider = ({ children }: { children: ReactNode }) => {
  const [source, setSource] = useState<DataSource>(DEFAULT_DATA_SOURCE);
  const handleSourceChange = (source: DataSource) => {
    saveDataSourceToLocalStorage(source);
    setSource(source);
  };

  const router = useRouter();

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

  useEffect(() => {
    if (router.isReady) {
      const routerSource = router.query.dataSource;
      const stringifiedSource = stringifyDataSource(source);

      if (routerSource !== undefined && !Array.isArray(routerSource)) {
        if (routerSource !== stringifiedSource) {
          handleSourceChange(parseDataSource(routerSource));
        }
      } else {
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, dataSource: stringifiedSource },
          },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [router, source]);

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
  const [source] = useDataSource();
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
          const newDataSource = e.target.value as string;
          router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, dataSource: newDataSource },
            },
            undefined,
            { shallow: true }
          );
        }}
        disabled={isDisabled}
      />
    </Flex>
  );
};

import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { keyBy } from "lodash";
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
import { DataSource } from "@/configurator";
import { WHITELISTED_DATA_SOURCES } from "@/domain/env";
import {
  stringifyDataSource,
  parseDataSource,
  retrieveDataSourceFromLocalStorage,
  saveDataSourceToLocalStorage,
} from "@/graphql/resolvers/data-source";
import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

export const SOURCE_OPTIONS = [
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

const SOURCES_BY_LABEL = keyBy(SOURCE_OPTIONS, (d) => d.label);
const SOURCES_BY_VALUE = keyBy(SOURCE_OPTIONS, (d) => d.value);

export const useIsTrustedDataSource = (dataSource: DataSource) => {
  return useMemo(() => {
    const stringifiedDataSource = stringifyDataSource(dataSource);
    return SOURCE_OPTIONS.find((d) => d.value === stringifiedDataSource)
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

    if (dataSource && SOURCES_BY_VALUE[stringifyDataSource(dataSource)]) {
      setSource(dataSource);
    } else {
      saveDataSourceToLocalStorage(DEFAULT_DATA_SOURCE);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const routerSourceLabel = router.query.dataSource as string;
      const routerSource = SOURCES_BY_LABEL[routerSourceLabel]?.value;

      const strSource = stringifyDataSource(source);
      const strSourceLabel = SOURCES_BY_VALUE[strSource]?.label;

      if (routerSource !== undefined) {
        if (routerSource !== strSource) {
          handleSourceChange(parseDataSource(routerSource));
        }
      } else {
        if (strSourceLabel) {
          router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, dataSource: strSourceLabel },
            },
            undefined,
            { shallow: true }
          );
        }
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
        options={SOURCE_OPTIONS}
        value={stringifyDataSource(source)}
        onChange={(e) => {
          const sourceLabel = SOURCES_BY_VALUE[e.target.value as string]?.label;

          if (sourceLabel) {
            router.replace(
              {
                pathname: router.pathname,
                query: { ...router.query, dataSource: sourceLabel },
              },
              undefined,
              { shallow: true }
            );
          }
        }}
        disabled={isDisabled}
      />
    </Flex>
  );
};

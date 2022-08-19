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
import {
  stringifyDataSource,
  retrieveDataSourceFromLocalStorage,
  saveDataSourceToLocalStorage,
  parseDataSource,
} from "@/domain/data-source";
import { WHITELISTED_DATA_SOURCES } from "@/domain/env";
import useEvent from "@/lib/use-event";
import {
  updateRouterQuery,
  useSyncRouterQueryParam,
} from "@/lib/use-sync-router-param";
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
    return SOURCES_BY_VALUE[stringifiedDataSource]?.isTrusted;
  }, [dataSource]);
};

const DataSourceStateContext = createContext<
  { dataSource: DataSource; setDataSource: Dispatch<string> } | undefined
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
  const router = useRouter();
  const [source, rawSetSource] = useState<DataSource>(DEFAULT_DATA_SOURCE);
  const setSource = useEvent((source: string) => {
    updateRouterQuery(router, { dataSource: SOURCES_BY_VALUE[source]?.label });
  });
  const sourceLabel = useMemo(() => {
    return SOURCES_BY_VALUE[stringifyDataSource(source)]?.label;
  }, [source]);

  useSyncRouterQueryParam({
    param: "dataSource",
    value: sourceLabel,
    onParamChange: (routerParamValue) => {
      const newSource = parseDataSource(
        SOURCES_BY_LABEL[routerParamValue]?.value
      );

      if (newSource) {
        saveDataSourceToLocalStorage(newSource);
        rawSetSource(newSource);
      }
    },
  });

  useEffect(() => {
    const dataSource = retrieveDataSourceFromLocalStorage();

    if (dataSource && SOURCES_BY_VALUE[stringifyDataSource(dataSource)]) {
      rawSetSource(dataSource);
    } else {
      saveDataSourceToLocalStorage(DEFAULT_DATA_SOURCE);
    }
  }, []);

  return (
    <DataSourceStateContext.Provider
      value={{ dataSource: source, setDataSource: setSource }}
    >
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
  const { dataSource, setDataSource } = useDataSource();
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
        value={stringifyDataSource(dataSource)}
        onChange={(e) => {
          setDataSource(e.target.value as string);
        }}
        disabled={isDisabled}
      />
    </Flex>
  );
};

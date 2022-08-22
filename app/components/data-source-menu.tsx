import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";
import React from "react";

import Flex from "@/components/flex";
import { Label, MinimalisticSelect } from "@/components/form";
import {
  DataSourceStateContext,
  stringifyDataSource,
  useDataSource,
  useDataSourceState,
} from "@/domain/datasource";
import { SOURCE_OPTIONS } from "@/domain/datasource/constants";

export const DataSourceProvider = ({ children }: { children: ReactNode }) => {
  const [source, setSourceByValue] = useDataSourceState();

  return (
    <DataSourceStateContext.Provider
      value={{ dataSource: source, setDataSource: setSourceByValue }}
    >
      {children}
    </DataSourceStateContext.Provider>
  );
};

const isDataSourceChangeable = (pathname: string) => {
  if (
    pathname === "/" ||
    pathname === "/browse" ||
    pathname === "/_cube-checker"
  ) {
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

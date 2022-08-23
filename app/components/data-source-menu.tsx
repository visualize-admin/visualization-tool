import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useMemo } from "react";
import React from "react";

import Flex from "@/components/flex";
import { Label, MinimalisticSelect } from "@/components/form";
import { stringifyDataSource } from "@/domain/datasource";
import { SOURCE_OPTIONS } from "@/domain/datasource/constants";
import { useSyncUrlParam } from "@/lib/router/use-sync-url-param";
import { useDataSourceStore } from "@/stores/data-source";

const isDataSourceChangeable = (pathname: string) => {
  if (pathname === "/" || pathname === "/browse") {
    return true;
  } else {
    return false;
  }
};

export const DataSourceMenu = () => {
  const { dataSource, setDataSource } = useDataSourceStore();
  const router = useRouter();
  const isDisabled = useMemo(() => {
    return !isDataSourceChangeable(router.pathname);
  }, [router.pathname]);
  const dataSourceStr = stringifyDataSource(dataSource);

  useSyncUrlParam({
    param: "dataSource",
    value: dataSourceStr,
  });

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
        value={dataSourceStr}
        onChange={(e) => {
          setDataSource(e.target.value as string);
        }}
        disabled={isDisabled}
      />
    </Flex>
  );
};

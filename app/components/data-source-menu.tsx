import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useMemo } from "react";
import React from "react";

import { dataSourceAtom } from "@/atoms/dataSource";
import Flex from "@/components/flex";
import { Label, MinimalisticSelect } from "@/components/form";
import {
  stringifyDataSource,
  parseDataSource,
  SOURCE_OPTIONS,
  isDataSourceChangeable,
} from "@/domain/data-source/helpers";

export const DataSourceMenu = () => {
  const [dataSource, setDataSource] = useAtom(dataSourceAtom);
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
          setDataSource(parseDataSource(e.target.value as string));
        }}
        disabled={isDisabled}
      />
    </Flex>
  );
};

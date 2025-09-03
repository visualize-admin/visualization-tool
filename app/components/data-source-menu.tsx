import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { Flex } from "@/components/flex";
import { Select } from "@/components/form";
import {
  isDataSourceChangeable,
  parseDataSource,
  stringifyDataSource,
} from "@/domain/data-source";
import { SOURCE_OPTIONS } from "@/domain/data-source/constants";
import { useDataSourceStore } from "@/stores/data-source";

export const DataSourceMenu = () => {
  const { dataSource, setDataSource } = useDataSourceStore();
  const router = useRouter();
  const isDisabled = useMemo(() => {
    return !isDataSourceChangeable(router.pathname);
  }, [router.pathname]);

  return (
    <Flex alignItems="center" gap={1}>
      <Typography variant="h5" component="p" sx={{ color: "white" }}>
        <Trans id="data.source">Data source</Trans>:{" "}
      </Typography>
      <Select
        id="dataSourceSelect"
        variant="standard"
        value={stringifyDataSource(dataSource)}
        onChange={(e) => {
          setDataSource(parseDataSource(e.target.value as string));
        }}
        disabled={isDisabled}
        options={SOURCE_OPTIONS}
        sort={false}
        sx={{
          width: "fit-content",
          color: "white !important",

          "&:hover": {
            color: "cobalt.100",
          },

          "& .MuiSelect-select": {
            "&:hover, &[aria-expanded='true']": {
              backgroundColor: "transparent !important",
            },
          },
        }}
      />
    </Flex>
  );
};

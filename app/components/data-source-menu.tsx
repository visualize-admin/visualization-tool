import { Trans } from "@lingui/macro";
import { MenuItem, Select, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useMemo } from "react";

import Flex from "@/components/flex";
import {
  isDataSourceChangeable,
  parseDataSource,
  stringifyDataSource,
} from "@/domain/datasource";
import { SOURCE_OPTIONS } from "@/domain/datasource/constants";
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
        sx={{
          color: "white !important",

          "& .MuiSelect-select": {
            "&:hover, &[aria-expanded='true']": {
              backgroundColor: "transparent !important",
            },
          },
        }}
      >
        {SOURCE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Flex>
  );
};

import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import { useMemo } from "react";

import Flex from "@/components/flex";
import { MinimalisticSelect } from "@/components/form";
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
    <Flex
      alignItems="center"
      sx={{
        "& label": {
          color: "white",
        },
        "& .MuiInput-input.Mui-disabled": {
          textFillColor: "#828E9A", //FIXME: switch this to a proper color once the new colors are in place
        },
        "& .MuiSelect-icon": {
          color: "#F9FAFB", //FIXME: switch this to a proper color once the new colors are in place
        },
        "& .MuiSelect-icon.Mui-disabled": {
          color: "#828E9A", //FIXME: switch this to a proper color once the new colors are in place
        },
        "&:hover": {
          color: "#d1d5db", //FIXME: switch this to a proper color once the new colors are in place
          "& .MuiSelect-icon": {
            color: "#d1d5db", //FIXME: switch this to a proper color once the new colors are in place
          },
          "& .MuiInput-input": {
            color: "#d1d5db", //FIXME: switch this to a proper color once the new colors are in place
          },
        },
      }}
    >
      <MinimalisticSelect
        sx={{ pl: 0, pt: 0, pb: 0 }}
        label={<Trans id="data.source">Data source</Trans>}
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

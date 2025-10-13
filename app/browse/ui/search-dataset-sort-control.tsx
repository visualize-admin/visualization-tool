import { t, Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { useMemo } from "react";

import { Flex } from "@/components/flex";
import { Select } from "@/components/form";
import { SearchCubeResultOrder } from "@/graphql/query-hooks";

export const SearchDatasetSortControl = ({
  value,
  onChange,
  disableScore,
}: {
  value: SearchCubeResultOrder;
  onChange: (order: SearchCubeResultOrder) => void;
  disableScore?: boolean;
}) => {
  const options = useMemo(() => {
    const options = [
      {
        value: SearchCubeResultOrder.Score,
        label: t({ id: "dataset.order.relevance", message: "Relevance" }),
      },
      {
        value: SearchCubeResultOrder.TitleAsc,
        label: t({ id: "dataset.order.title", message: "Title" }),
      },
      {
        value: SearchCubeResultOrder.CreatedDesc,
        label: t({ id: "dataset.order.newest", message: "Newest" }),
      },
    ];

    if (disableScore) {
      return options.filter((o) => o.value !== SearchCubeResultOrder.Score);
    }

    return options;
  }, [disableScore]);

  return (
    <Flex alignItems="center">
      <label htmlFor="datasetSort">
        <Typography variant="body3">
          <Trans id="dataset.sortby">Sort by</Trans>
        </Typography>
      </label>
      <Select
        id="datasetSort"
        data-testId="datasetSort"
        variant="standard"
        size="sm"
        onChange={(e) => {
          onChange(e.target.value as SearchCubeResultOrder);
        }}
        value={value}
        options={options}
        sort={false}
        sx={{ width: "fit-content" }}
      />
    </Flex>
  );
};

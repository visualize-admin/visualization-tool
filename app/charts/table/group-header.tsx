import { Box } from "@mui/material";
import { hcl } from "d3-color";
import * as React from "react";
import { Fragment } from "react";
import { Row } from "react-table";

import { useChartState } from "@/charts/shared/chart-state";
import { TableChartState } from "@/charts/table/table-state";
import { Tag } from "@/charts/table/tag";
import Flex from "@/components/flex";
import { Observation } from "@/domain/data";
import { Icon } from "@/icons";

export const GroupHeader = ({
  row,
  groupingLevels,
}: {
  row: Row<Observation>;
  groupingLevels: number;
}) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;
  const { depth } = row;

  return (
    <>
      {/* Here we use `allCells` so that group headers are shown even if the column is hidden */}
      {row.allCells.map((cell, i) => {
        const colMeta = tableColumnsMeta[cell.column.id];
        const { formatter } = colMeta;
        const bg = getGroupLevelBackgroundColor(groupingLevels - depth);

        return (
          <Fragment key={i}>
            {cell.isGrouped && (
              <Flex
                {...row.getToggleRowExpandedProps()}
                sx={{
                  minWidth: "100%",
                  alignItems: "center",
                  cursor: "pointer",
                  bg,
                }}
              >
                <Box
                  component="span"
                  sx={{ width: 24, mr: 0, color: "grey.600" }}
                >
                  <Icon
                    name={row.isExpanded ? "chevronDown" : "chevronRight"}
                  />
                </Box>
                {colMeta.type === "category" ? (
                  <Tag tagColor={colMeta.colorScale(cell.value)}>
                    {formatter(cell)}
                  </Tag>
                ) : (
                  <Box
                    component="span"
                    sx={{
                      color: hcl(bg).l < 55 ? "grey.100" : "grey.900",
                      fontWeight: "bold",
                      textAlign: "left",
                    }}
                  >
                    {formatter(cell)}
                  </Box>
                )}
              </Flex>
            )}
          </Fragment>
        );
      })}
    </>
  );
};

const getGroupLevelBackgroundColor = (x: number) => {
  switch (x) {
    case 0:
      return "grey.100";
    case 1:
      return "grey.100";
    case 2:
      return "grey.200";
    case 3:
      return "grey.300";
    case 4:
      return "grey.400";
    case 5:
      return "grey.500";
    case 6:
      return "grey.600";
    default:
      return "grey.100";
  }
};

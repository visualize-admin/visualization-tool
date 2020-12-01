import { Box, Flex } from "theme-ui";
import * as React from "react";
import { Row } from "react-table";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { Tag } from "./tag";
import { TableChartState } from "./table-state";
import { hcl } from "d3";

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
        const { type, colorScale } = tableColumnsMeta[cell.column.id];
        const bg = getGroupLevelBackgroundColor(groupingLevels - depth);
        return (
          <React.Fragment key={i}>
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
                  as="span"
                  sx={{ width: 24, mr: 0, color: "monochrome600" }}
                >
                  <Icon
                    name={row.isExpanded ? "chevronDown" : "chevronRight"}
                  />
                </Box>
                {type === "category" ? (
                  <Tag
                    tagColor={
                      colorScale ? colorScale(cell.value) : "primaryLight"
                    }
                  >
                    {cell.render("Cell")}
                  </Tag>
                ) : (
                  <Box
                    as="span"
                    sx={{
                      color: hcl(bg).l < 55 ? "monochrome100" : "monochrome900",
                      fontWeight: "bold",
                      textAlign: "left",
                    }}
                  >
                    {cell.render("Cell")}
                  </Box>
                )}
              </Flex>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const getGroupLevelBackgroundColor = (x: number) => {
  switch (x) {
    case 0:
      return "monochrome100";
    case 1:
      return "monochrome100";
    case 2:
      return "monochrome200";
    case 3:
      return "monochrome300";
    case 4:
      return "monochrome400";
    case 5:
      return "monochrome500";
    case 6:
      return "monochrome600";
    default:
      return "monochrome100";
  }
};

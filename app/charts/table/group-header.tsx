import { Box, Flex } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { Tag } from "./tag";
import { TableChartState } from "./table-state";

export const GroupHeader = ({
  row,
  groupingLevels,
}: {
  row: Row<Observation>;
  groupingLevels: number;
}) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;
  const { depth } = row;
  console.log(depth);
  return (
    <>
      {row.cells.map((cell, i) => {
        const { type, textColor, colorScale } = tableColumnsMeta[
          cell.column.id
        ];
        return (
          <React.Fragment key={i}>
            {cell.isGrouped && (
              <Flex
                {...row.getToggleRowExpandedProps()}
                sx={{
                  width: "100%",
                  alignItems: "center",
                  cursor: "pointer",
                  bg: getGroupLevelBackgroundColor(groupingLevels - depth),
                }}
              >
                <Box
                  as="span"
                  sx={{ width: 24, mr: 0, color: "monochrome600" }}
                >
                  <Icon
                    name={row.isExpanded ? "chevrondown" : "chevronright"}
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
                      color: textColor, // FIXME: should we allow to change text color in group header?
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
    default:
      return "monochrome100";
  }
};

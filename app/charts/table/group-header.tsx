import { Box, Flex } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { Tag } from "./tag";
import { TableChartState } from "./table-state";

export const GroupHeader = ({ row }: { row: Row<Observation> }) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;

  return (
    <>
      {row.cells.map((cell, i) => {
        const { type, textStyle, textColor, colorScale } = tableColumnsMeta[
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
                      bg: "monochrome100",
                      textAlign: "left",
                      fontWeight: textStyle,
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

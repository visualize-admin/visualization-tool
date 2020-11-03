import { Box, Flex } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { Tag } from "./cell";
import { TableChartState } from "./table-state";

export const GroupHeader = ({ row }: { row: Row<Observation> }) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;

  return (
    <>
      {row.cells.map((cell, i) => {
        const {
          type,
          textStyle,
          textColor,
          columnColor,
          colorScale,
        } = tableColumnsMeta[cell.column.id];
        return (
          <React.Fragment key={i}>
            {cell.isGrouped && (
              <th
                colSpan={row.cells.length}
                {...row.getToggleRowExpandedProps()}
                // {...cell.getCellProps()}
              >
                <Flex
                  sx={{
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderBottomColor: "monochrome400",
                    m: `0 0 0 ${row.depth * 24}px`,
                    py: 2,
                    pr: 6,
                    pl: 3,
                  }}
                >
                  <Box
                    as="span"
                    sx={{ width: 24, mr: 0, color: "monochrome600" }}
                  >
                    <Icon name={row.isExpanded ? "chevrondown" : "chevronup"} />
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
                        color: textColor,
                        bg: columnColor,
                        textAlign:
                          typeof cell.value === "number" ? "right" : "left", // FIXME
                        fontWeight: textStyle,
                      }}
                    >
                      {cell.render("Cell")}
                    </Box>
                  )}
                </Flex>
              </th>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

import { Box } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { Tag } from "./cell-desktop";
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {/* <Flex
                  sx={{
                    m: `0 0 0 ${row.depth * 24}px`,
                    pr: 6,
                    pl: 3,
                  }}
                > */}
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
                {/* </Flex> */}
              </th>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

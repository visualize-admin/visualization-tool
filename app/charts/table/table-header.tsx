import { Box } from "@theme-ui/components";
import * as React from "react";
import { HeaderGroup } from "react-table";
import { Observation } from "../../domain/data";
import { ColumnMeta } from "./table-state";

export const TableHeader = ({
  headerGroups,
  tableColumnsMeta,
}: {
  headerGroups: HeaderGroup<Observation>[];
  tableColumnsMeta: Record<string, ColumnMeta>;
}) => {
  return (
    <thead>
      {headerGroups.map((headerGroup) => {
        return (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, i) => {
              const { columnComponentType } = tableColumnsMeta[column.id];
              return (
                <Box
                  as="th"
                  sx={{
                    position: "sticky",
                    top: 0,

                    m: 0,
                    py: 2,
                    pr: 3,
                    pl: 3,
                    textAlign:
                      columnComponentType === "Measure" ? "right" : "left",

                    borderTop: "1px solid",
                    borderTopColor: "monochrome700",
                    borderBottom: "1px solid",
                    borderBottomColor: "monochrome700",
                    fontWeight: "bold",

                    bg: "monochrome100",
                    color: "monochrome700",
                  }}
                  {...column
                    .getHeaderProps
                    // column.getSortByToggleProps()
                    ()}
                >
                  {/* {column.canGroupBy ? (
                    <Box
                      sx={{
                        fontSize: 1,
                        color: column.isGrouped ? "primary" : "monochrome700",
                        fontWeight: column.isGrouped ? 800 : 500,
                      }}
                      // {...column.getGroupByToggleProps()}
                    >
                      {column.isGrouped ? "Gruppiert " : `Spalte ${i + 1}`}
                    </Box>
                  ) : null} */}
                  {column.isSorted ? (
                    <Box
                      sx={{
                        fontSize: 1,
                        color: column.isSorted ? "success" : "monochrome700",
                        fontWeight: column.isSorted ? 800 : 500,
                      }}
                    >
                      {column.isSorted ? "Sortiert " : " "}{" "}
                      <Box
                        as="span"
                        sx={{
                          color: column.isSortedDesc ? "alert" : "success",
                        }}
                      >
                        {column.isSortedDesc ? " ↑" : " ↓"}
                      </Box>
                    </Box>
                  ) : null}
                  {column.render("Header")}
                </Box>
              );
            })}
          </tr>
        );
      })}
    </thead>
  );
};

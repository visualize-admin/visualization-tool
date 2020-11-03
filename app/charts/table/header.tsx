import { Box } from "@theme-ui/components";
import * as React from "react";
import { HeaderGroup } from "react-table";
import { Observation } from "../../domain/data";

export const TableHeader = ({
  headerGroups,
}: {
  headerGroups: HeaderGroup<Observation>[];
}) => {
  return (
    <thead>
      {headerGroups.map((headerGroup) => {
        return (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, i) => {
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
                    textAlign: "left",

                    borderTop: "1px solid",
                    borderTopColor: "monochrome700",
                    borderBottom: "1px solid",
                    borderBottomColor: "monochrome700",
                    borderRight: 0,
                    borderLeft: 0,
                    fontWeight: "bold",

                    bg: "monochrome100",
                    color: "monochrome700",

                    ":last-child": {
                      borderRight: 0,
                    },
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

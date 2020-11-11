import { Box, Flex } from "@theme-ui/components";
import * as React from "react";
import { HeaderGroup } from "react-table";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
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
                    textAlign: "left",
                    // textAlign:
                    //   columnComponentType === "Measure" ? "right" : "left",

                    borderTop: "1px solid",
                    borderTopColor: "monochrome700",
                    borderBottom: "1px solid",
                    borderBottomColor: "monochrome700",
                    fontWeight: "bold",

                    bg: "monochrome100",
                    color: "monochrome700",
                  }}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  <Flex sx={{ minHeight: 32, alignItems: "center" }}>
                    {column.render("Header")}
                    {column.isSorted && (
                      <Box sx={{ width: 32 }}>
                        <Icon
                          name={
                            column.isSortedDesc
                              ? "sortDescending"
                              : "sortAscending"
                          }
                          size={32}
                        />
                      </Box>
                    )}
                  </Flex>
                </Box>
              );
            })}
          </tr>
        );
      })}
    </thead>
  );
};

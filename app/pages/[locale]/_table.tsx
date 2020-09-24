import { Box, Grid } from "@theme-ui/components";
import { NextPage } from "next";
import { ContentLayout } from "../../components/layout";
import * as React from "react";
import { useMemo } from "react";
import { useExpanded, useGroupBy, useTable } from "react-table";
import roteListe from "../../data/rote-listen-with-labels.json";

type Data = { [x: string]: string | number };
// interface Data  {
//   taxonLabel: string;
//   artenGruppeLabel: string;
//   status: string;
//   year: string;
//   totalSpecies: number;
// };
interface Column {
  Header: string;
  accessor: string;
}
const Page: NextPage = () => {
  const columns: Column[] = useMemo(
    () => Object.keys(roteListe[0]).map((c) => ({ Header: c, accessor: c })),
    []
  );
  const data = useMemo(() => roteListe, []);
  const tableInstance = useTable<Data>(
    { columns, data },
    useGroupBy,
    useExpanded
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { groupBy, expanded },
  } = tableInstance;

  console.log({ tableInstance });

  return (
    <>
      <ContentLayout>
        <Box sx={{ px: 4, bg: "muted", mb: "auto" }}>
          <Grid
            sx={{
              gridTemplateColumns: "1fr 5fr 1fr",
            }}
          >
            {/* Left Column */}
            <Box sx={{ m: 4, border: "1px solid gray" }}></Box>
            {/* Table */}
            <Box sx={{ m: 4, p: 2, border: "1px solid gray" }}>
              <table {...getTableProps()}>
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <Box
                          as="th"
                          sx={{ textAlign: "left" }}
                          {...column.getHeaderProps()}
                        >
                          {column.canGroupBy ? (
                            // If the column can be grouped, let's add a toggle
                            <Box
                              sx={{
                                fontSize: 1,
                                color: column.isGrouped
                                  ? "primary"
                                  : "monochrome700",
                                fontWeight: column.isGrouped ? 800 : 500,
                              }}
                              {...column.getGroupByToggleProps()}
                            >
                              {column.isGrouped ? "Grouped " : "group"}
                            </Box>
                          ) : null}
                          {column.render("Header")}
                        </Box>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row); // What does this do?
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return (
                            <td {...cell.getCellProps()}>
                              {cell.isGrouped ? (
                                // If it's a grouped cell, add an expander and row count
                                <>
                                  <span {...row.getToggleRowExpandedProps()}>
                                    {row.isExpanded ? "▼" : "►"}
                                  </span>{" "}
                                  {cell.render("Cell")} ({row.subRows.length})
                                </>
                              ) : cell.isAggregated ? (
                                // If the cell is aggregated, use the Aggregated
                                // renderer for cell
                                cell.render("Aggregated")
                              ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                                // Otherwise, just render the regular cell
                                <>{cell.render("Cell")}</>
                              )}
                              {/* {cell.render("Cell")} */}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
            {/* Right Column */}
            <Box sx={{ m: 4, border: "1px solid gray" }}></Box>
          </Grid>
        </Box>
      </ContentLayout>
    </>
  );
};

export default Page;

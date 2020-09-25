// @ts-nocheck
import {
  Box,
  Button,
  Checkbox,
  Grid,
  Text,
  Label,
  Select,
} from "@theme-ui/components";
import { NextPage } from "next";
import { ContentLayout } from "../../components/layout";
import * as React from "react";
import { useMemo } from "react";
import { useExpanded, useGroupBy, useTable } from "react-table";
import ds from "../../data/holzernte.json";

const encodings = ["Grouping", "Sorting"];
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
    () => Object.keys(ds[0]).map((c) => ({ Header: c, accessor: c })),
    []
  );
  const data = useMemo(() => ds.slice(0, 200), []);

  const [activeEncoding, setActiveEncoding] = React.useState("");
  const [groupingIds, setGroupingIds] = React.useState([]);
  const [sortingIds, setSortingIds] = React.useState([]);

  // const updateGroupings = (g: string, groupingLevel: 0 | 1) => {
  //   if (groupingIds.includes(g)) {
  //     const newGroupIds = groupingIds.filter((id) => id !== g);
  //     setGroupingIds(newGroupIds);
  //   } else {
  //     const newGroupIds = groupingIds;
  //     groupingLevel === 0 ? newGroupIds.unshift(g) : newGroupIds.push(g);
  //     setGroupingIds(newGroupIds);
  //   }
  // };
  const updateGroupings = (g: string) => {
    if (groupingIds.includes(g)) {
      const newGroupIds = groupingIds.filter((id) => id !== g);
      setGroupingIds(newGroupIds);
    } else {
      setGroupingIds([...groupingIds, g]);
    }
  };
  const tableInstance = useTable<Data>(
    {
      columns,
      data,
      // initialState: { groupBy: ["Kanton", "Organisationstyp"] },
      useControlledState: (state) => {
        return React.useMemo(
          () => ({
            ...state,
            groupBy: groupingIds,
          }),
          [state, groupingIds]
        );
      },
    },
    useGroupBy,
    useExpanded
  );
  // const groupBy = ["Kanton"];
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { groupBy, expanded },
  } = tableInstance;
  console.log({ groupingIds });
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
            <Box sx={{ m: 4, bg: "monochrome100", p: 2 }}>
              {encodings.map((encoding, i) => (
                <Button
                  variant="outline"
                  onClick={() => setActiveEncoding(encoding)}
                  sx={{
                    width: ["100%", "100%", "100%"],
                    textAlign: "left",
                    mb: 3,
                    height: "4rem",
                  }}
                >
                  <Box sx={{ color: "gray" }}>{`${encoding}`}</Box>
                  <Box>
                    {encoding === "Grouping"
                      ? groupingIds.map((gId) => gId)
                      : "None"}
                    {encoding === "Sorting"
                      ? sortingIds.map((gId) => gId)
                      : "None"}
                  </Box>
                </Button>
              ))}
            </Box>
            {/* Table */}
            <Box sx={{ m: 4, p: 2 }}>
              <table
                {...getTableProps()}
                style={{ borderSpacing: 0, border: "1px solid black" }}
              >
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
                    // console.log({ row });
                    return (
                      <>
                        <tr
                          {...row.getRowProps()}
                          style={{
                            fontWeight: row.isGrouped ? 600 : 400,
                          }}
                        >
                          {row.cells.map((cell, i) => {
                            return (
                              <td {...cell.getCellProps()}>
                                {row.isGrouped && i === 0
                                  ? cell.render("Cell")
                                  : !row.isGrouped
                                  ? cell.render("Cell")
                                  : null}
                              </td>
                            );
                          })}
                        </tr>
                        {row.subRows &&
                          row.subRows.map((subRow) => {
                            prepareRow(subRow);
                            // console.log({ subRow });

                            return (
                              <>
                                <tr
                                  {...subRow.getRowProps()}
                                  style={{
                                    color: "sienna",
                                    fontWeight: 500,
                                  }}
                                >
                                  {subRow.cells.map((cell) => {
                                    return (
                                      <td {...cell.getCellProps()}>
                                        {cell.render("Cell")}
                                      </td>
                                    );
                                  })}
                                </tr>
                                {subRow.subRows &&
                                  subRow.subRows.map((subSubRow) => {
                                    prepareRow(subSubRow);

                                    return (
                                      <tr
                                        {...subSubRow.getRowProps()}
                                        style={{
                                          color: "slategray",
                                          fontWeight: 400,
                                        }}
                                      >
                                        {subSubRow.cells.map((cell) => {
                                          return (
                                            <td {...cell.getCellProps()}>
                                              {cell.render("Cell")}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })}
                              </>
                            );
                          })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </Box>
            {/* Right Column */}
            <Box sx={{ m: 4, bg: "monochrome100", p: 2 }}>
              {activeEncoding && (
                <>
                  <Text variant="heading2" sx={{ m: 2 }}>
                    {activeEncoding}
                  </Text>
                  <Box>
                    <Text variant="paragraph" sx={{ mb: 1 }}>
                      1st grouping level
                    </Text>
                    <Select
                      defaultValue="none"
                      onChange={(e) => updateGroupings(e.currentTarget.value)}
                    >
                      {columns.map((col) => (
                        <option value={col.accessor}>{col.accessor}</option>
                      ))}
                    </Select>
                    {/* <Text variant="paragraph">2nd grouping level</Text> */}
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Box>
      </ContentLayout>
    </>
  );
};

export default Page;

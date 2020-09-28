// @ts-nocheck
import { Box, Button, Checkbox, Grid, Label, Text } from "@theme-ui/components";
import { NextPage } from "next";
import { ContentLayout } from "../../components/layout";
import * as React from "react";
import { useMemo } from "react";
import { useExpanded, useGroupBy, useTable } from "react-table";
import ds from "../../data/holzernte.json";
import { ButtonNone } from "../../components/data-table.tsx/button-none";

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

  const [activeColumn, setActiveColumn] = React.useState("");
  const [groupingIds, setGroupingIds] = React.useState([]);
  const [hiddenIds, setHiddenIds] = React.useState([]);

  const updateGroupings = (g: string) => {
    if (groupingIds.includes(g)) {
      const newGroupIds = groupingIds.filter((id) => id !== g);
      setGroupingIds(newGroupIds);
    } else {
      setGroupingIds([...groupingIds, g]);
    }
  };
  const updateHiddenIds = (h: string) => {
    if (hiddenIds.includes(h)) {
      const newGroupIds = hiddenIds.filter((id) => id !== h);
      setHiddenIds(newGroupIds);
    } else {
      setHiddenIds([...hiddenIds, h]);
    }
  };

  const tableInstance = useTable<Data>(
    {
      columns,
      data,
      // initialState: { groupBy: ["Kanton"] },
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

  const displayedColumns = columns.filter(
    (c) => !groupingIds.includes(c.accessor)
  );

  console.log({ displayedColumns });

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
              <Text sx={{ mt: 2, mb: 1 }} variant="heading3">
                Grouped by
              </Text>

              {groupingIds.length > 0 ? (
                <>
                  {groupingIds.map((dim, i) => (
                    <Button
                      variant="outline"
                      onClick={() => setActiveColumn(dim)}
                      sx={{
                        width: ["100%", "100%", "100%"],
                        textAlign: "left",
                        mb: 3,
                      }}
                    >
                      <Box sx={{ color: "gray" }}>{`Column ${i + 1}`}</Box>
                      <Box>{`${dim}`}</Box>
                    </Button>
                  ))}
                </>
              ) : (
                <ButtonNone />
              )}
              <Text sx={{ mt: 2, mb: 1 }} variant="heading3">
                Columns
              </Text>
              {displayedColumns.map((dim, i) => (
                <Button
                  variant="outline"
                  onClick={() => setActiveColumn(dim.accessor)}
                  sx={{
                    width: ["100%", "100%", "100%"],
                    textAlign: "left",
                    mb: 3,
                  }}
                >
                  <Box sx={{ color: "gray" }}>{`Column ${
                    groupingIds.length + i + 1
                  }`}</Box>
                  <Box>{`${dim.Header}`}</Box>
                </Button>
              ))}

              <Text sx={{ mt: 2, mb: 1 }} variant="heading3">
                Hide & filter (Columns)
              </Text>

              {hiddenIds.length > 0 ? (
                <>
                  {columns.map((dim, i) => (
                    <Button
                      variant="outline"
                      onClick={() => setActiveColumn(dim.accessor)}
                      sx={{
                        width: ["100%", "100%", "100%"],
                        textAlign: "left",
                        mb: 3,
                      }}
                    >
                      <Box sx={{ color: "gray" }}>{`Column ${i + 1}`}</Box>
                      <Box>{`${dim.Header}`}</Box>
                    </Button>
                  ))}
                </>
              ) : (
                <ButtonNone />
              )}
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
                      {headerGroup.headers.map((column, i) => (
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
                              // {...column.getGroupByToggleProps()}
                            >
                              {column.isGrouped
                                ? "Grouped "
                                : `Column ${i + 1}`}
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
              {activeColumn !== "" && (
                <>
                  <Text variant="heading2" sx={{ m: 3 }}>
                    {activeColumn}
                  </Text>

                  <Box sx={{ m: 3 }}>
                    <Label>
                      <Checkbox
                        checked={groupingIds.includes(activeColumn)}
                        onClick={() => updateGroupings(activeColumn)}
                      />
                      Use as group
                    </Label>
                  </Box>
                  <Box sx={{ m: 3 }}>
                    <Label>
                      <Checkbox
                        checked={hiddenIds.includes(activeColumn)}
                        onClick={() => updateHiddenIds(activeColumn)}
                      />
                      Hide
                    </Label>
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

// @ts-nocheck
import {
  Box,
  Button,
  Flex,
  Grid,
  Label,
  Text,
  Checkbox,
  Radio,
  Select,
} from "@theme-ui/components";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import {
  useExpanded,
  useFilters,
  useGlobalFilter,
  useGroupBy,
  useTable,
  useColumnOrder,
  useSortBy,
  Column,
} from "react-table";

import { moveColumn, ColumnReorderingArrows } from "./column-reordering-arrows";
import { ColumnDimension } from "./column-dimensions";
import { ButtonNone } from "./button-none";
import { RowUI } from "./row";
import { Data } from "../../pages/[locale]/_table-a";

export const GROUPED_COLOR = "#F5F5F5";

export const Table = ({
  data,
  columns,
}: {
  data: Data[];
  columns: Column[];
}) => {
  const [activeColumn, setActiveColumn] = useState("");
  const [groupingIds, setGroupingIds] = useState([]);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [sortingIds, setSortingIds] = useState([]);
  const [displayedColumns, setDisplayedColumns] = useState([]); //columnOrderIds.filter((c) => !hiddenIds.includes(c));
  // const [hiddenColumns, setHiddenColumns] = useState([]); //columnOrderIds.filter((c) => !hiddenIds.includes(c));
  const [columnOrderIds, setColumnOrderIds] = useState();

  useEffect(() => {
    setDisplayedColumns(columns);
    setColumnOrderIds(columns.map((d) => d.accessor));
    setGroupingIds([]);
    setSortingIds([]);
  }, [data, columns]);
  // const displayedColumns = columnOrderIds.filter((c) => !hiddenIds.includes(c));
  // const hiddenColumns = useMemo(
  //   () => columns.filter((c) => hiddenIds.includes(c.accessor)),
  //   [columns, hiddenIds]
  // );
  // const columnsToSort = columns.filter((c) => !hiddenIds.includes(c.accessor));

  // Order & sorting

  // Control functions
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
  const updateSortingIds = (columnId: string) => {
    const sortingIdList = sortingIds.map((d) => d.id);
    if (!sortingIdList.includes(columnId)) {
      let newSortingIds = [...sortingIds, { id: columnId, desc: false }];
      setSortingIds(newSortingIds);
    } else {
      const columnIdPosition = sortingIds.findIndex((d) => d.id === columnId);
      let newSortingIds = [...sortingIds];
      newSortingIds.splice(columnIdPosition, 1);
      setSortingIds(newSortingIds);
    }
  };
  const updateSortingOrder = (columnId: string, desc: boolean) => {
    const columnIdPosition = sortingIds.findIndex((d) => d.id === columnId);
    let newSortingIds = [...sortingIds];
    newSortingIds[columnIdPosition] = { id: columnId, desc };
    setSortingIds(newSortingIds);
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setColumnOrder,
  } = useTable<Data>(
    {
      columns,
      data,
      // defaultColumn: ["Kanton"],
      // filterTypes,
      // initialState: {
      //   sortBy: initialSortingIds,
      // },
      useControlledState: (state) => {
        return useMemo(
          () => ({
            ...state,
            groupBy: groupingIds,
            hiddenColumns: hiddenIds,
            sortBy: sortingIds,
            // filters,
            // filters: initialFilters,
          }),
          [state, groupingIds, hiddenIds, sortingIds]
        );
      },
    },
    useColumnOrder,
    useGroupBy,
    useSortBy,
    useExpanded
  );

  // Ordering
  const reorderColumns = (oldPosition: number, newPosition: number) => {
    const newOrdering = moveColumn(columnOrderIds, oldPosition, newPosition);
    setColumnOrderIds(newOrdering); // component state
    setColumnOrder(newOrdering); // table instance state
  };

  console.log({ data });
  console.log({ columns });
  console.log({ displayedColumns });
  console.log({ sortingIds });
  console.log({ groupingIds });
  console.log({ hiddenIds });

  return (
    <Grid
      sx={{
        gridTemplateColumns: "350px auto 350px",
      }}
    >
      {/* Left Column */}
      <Box sx={{ m: 4, bg: "monochrome100", p: 2 }}>
        <ColumnDimension
          groupingIds={groupingIds}
          displayedColumns={displayedColumns}
          activeColumn={activeColumn}
          setActiveColumn={setActiveColumn}
          hiddenIds={hiddenIds}
        />
      </Box>

      {/* Table */}
      <Box sx={{ m: 4, p: 2 }}>
        <Box sx={{ my: 3 }}>
          Sortiert nach:
          {sortingIds.length > 0
            ? sortingIds.map((s, i) => (
                <Box>
                  {i + 1} - {s.id},{" "}
                  {s.desc ? "absteigend (9 → 1)" : "aufsteigend (1 → 9)"}{" "}
                </Box>
              ))
            : " voreingestellt"}
        </Box>
        <table
          {...getTableProps()}
          style={{ borderSpacing: 0, border: "1px solid black" }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, i) => {
                  // console.log({ column });
                  return (
                    <Box
                      as="th"
                      sx={{ textAlign: "left" }}
                      {...column.getHeaderProps()}
                    >
                      {column.canGroupBy ? (
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
                          {column.isGrouped ? "Grouped " : `Column ${i + 1}`}
                        </Box>
                      ) : null}
                      {column.isSorted ? (
                        <Box
                          sx={{
                            fontSize: 1,
                            color: column.isSorted
                              ? "success"
                              : "monochrome700",
                            fontWeight: column.isSorted ? 800 : 500,
                          }}
                        >
                          {column.isSorted ? "Sorted " : " "}{" "}
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
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              return <RowUI row={row} prepareRow={prepareRow} />;
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

            <Box sx={{ mx: 3 }}>
              <Label>
                <Checkbox
                  checked={groupingIds.includes(activeColumn)}
                  onClick={() => {
                    updateGroupings(activeColumn);
                  }}
                />
                Use as group
              </Label>
              <Box sx={{ ml: 3 }}>
                <Label>
                  <Checkbox
                    sx={{
                      color: !groupingIds.includes(activeColumn)
                        ? "monochrome300"
                        : "text",
                    }}
                    disabled={!groupingIds.includes(activeColumn)}
                    checked={hiddenIds.includes(activeColumn)}
                    onClick={() => updateHiddenIds(activeColumn)}
                  />
                  Hide
                </Label>
              </Box>
            </Box>
            {!groupingIds.includes(activeColumn) && (
              <Box sx={{ mx: 3 }}>
                <Label>
                  <Checkbox
                    checked={hiddenIds.includes(activeColumn)}
                    onClick={() => updateHiddenIds(activeColumn)}
                  />
                  Remove from table
                </Label>
              </Box>
            )}

            <ColumnReorderingArrows
              activeColumn={activeColumn}
              columnOrderIds={columnOrderIds}
              reorderColumns={reorderColumns}
              disabled={groupingIds.includes(activeColumn)}
            />

            <Text variant="heading3" sx={{ mt: 5, mx: 3, mb: 2 }}>
              Sort rows by this column
            </Text>
            <Label sx={{ mx: 3, my: 2 }}>
              <Checkbox
                checked={sortingIds.map((d) => d.id).includes(activeColumn)}
                onClick={() => updateSortingIds(activeColumn)}
              />
              Sort by the colum {activeColumn}
            </Label>
            <Flex sx={{ mx: 3, mb: 2 }}>
              <Label
                sx={{
                  color: !sortingIds.map((d) => d.id).includes(activeColumn)
                    ? "monochrome300"
                    : "monochrome900",
                }}
              >
                <Radio
                  disabled={!sortingIds.map((d) => d.id).includes(activeColumn)}
                  name="ascending"
                  value="ascending"
                  checked={
                    sortingIds.find((d) => d.id === activeColumn) &&
                    sortingIds.find((d) => d.id === activeColumn).desc === false
                  }
                  onClick={(e) => updateSortingOrder(activeColumn, false)}
                />
                1 → 9
              </Label>
              <Label
                sx={{
                  color: !sortingIds.map((d) => d.id).includes(activeColumn)
                    ? "monochrome300"
                    : "monochrome900",
                }}
              >
                <Radio
                  disabled={!sortingIds.map((d) => d.id).includes(activeColumn)}
                  name="descending"
                  value="descending"
                  checked={
                    sortingIds.find((d) => d.id === activeColumn) &&
                    sortingIds.find((d) => d.id === activeColumn).desc
                  }
                  onClick={(e) => updateSortingOrder(activeColumn, true)}
                />
                9 → 1
              </Label>
            </Flex>

            {/* <Text variant="paragraph3" sx={{ mt: 5, mx: 3, mb: 2 }}>
                    Filter rows
                  </Text>
                  {activeColumnValues.map((v) => (
                    <Label sx={{ mx: 3 }}>
                      <Checkbox
                        checked={false}
                        onClick={() => updateFilterIds(activeColumn, v)}
                      />
                      {v}
                    </Label>
                  ))}*/}
          </>
        )}
        {/* <Box sx={{ mx: 3 }}>{JSON.stringify(sortingIds)}</Box> */}
      </Box>
    </Grid>
  );
};

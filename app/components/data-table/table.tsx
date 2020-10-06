// @ts-nocheck
import {
  Box,
  Flex,
  Checkbox,
  Button,
  Grid,
  Label,
  Radio,
  Text,
} from "@theme-ui/components";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Column,
  useColumnOrder,
  useExpanded,
  useGroupBy,
  useSortBy,
  useTable,
} from "react-table";
import { Data } from "../../pages/[locale]/_table-a";
import { ColumnDimension } from "./column-dimensions";
import { ColumnReorderingArrows, moveColumn } from "./column-reordering-arrows";
import { ColumnSorting } from "./column-sorting";
import { RowUI } from "./row";
import { ColumnFormatting } from "./column-formatting";
import { setWith } from "lodash";
import { getPalette } from "../../domain/helpers";
import { scaleOrdinal, scaleLinear } from "d3-scale";
import { extent } from "d3-array";

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
  const [displayedColumns, setDisplayedColumns] = useState([]);
  const [columnOrderIds, setColumnOrderIds] = useState([]);
  const [columnStyles, setColumnStyles] = useState([]);

  useEffect(() => {
    setDisplayedColumns(columns);
    setColumnOrderIds(columns.map((d) => d.accessor));
    setGroupingIds([]);
    setSortingIds(columns.map((d) => ({ id: d.accessor, desc: false })));
    setActiveColumn("");
    setColumnStyles(
      columns.map((c) => ({
        id: c.accessor,
        dimensionType: typeof data[0][c.accessor],
        style: "text",
        textStyle: "regular",
        textColor: "#333333",
        columnColor: "#ffffff",
        barColor: "#006699",
        barBackground: "#E5E5E5",
        barScale: scaleLinear()
          .range([0, 100])
          .domain(extent(data, (d) => d[c.accessor])),
        colorRange:
          typeof data[0][c.accessor] === "number"
            ? scaleLinear()
                .range(["white", "red"])
                .domain(extent(data, (d) => d[c.accessor]))
            : scaleOrdinal().range(getPalette("pastel1")),
        domain:
          typeof data[0][c.accessor] === "number"
            ? extent(data, (d) => d[c.accessor])
            : [...new Set(data.map((d) => d[c.accessor]))],
      }))
    );
  }, [data, columns]);

  const updateActiveColumn = (columnId: string) => {
    setActiveColumn(columnId);
  };
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
      setSortBy(newSortingIds);
    } else {
      const columnIdPosition = sortingIds.findIndex((d) => d.id === columnId);
      let newSortingIds = [...sortingIds];
      newSortingIds.splice(columnIdPosition, 1);
      setSortingIds(newSortingIds);
      setSortBy(newSortingIds);
    }
  };
  const updateSortingDirection = (columnId: string, desc: boolean) => {
    const columnIdPosition = sortingIds.findIndex((d) => d.id === columnId);
    let newSortingIds = [...sortingIds];
    newSortingIds[columnIdPosition] = { id: columnId, desc };
    setSortingIds(newSortingIds);
    setSortBy(newSortingIds);
  };
  const updateSortingOrder = (oldPosition: number, newPosition: number) => {
    const newSortingIds = moveColumn(sortingIds, oldPosition, newPosition);
    setSortingIds(newSortingIds); // component state
    setSortBy(newSortingIds); // table instance state
  };

  // Ordering
  const reorderColumns = (oldPosition: number, newPosition: number) => {
    const newOrdering = moveColumn(columnOrderIds, oldPosition, newPosition);
    setColumnOrderIds(newOrdering); // component state
    setColumnOrder(newOrdering); // table instance state
    const newOrderedColums = [...columns];
    newOrderedColums.sort(
      (a, b) =>
        newOrdering.indexOf(a.accessor) - newOrdering.indexOf(b.accessor)
    );
    setDisplayedColumns(newOrderedColums);
  };

  const updateColumnStyle = ({
    columnId,
    style,
    property,
    value,
  }: {
    columnId: string;
    style: string;
    property: string;
    value: string;
  }) => {
    const columnStylesList = columnStyles.map((d) => d.id);
    if (!columnStylesList.includes(columnId)) {
      let newColumnStyles = [
        ...columnStyles,
        { id: columnId, style, textStyle },
      ];
      setColumnStyles(newColumnStyles);
    } else {
      const columnIdPosition = columnStyles.findIndex((d) => d.id === columnId);
      const thisColumnStyle = columnStyles.find((d) => d.id === columnId);
      setWith(thisColumnStyle, property, value, Object);
      let newColumnStyles = [...columnStyles];
      newColumnStyles.map((c, i) =>
        i === columnIdPosition ? thisColumnStyle : { ...c }
      );
      setColumnStyles(newColumnStyles);
    }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setColumnOrder,
    setSortBy,
  } = useTable<Data>(
    {
      columns,
      data,
      useControlledState: (state) => {
        return useMemo(
          () => ({
            ...state,
            groupBy: groupingIds,
            hiddenColumns: hiddenIds,
            // sortBy: sortingIds,
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

  // console.log({ headerGroups });
  // console.log({ data });
  // console.log({ columns });
  // console.log({ displayedColumns });
  console.log(sortingIds);
  // console.log({ groupingIds });
  // console.log({ hiddenIds });
  // console.log({ columnStyles });
  // console.log("number of rows", rows.length);

  return (
    <Grid
      sx={{
        gridTemplateColumns: [
          "250px auto 250px",
          "250px auto 250px",
          "1.5fr 5fr 1.5fr",
        ],
      }}
    >
      {/* Left Column */}
      <Box>
        <Box sx={{ m: 4, bg: "monochrome100", p: 2 }}>Einstellungen</Box>
        <Box sx={{ m: 4, bg: "monochrome100", p: 2 }}>
          {" "}
          <Button
            variant="outline"
            onClick={() => setActiveColumn("sortingOptions")}
            sx={{
              width: ["100%", "100%", "100%"],
              textAlign: "left",
              mb: 3,
              bg: GROUPED_COLOR,
            }}
          >
            <Box sx={{ color: "gray" }}>{`Sorting Options`}</Box>
            <Box>{`Sorting Options`}</Box>
          </Button>
        </Box>
        <ColumnDimension
          groupingIds={groupingIds}
          displayedColumns={displayedColumns}
          activeColumn={activeColumn}
          setActiveColumn={updateActiveColumn}
          hiddenIds={hiddenIds}
        />
      </Box>

      {/* Table */}
      <Box sx={{ m: 4, p: 2 }}>
        <Box sx={{ my: 3 }}>
          Sortiert nach:
          {sortingIds.length > 0
            ? sortingIds.map((s, i) => (
                <Box sx={{ mr: 2 }}>
                  {i + 1} - {s.id},{" "}
                  {s.desc ? "absteigend (9 → 1)" : "aufsteigend (1 → 9)"}{" "}
                </Box>
              ))
            : " voreingestellt"}
        </Box>
        <table
          {...getTableProps()}
          style={{
            borderSpacing: 0,
            border: "1px solid black",
          }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, i) => {
                  return (
                    <Box
                      as="th"
                      sx={{ textAlign: "left" }}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
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
                          {column.isGrouped ? "Gruppiert " : `Spalte ${i + 1}`}
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
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              return (
                <RowUI
                  row={row}
                  prepareRow={prepareRow}
                  columnStyles={columnStyles}
                />
              );
            })}
          </tbody>
        </table>
      </Box>

      {/* Right Column -------------------------------------------------------------------------------------------------------------------------------------- */}
      <Box sx={{ m: 4, bg: "monochrome100", p: 2 }}>
        {activeColumn === "sortingOptions" ? (
          <>
            <Text variant="heading2" sx={{ m: 3 }}>
              {activeColumn}
            </Text>
            {sortingIds.map((sCol, i) => (
              <Flex sx={{ height: 84, p: 2, m: 2, bg: "muted" }}>
                <Box sx={{ width: 100, borderRight: "1px solid gray" }}>
                  Priorität {i + 1}
                </Box>
                <Box sx={{ p: 2 }}>
                  {sCol.id}
                  <Flex sx={{ mx: 3, mb: 2 }}>
                    <Label sx={{ color: "monochrome900" }}>
                      <Radio
                        disabled={false}
                        name="ascending"
                        value="ascending"
                        checked={sCol.desc === false}
                        onClick={() => updateSortingDirection(sCol.id, false)}
                      />
                      1 → 9
                    </Label>
                    <Label sx={{ color: "monochrome900" }}>
                      <Radio
                        disabled={false}
                        name="descending"
                        value="descending"
                        checked={sCol.desc}
                        onClick={() => updateSortingDirection(sCol.id, true)}
                      />
                      9 → 1
                    </Label>
                  </Flex>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Box
                    onClick={() => updateSortingOrder(i, i - 1)}
                    sx={{
                      p: 1,
                      cursor: "pointer",
                      ":hover": { color: "primary" },
                    }}
                  >
                    ▲
                  </Box>
                  <Box
                    onClick={() => updateSortingOrder(i, i + 1)}
                    sx={{
                      p: 1,
                      cursor: "pointer",
                      ":hover": { color: "primary" },
                    }}
                  >
                    ▼
                  </Box>
                </Box>
              </Flex>
            ))}
          </>
        ) : (
          activeColumn !== "" && (
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
                  Als Gruppe verwenden
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
                    Spalte ausblenden
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
                    Spalte entfernen
                  </Label>
                </Box>
              )}

              <ColumnReorderingArrows
                activeColumn={activeColumn}
                columnOrderIds={columnOrderIds}
                reorderColumns={reorderColumns}
                disabled={groupingIds.includes(activeColumn)}
              />
              <ColumnSorting
                activeColumn={activeColumn}
                sortingIds={sortingIds}
                updateSortingIds={updateSortingIds}
                updateSortingDirection={updateSortingDirection}
                updateSortingOrder={updateSortingOrder}
              />
              <ColumnFormatting
                activeColumn={activeColumn}
                columnStyles={columnStyles}
                updateColumnStyle={updateColumnStyle}
              />
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
          )
        )}
      </Box>
    </Grid>
  );
};

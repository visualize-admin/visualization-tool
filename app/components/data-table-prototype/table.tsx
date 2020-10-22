// @ts-nocheck
import {
  Box,
  Flex,
  Checkbox,
  Button,
  Grid,
  Label,
  Radio,
  Select,
  Text,
  Input,
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
import FlexSearch from "flexsearch";

import { RowUI } from "./row";
import { ColumnFormatting } from "./column-formatting";
import { setWith } from "lodash";
import { getPalette } from "../../domain/helpers";
import { scaleOrdinal, scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { TableHeader } from "../data-table/table-header";

export const GROUPED_COLOR = "#F5F5F5";
const fakeData = [
  { id: 0, content: "blabla" },
  { id: 2, content: "lololo" },
  { id: 3, content: "merci" },
  { id: 4, content: "bye" },
];
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
  const [customSortingIds, setCustomSortingIds] = useState([]);
  const [displayedColumns, setDisplayedColumns] = useState([]);
  const [columnOrderIds, setColumnOrderIds] = useState([]);
  const [columnStyles, setColumnStyles] = useState([]);

  // Search & filter data
  const [searchTerm, setSearchTerm] = React.useState("");

  const searchIndex = useMemo(() => {
    console.log("index being created");
    const index = new FlexSearch({
      tokenize: "full",
      doc: {
        id: "id",
        field: columns.map((c) => c.accessor),
      },
    });

    index.add(data);

    return index;
  }, [columns, data]);

  const filteredData = useMemo(() => {
    const searchResult =
      searchTerm !== ""
        ? searchIndex.search({
            query: `${searchTerm}`,
            // suggest: true
          })
        : data;
    return searchResult;
  }, [data, searchTerm, searchIndex]);

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
  }, [columns, data]);

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
  const updateSortingOrder = (
    columnId: string,
    oldPosition: number,
    newPosition: number
  ) => {
    const newSortingIds = moveColumn(sortingIds, oldPosition, newPosition);
    setSortingIds(newSortingIds); // component state
    setSortBy(newSortingIds); // table instance state

    if (!customSortingIds.includes(columnId)) {
      const newCustomSortingIds = [...customSortingIds, columnId];
      setCustomSortingIds(newCustomSortingIds);
    }
    if (customSortingIds.includes(columnId)) {
      const newCustomSortingIds = moveColumn(
        customSortingIds,
        oldPosition,
        newPosition
      );
      setCustomSortingIds(newCustomSortingIds);
    }
  };

  const removeCustomSortingId = (columnId) => {
    const newSortingIds = [
      ...sortingIds.filter((d) => d.id !== columnId),
      { id: columnId, desc: false },
    ];
    setSortingIds(newSortingIds); // component state
    setSortBy(newSortingIds); // table instance state
    const newCustomSortingIds = [
      ...customSortingIds.filter((d) => d !== columnId),
    ];
    setCustomSortingIds(newCustomSortingIds);
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
      data: filteredData,
      useControlledState: (state) => {
        return useMemo(
          () => ({
            ...state,
            groupBy: groupingIds,
            hiddenColumns: hiddenIds,
            // sortBy: sortingIds,
          }),
          [state, groupingIds, hiddenIds, sortingIds, filteredData]
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
  // console.log({ sortingIds });
  // console.log({ customSortingIds });
  // console.log({ groupingIds });
  // console.log({ hiddenIds });
  // console.log({ columnStyles });
  // console.log("number of rows", rows.length);
  // console.log({ searchTerm });
  // console.log({ searchIndex });

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
        <Box sx={{ m: 4, bg: "monochrome100", p: 2 }}>
          <Button
            variant="outline"
            onClick={() => setActiveColumn("einstellungen")}
            sx={{
              width: ["100%", "100%", "100%"],
              textAlign: "left",
              mb: 3,
              bg: GROUPED_COLOR,
            }}
          >
            <Box sx={{ color: "gray" }}>{`Einstellungen`}</Box>
            <Box>{`Hinzufügen...`}</Box>
          </Button>
        </Box>
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
            <Box sx={{ color: "gray" }}>{`Sortieren`}</Box>
            <Box>{`Hinzufügen...`}</Box>
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
        <Label sx={{ my: 3, width: 300 }}>
          <Input
            sx={{ width: 300 }}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
          />
        </Label>
        <Box
          as="table"
          {...getTableProps()}
          style={{
            borderSpacing: 0,
            border: "1px solid black",
            display: ["none", "table", "table"],
          }}
        >
          <TableHeader headerGroups={headerGroups} />

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
        </Box>
      </Box>

      {/* Right Column -------------------------------------------------------------------------------------------------------------------------------------- */}
      <Box sx={{ m: 4, bg: "monochrome100", p: 2 }}>
        {activeColumn === "sortingOptions" ? (
          <>
            <Text variant="heading2" sx={{ m: 3 }}>
              {activeColumn}
            </Text>

            {sortingIds.map((csId, i) => {
              return (
                <Box key={csId.id}>
                  {customSortingIds.includes(csId.id) && (
                    <Box
                      sx={{
                        borderBottom: "1px solid",
                        borderBottomColor: "monochrome300",
                        mt: 2,
                      }}
                    >
                      <Text
                        variant="paragraph2"
                        sx={{ color: "monochrome700", mt: 2, mx: 3 }}
                      >
                        Sortieren nach
                      </Text>
                      <Select
                        sx={{ mx: 3, my: 2, p: 3 }}
                        value={csId.id}
                        onChange={(e) =>
                          updateSortingOrder(
                            e.currentTarget.value,
                            sortingIds.findIndex(
                              (c) => c.id === e.currentTarget.value
                            ),
                            i
                          )
                        }
                      >
                        {sortingIds.map((id, i) => (
                          <option value={id.id}>{`${id.id}`}</option>
                        ))}
                      </Select>

                      <Flex sx={{ mx: 3, mb: 2 }}>
                        <Label sx={{ color: "monochrome900" }}>
                          <Radio
                            disabled={false}
                            name="ascending"
                            value="ascending"
                            checked={!csId.desc}
                            onClick={() =>
                              updateSortingDirection(csId.id, false)
                            }
                          />
                          1 → 9
                        </Label>
                        <Label sx={{ color: "monochrome900" }}>
                          <Radio
                            disabled={false}
                            name="descending"
                            value="descending"
                            checked={csId.desc}
                            onClick={() =>
                              updateSortingDirection(csId.id, true)
                            }
                          />
                          9 → 1
                        </Label>
                      </Flex>
                      <Button
                        variant="inline"
                        sx={{ mx: 3, my: 2 }}
                        onClick={() => removeCustomSortingId(csId.id)}
                      >
                        Löschen
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}

            <Text
              variant="paragraph2"
              sx={{ color: "monochrome700", mt: 4, mx: 3 }}
            >
              Spalte hinzufügen:
            </Text>
            <Select
              sx={{ mx: 3, my: 2, p: 3 }}
              value={undefined}
              onChange={(e) =>
                updateSortingOrder(
                  e.currentTarget.value,
                  sortingIds.findIndex((c) => c.id === e.currentTarget.value),
                  customSortingIds.length
                )
              }
            >
              {sortingIds.map((id, i) => (
                <option value={id.id}>{`${id.id}`}</option>
              ))}
            </Select>
          </>
        ) : activeColumn === "einstellungen" ? (
          <>
            <Text variant="heading2" sx={{ m: 3 }}>
              {activeColumn}
            </Text>
            <Box sx={{ mx: 3 }}>Hier kommen Einstellungen</Box>
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

              <ColumnFormatting
                activeColumn={activeColumn}
                columnStyles={columnStyles}
                updateColumnStyle={updateColumnStyle}
              />
            </>
          )
        )}
      </Box>
    </Grid>
  );
};

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
import { NextPage } from "next";
import * as React from "react";
import { useMemo } from "react";
import {
  useExpanded,
  useFilters,
  useGlobalFilter,
  useGroupBy,
  useTable,
  useColumnOrder,
  useSortBy,
} from "react-table";

import {
  moveColumn,
  ColumnReorderingArrows,
} from "../../components/data-table/column-reordering-arrows";
import { ButtonNone } from "../../components/data-table/button-none";
import { RowUI } from "../../components/data-table/row";

import { ContentLayout } from "../../components/layout";
import ds from "../../data/holzernte.json";

export const GROUPED_COLOR = "#F5F5F5";

export type Data = { [x: string]: string | number };
interface Column {
  Header: string;
  accessor: string;
}
const Page: NextPage = () => {
  const [activeColumn, setActiveColumn] = React.useState("");
  const [groupingIds, setGroupingIds] = React.useState([]);
  const [hiddenIds, setHiddenIds] = React.useState([]);
  const [sortingIds, setSortingIds] = React.useState([]);

  // Data
  const columns: Column[] = useMemo(
    () =>
      Object.keys(ds[0]).map((c) => ({
        Header: c,
        accessor: c,
      })),
    []
  );

  const data = useMemo(() => ds.slice(0, 200), []);
  const columnsToSort = columns.filter((c) => !hiddenIds.includes(c.accessor));

  // Oreder & sorting
  const [columnOrderIds, setColumnOrderIds] = React.useState(
    columnsToSort.map((d) => d.accessor)
  );

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
    console.log({ columnId });
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
    console.log({ columnId });

    const columnIdPosition = sortingIds.findIndex((d) => d.id === columnId);
    let newSortingIds = [...sortingIds];
    newSortingIds[columnIdPosition] = { id: columnId, desc };
    setSortingIds(newSortingIds);
  };
  console.log({ sortingIds });
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
        return React.useMemo(
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
  const reorderColumns = (oldPosition, newPosition) => {
    const newOrdering = moveColumn(columnOrderIds, oldPosition, newPosition);
    setColumnOrderIds(newOrdering); // component state
    setColumnOrder(newOrdering); // table instance state
  };
  const displayedColumns = useMemo(
    () => columnOrderIds.filter((c) => !hiddenIds.includes(c)),
    [columnOrderIds, hiddenIds]
  );
  const hiddenColumns = columns.filter((c) => hiddenIds.includes(c.accessor));
  console.log({ columnOrderIds });
  return (
    <>
      <ContentLayout>
        <Box sx={{ px: 4, bg: "muted", mb: "auto" }}>
          <Grid
            sx={{
              gridTemplateColumns: "350px auto 350px",
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
                        bg: GROUPED_COLOR,
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
              {displayedColumns
                .filter((dim) => !groupingIds.includes(dim))
                .map((dim, i) => {
                  return (
                    <Button
                      variant="outline"
                      onClick={() => setActiveColumn(dim)}
                      sx={{
                        width: ["100%", "100%", "100%"],
                        textAlign: "left",
                        mb: 3,
                        bg:
                          dim === activeColumn
                            ? "primaryLight"
                            : "monochrome000",
                        ":hover": {
                          bg:
                            dim === activeColumn
                              ? "primaryLight"
                              : "monochrome300",
                        },
                      }}
                    >
                      <Box sx={{ color: "gray" }}>{`Column ${
                        groupingIds.length + i + 1
                      }`}</Box>
                      <Box>{`${dim}`}</Box>
                    </Button>
                  );
                })}

              <Text sx={{ mt: 2, mb: 1 }} variant="heading3">
                Hide & filter (Columns)
              </Text>

              {hiddenIds.length > 0 ? (
                <>
                  {hiddenColumns.map((dim, i) => (
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
                                {column.isGrouped
                                  ? "Grouped "
                                  : `Column ${i + 1}`}
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
                                    color: column.isSortedDesc
                                      ? "alert"
                                      : "success",
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
                      checked={sortingIds
                        .map((d) => d.id)
                        .includes(activeColumn)}
                      onClick={() => updateSortingIds(activeColumn)}
                    />
                    Sort by the colum {activeColumn}
                  </Label>
                  <Flex sx={{ mx: 3, mb: 2 }}>
                    <Label
                      sx={{
                        color: !sortingIds
                          .map((d) => d.id)
                          .includes(activeColumn)
                          ? "monochrome300"
                          : "monochrome900",
                      }}
                    >
                      <Radio
                        disabled={
                          !sortingIds.map((d) => d.id).includes(activeColumn)
                        }
                        name="ascending"
                        value="ascending"
                        checked={
                          sortingIds.find((d) => d.id === activeColumn) &&
                          sortingIds.find((d) => d.id === activeColumn).desc ===
                            false
                        }
                        onClick={(e) => updateSortingOrder(activeColumn, false)}
                      />
                      1 → 9
                    </Label>
                    <Label
                      sx={{
                        color: !sortingIds
                          .map((d) => d.id)
                          .includes(activeColumn)
                          ? "monochrome300"
                          : "monochrome900",
                      }}
                    >
                      <Radio
                        disabled={
                          !sortingIds.map((d) => d.id).includes(activeColumn)
                        }
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
        </Box>
      </ContentLayout>
    </>
  );
};

export default Page;

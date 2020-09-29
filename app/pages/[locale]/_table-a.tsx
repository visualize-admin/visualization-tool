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
  useSortBy,
} from "react-table";
import { ButtonNone } from "../../components/data-table/button-none";
import { RowUI } from "../../components/data-table/row";

import { ContentLayout } from "../../components/layout";
import ds from "../../data/holzernte.json";

export const GROUPED_COLOR = "#F5F5F5";

export type Data = { [x: string]: string | number };
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
  const [activeColumn, setActiveColumn] = React.useState("");
  const [groupingIds, setGroupingIds] = React.useState([]);
  const [hiddenIds, setHiddenIds] = React.useState([]);
  const [filters, setFilters] = React.useState([]);
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

  const initialSortingIds = useMemo(
    () => columnsToSort.map((c) => ({ id: c.accessor, desc: false })),
    []
  );
  const [sortingIds, setSortingIds] = React.useState(initialSortingIds);

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

  const updateSortingIds = (id: string, desc: boolean) => {
    console.log({ id });
    const idToUpdate = sortingIds.findIndex((sId) => sId.id === id);
    console.log({ idToUpdate });
    let newSortingIds = [...sortingIds];
    newSortingIds[idToUpdate] = { id, desc };
    setSortingIds(newSortingIds);
  };

  const displayedColumns = columns
    .filter((c) => !groupingIds.includes(c.accessor))
    .filter((c) => !hiddenIds.includes(c.accessor));
  const hiddenColumns = columns.filter((c) => hiddenIds.includes(c.accessor));

  const tableInstance = useTable<Data>(
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
    // useFilters,
    // useGlobalFilter,
    useGroupBy,
    useSortBy,
    useExpanded
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;
  console.log({ groupingIds });
  console.log({ sortingIds });

  return (
    <>
      <ContentLayout>
        <Box sx={{ px: 4, bg: "muted", mb: "auto" }}>
          <Grid
            sx={{
              gridTemplateColumns: "1.5fr 5fr 1.5fr",
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
              {displayedColumns.map((dim, i) => (
                <Button
                  variant="outline"
                  onClick={() => setActiveColumn(dim.accessor)}
                  sx={{
                    width: ["100%", "100%", "100%"],
                    textAlign: "left",
                    mb: 3,
                    bg:
                      dim.accessor === activeColumn
                        ? "primaryLight"
                        : "monochrome000",
                    ":hover": {
                      bg:
                        dim.accessor === activeColumn
                          ? "primaryLight"
                          : "monochrome300",
                    },
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
                      {headerGroup.headers.map((column, i) => (
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
                          {column.render("Header")}
                        </Box>
                      ))}
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
                          console.log("grouping");
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

                  <Text variant="paragraph3" sx={{ mt: 5, mx: 3, mb: 2 }}>
                    Sort rows by this column
                  </Text>
                  <Flex sx={{ mx: 3, mb: 2 }}>
                    <Label>
                      <Radio
                        name="ascending"
                        value="ascending"
                        checked={
                          sortingIds.find((d) => d.id === activeColumn).desc ===
                          false
                        }
                        onClick={(e) => updateSortingIds(activeColumn, false)}
                      />
                      1 → 9
                    </Label>
                    <Label>
                      <Radio
                        name="descending"
                        value="descending"
                        checked={
                          sortingIds.find((d) => d.id === activeColumn).desc
                        }
                        onClick={(e) => updateSortingIds(activeColumn, true)}
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
              <Box sx={{ mx: 3 }}>{JSON.stringify(sortingIds)}</Box>
            </Box>
          </Grid>
        </Box>
      </ContentLayout>
    </>
  );
};

export default Page;

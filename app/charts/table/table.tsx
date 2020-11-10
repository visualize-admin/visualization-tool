import FlexSearch from "flexsearch";
import { Trans } from "@lingui/macro";
import { Box, Text } from "@theme-ui/components";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import {
  useBlockLayout,
  useExpanded,
  useGroupBy,
  useSortBy,
  useTable,
} from "react-table";
import { Input, Switch } from "../../components/form";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { TABLE_STYLES } from "./constants";
import { TableHeader } from "./header";
import { RowMobile, RowDesktop } from "./row";
import { TableChartState } from "./table-state";
import { FixedSizeList } from "react-window";
import { scrollbarWidth } from "./helpers";

export const Table = () => {
  const {
    bounds,
    data,
    showSearch,
    tableColumns,
    tableColumnsMeta,
    groupingIris,
    sortingIris,
  } = useChartState() as TableChartState;

  const [useAlternativeMobileView, toggleAlternativeMobileView] = useState(
    false
  );

  // const [sortingIds, updateSortingIds] = useState(sortingIris);

  // Search & filter data
  const [searchTerm, setSearchTerm] = useState("");
  const searchIndex = useMemo(() => {
    const searchFields = Object.values(tableColumnsMeta).map(
      (m) => m.slugifiedIri
    );

    const index = FlexSearch.create({
      tokenize: "full",
      doc: {
        id: "id",
        field: searchFields,
      },
    });

    index.add(data);

    return index;
  }, [tableColumnsMeta, data]);

  const filteredData = useMemo(() => {
    const searchResult =
      searchTerm !== ""
        ? searchIndex.search({
            query: `${searchTerm}`,
            // suggest: true
          })
        : data;
    return searchResult as Observation[];
  }, [data, searchTerm, searchIndex]);

  // console.log({ data });
  // console.log({ tableColumns });
  // console.log({ filteredData });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    setSortBy,
    totalColumnsWidth,
    prepareRow,
  } = useTable<Observation>(
    {
      columns: tableColumns,
      data: filteredData,
      useControlledState: (state) => {
        return useMemo(
          () => ({
            ...state,
            groupBy: groupingIris,
            sortBy: sortingIris,
          }),
          [state, tableColumns, groupingIris, filteredData, sortingIris]
        );
      },
    },
    useBlockLayout,
    useGroupBy,
    useSortBy,
    useExpanded
  );
  const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);

  const renderRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <>
          {/* <RowDesktop row={row} prepareRow={prepareRow} /> */}
          <div
            {...row.getRowProps({
              style,
            })}
            className="tr"
          >
            {row.cells.map((cell) => {
              return (
                <div {...cell.getCellProps()} className="td">
                  {cell.render("Cell")}
                </div>
              );
            })}
          </div>
        </>
      );
    },
    [prepareRow, rows]
  );
  return (
    <>
      {showSearch && (
        <Box sx={{ my: 5, width: "min(100%, 300px)" }}>
          <Input
            type="text"
            name="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
          />
        </Box>
      )}
      <Box sx={{ display: ["block", "none", "none"], my: 3 }}>
        <Switch
          label={
            <Trans id="chart.published.toggle.mobile.view">
              Toggle alternative mobile view
            </Trans>
          }
          name={"Toggle alternative mobile view"}
          checked={useAlternativeMobileView}
          disabled={false}
          onChange={() =>
            toggleAlternativeMobileView(!useAlternativeMobileView)
          }
        />
      </Box>

      {/* Desktop */}
      <Box
        sx={{
          display: useAlternativeMobileView
            ? ["none", "block", "block"]
            : "block",
          width: "100%",
          height: bounds.chartHeight,
          position: "relative",
          overflow: "auto",
          bg: "monochrome100",
          mb: 4,
        }}
      >
        <Box
          // as="table"
          sx={{
            display: "inline-block",
            borderSpacing: 0,
            border: "1px solid black",
          }}
          {...getTableProps()}
        >
          {/* <TableHeader headerGroups={headerGroups} /> */}
          <div>
            {headerGroups.map((headerGroup) => (
              <div {...headerGroup.getHeaderGroupProps()} className="tr">
                {headerGroup.headers.map((column) => (
                  <div {...column.getHeaderProps()} className="th">
                    {column.render("Header")}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div {...getTableBodyProps()}>
            <FixedSizeList
              height={bounds.chartHeight}
              itemCount={rows.length}
              itemSize={35}
              width={totalColumnsWidth + scrollBarSize}
            >
              {renderRow}
            </FixedSizeList>
          </div>
          {/* <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              return <RowDesktop key={i} row={row} prepareRow={prepareRow} />;
            })}
          </tbody> */}
        </Box>
      </Box>

      {/* Alternative Mobile View */}
      {useAlternativeMobileView && (
        <Box
          sx={{
            display: useAlternativeMobileView
              ? ["block", "none", "none"]
              : "none",
            width: "100%",
            height: bounds.chartHeight,
            position: "relative",
            overflow: "auto",
            bg: "monochrome100",
            mb: 5,
          }}
        >
          {rows.map((row, i) => (
            <RowMobile key={i} row={row} prepareRow={prepareRow} />
          ))}
        </Box>
      )}

      {/* Number of lines */}
      <Text
        variant="paragraph2"
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 5,
          color: "monochrome600",
        }}
      >
        <Trans id="chart.table.number.of.lines">Total number of lines:</Trans>{" "}
        {rows.length}
      </Text>
    </>
  );
};

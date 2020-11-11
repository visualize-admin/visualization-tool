import { Trans } from "@lingui/macro";
import { Box, Text } from "@theme-ui/components";
import FlexSearch from "flexsearch";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import {
  useExpanded,
  useFlexLayout,
  useGroupBy,
  useSortBy,
  useTable,
} from "react-table";
import { FixedSizeList } from "react-window";
import { Input, Switch } from "../../components/form";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { CellDesktop } from "./cell";
import { TableHeader } from "./header";
import { scrollbarWidth } from "./helpers";
import { RowMobile } from "./row";
import { TableChartState } from "./table-state";

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
    // useBlockLayout,
    useFlexLayout,
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
        <Box
          {...row.getRowProps({
            style,
          })}
          sx={{ borderBottom: "1px solid", borderBottomColor: "monochrome400" }}
        >
          {row.cells.map((cell, i) => {
            return (
              <CellDesktop
                key={i}
                cell={cell}
                columnMeta={tableColumnsMeta[cell.column.id]}
              />
            );
          })}
        </Box>
      );
    },
    [prepareRow, rows, tableColumnsMeta]
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
      {!useAlternativeMobileView && (
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
            }}
            {...getTableProps()}
          >
            <TableHeader headerGroups={headerGroups} />

            <div {...getTableBodyProps()}>
              <FixedSizeList
                height={bounds.chartHeight}
                itemCount={rows.length}
                itemSize={40} // FIXME: Should it be 56px when a column is "bar"?
                // estimatedItemSize={40}
                width={totalColumnsWidth + scrollBarSize}
              >
                {renderRow}
              </FixedSizeList>
            </div>
          </Box>
        </Box>
      )}

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

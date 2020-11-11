import { Trans } from "@lingui/macro";
import { Box, Text } from "@theme-ui/components";
import FlexSearch from "flexsearch";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import {
  useBlockLayout,
  useExpanded,
  useFlexLayout,
  useGroupBy,
  useSortBy,
  useTable,
} from "react-table";
import { VariableSizeList } from "react-window";
import { Input, Switch } from "../../components/form";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { CellDesktop } from "./cell";
import { scrollbarWidth } from "./helpers";
import { RowMobile } from "./row";
import { TableChartState } from "./table-state";
import { useVirtual } from "react-virtual";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { max } from "d3-array";

export const Table = () => {
  const parentRef = React.useRef();
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
    ({ index, virtualRow }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div
          {...row.getRowProps({
            // style,
          })}
        >
          {row.cells.map((cell, i) => {
            return (
              <>
                <CellDesktop
                  cell={cell}
                  columnMeta={tableColumnsMeta[cell.column.id]}
                />
              </>
            );
          })}
        </div>
      );
    },
    [prepareRow, rows, tableColumnsMeta]
  );

  // const rowVirtualizer = useVirtual({
  //   size: rows.length,
  //   parentRef,
  //   estimateSize: React.useCallback((i) => columnWidths[i] || 150, [
  //     columnWidths,
  //   ]),
  //   overscan: 5,
  // });
  const rowVirtualizer = useVirtual({
    size: rows.length,
    parentRef,
  });

  const columnVirtualizer = useVirtual({
    horizontal: true,
    size: tableColumns.length,
    parentRef,
  });

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
          ref={parentRef}
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
              height: `${rowVirtualizer.totalSize}px`,
              width: `${columnVirtualizer.totalSize}px`,
            }}
            {...getTableProps()}
          >
            {/* <Box
              sx={{
                position: "sticky",
                top: 0,
                bg: "monochrome100",
                zIndex: 12,
              }}
            >
              {headerGroups.map((headerGroup) => (
                <div {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <div {...column.getHeaderProps()}>
                      {column.render("Header")}
                    </div>
                  ))}
                </div>
              ))}
            </Box> */}
            <div {...getTableBodyProps()} style={{ position: "relative" }}>
              {/* {rowVirtualizer.virtualItems.map((virtualRow) => (
                <React.Fragment key={virtualRow.index}>
                  {columnVirtualizer.virtualItems.map((virtualColumn) => (
                    <div
                      key={virtualColumn.index}
                      // ref={(el) => {
                      //   virtualRow.measureRef(el);
                      //   virtualColumn.measureRef(el);
                      // }}
                      className={
                        virtualColumn.index % 2
                          ? virtualRow.index % 2 === 0
                            ? "ListItemOdd"
                            : "ListItemEven"
                          : virtualRow.index % 2
                          ? "ListItemOdd"
                          : "ListItemEven"
                      }
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${columnWidths[virtualColumn.index]}px`,
                        height: `${rows[virtualRow.index]}px`,
                        transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {filteredData[virtualRow.index]}
                    </div>
                  ))}
                </React.Fragment>
              ))} */}
              {rowVirtualizer.virtualItems.map((virtualRow) => (
                <React.Fragment key={virtualRow.index}>
                  {renderRow({ index: virtualRow.index, virtualRow })}
                  {/* {rows[virtualRow.index].cells.map((cell, i) => {
                    return (
                      <CellDesktop
                        cellWidth={columnWidths[i] || 150}
                        cell={cell}
                        columnMeta={tableColumnsMeta[cell.column.id]}
                      />
                    );
                  })} */}
                </React.Fragment>
              ))}
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

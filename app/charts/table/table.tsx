import { Trans } from "@lingui/macro";
import { Box, Flex, Text } from "@theme-ui/components";
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
import { CellDesktop } from "./cell-desktop";
import { GroupHeader } from "./group-header";
import { TableHeader } from "./table-header";
import { scrollbarWidth } from "./table-helpers";
import { DDContent, RowMobile } from "./cell-mobile";
import { TableChartState } from "./table-state";

export const Table = () => {
  const {
    bounds,
    rowHeight,
    data,
    showSearch,
    tableColumns,
    tableColumnsMeta,
    groupingIris,
    hiddenIris,
    sortingIris,
  } = useChartState() as TableChartState;

  const [useAlternativeMobileView, toggleAlternativeMobileView] = useState(
    false
  );

  // const [sortingIds, updateSortingIds] = useState(sortingIris);
  const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);
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
      autoResetExpanded: false,
      useControlledState: (state) => {
        return useMemo(
          () => ({
            ...state,
            groupBy: groupingIris,
            hiddenColumns: hiddenIris,
            // sortBy: sortingIris,
          }),
          [state, tableColumns, groupingIris, filteredData, hiddenIris]
        );
      },
    },
    useFlexLayout,
    useGroupBy,
    useSortBy,
    useExpanded
  );

  // This effect allows to sort rows
  // both from the table state and the table UI.
  React.useEffect(() => {
    setSortBy(sortingIris);
  }, [setSortBy, sortingIris]);

  const renderDesktopRow = useCallback(
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
          {row.subRows.length === 0 ? (
            row.cells.map((cell, i) => {
              return (
                <CellDesktop
                  key={i}
                  cell={cell}
                  columnMeta={tableColumnsMeta[cell.column.id]}
                />
              );
            })
          ) : (
            <GroupHeader row={row} groupingLevels={groupingIris.length} />
          )}
        </Box>
      );
    },
    [prepareRow, rows, tableColumnsMeta]
  );
  const renderMobileRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      const headingLevel =
        row.depth === 0 ? "h2" : row.depth === 1 ? "h3" : "p";

      return (
        <>
          <Box
          // {...row.getRowProps({
          //   style,
          // })
          // }
          >
            {row.subRows.length === 0 ? (
              row.cells.map((cell, i) => {
                return (
                  <Flex
                    key={i}
                    as="dl"
                    sx={{
                      color: "monochrome800",
                      fontSize: 2,
                      width: "100%",
                      height: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                      my: 2,
                      "&:first-of-type": {
                        pt: 2,
                      },
                      "&:last-of-type": {
                        borderBottom: "1px solid",
                        borderBottomColor: "monochrome400",
                        pb: 3,
                      },
                    }}
                  >
                    <Box
                      as="dt"
                      sx={{ flex: "1 1 100%", fontWeight: "bold", mr: 2 }}
                    >
                      {cell.column.Header}
                    </Box>
                    <Box
                      as="dd"
                      sx={{ flex: "1 1 100%", ml: 2, position: "relative" }}
                    >
                      <DDContent
                        cell={cell}
                        columnMeta={tableColumnsMeta[cell.column.id]}
                      />
                    </Box>
                  </Flex>
                );
              })
            ) : (
              <GroupHeader row={row} groupingLevels={groupingIris.length} />
            )}
          </Box>
        </>
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
            width: "100%",
            position: "relative",
            overflowY: "hidden",
            overflowX: "scroll",
            bg: "monochrome100",
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: "inline-block",
              borderSpacing: 0,
              fontSize: 3,
            }}
            {...getTableProps()}
          >
            <TableHeader
              headerGroups={headerGroups}
              tableColumnsMeta={tableColumnsMeta}
            />

            <div {...getTableBodyProps()}>
              <FixedSizeList
                height={bounds.chartHeight}
                itemCount={rows.length}
                itemSize={rowHeight} // depends on whether a column has bars (40px or 56px)
                width={totalColumnsWidth + scrollBarSize}
              >
                {renderDesktopRow}
              </FixedSizeList>
            </div>
          </Box>
        </Box>
      )}

      {/* Alternative Mobile View */}
      {useAlternativeMobileView && (
        <Box
          sx={{
            width: "100%",
            height: bounds.chartHeight,
            position: "relative",
            overflow: "auto",
            bg: "monochrome100",
            mb: 5,
          }}
        >
          {/* <FixedSizeList
            height={bounds.chartHeight}
            itemCount={rows.length}
            itemSize={tableColumns.length * 40}
            width={bounds.chartWidth}
          >
            {renderMobileRow}
          </FixedSizeList> */}

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
        <Trans id="chart.table.number.of.lines">Total number of rows:</Trans>{" "}
        {filteredData.length}
      </Text>
    </>
  );
};

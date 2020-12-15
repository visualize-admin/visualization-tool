import { Trans } from "@lingui/macro";
import FlexSearch from "flexsearch";
import { forwardRef, useCallback, useMemo, useState } from "react";
import {
  useExpanded,
  useFlexLayout,
  useGroupBy,
  useSortBy,
  useTable,
} from "react-table";
import { FixedSizeList, VariableSizeList } from "react-window";
import { Box, Flex, Text } from "theme-ui";
import { Input, Switch } from "../../components/form";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { CellDesktop } from "./cell-desktop";
import { DDContent } from "./cell-mobile";
import { TABLE_HEIGHT } from "./constants";
import { GroupHeader } from "./group-header";
import { TableContent, TableContentProvider } from "./table-content";
import { scrollbarWidth } from "./table-helpers";
import { TableChartState } from "./table-state";

const MOBILE_VIEW_THRESHOLD = 384;

const TableContentWrapper = forwardRef<HTMLDivElement, $FixMe>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        {...props}
        style={{
          ...props.style,
          height: props.style.height + 42,
        }}
      >
        <TableContent>{children}</TableContent>
      </Box>
    );
  }
);

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

  const [compactMobileViewEnabled, setCompactMobileView] = useState(false);

  const showCompactMobileView =
    bounds.width < MOBILE_VIEW_THRESHOLD && compactMobileViewEnabled;

  // Search & filter data
  const [searchTerm, setSearchTerm] = useState("");
  const searchIndex = useMemo(() => {
    // Don't index measure columns
    const searchFields = Object.values(tableColumnsMeta).flatMap((m) =>
      m.columnComponentType === "Measure" ? [] : [m.slugifiedIri]
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
      searchTerm !== "" ? searchIndex.search({ query: `${searchTerm}` }) : data;
    return searchResult as Observation[];
  }, [data, searchTerm, searchIndex]);

  // Table Instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
    visibleColumns,
    state: tableState,
  } = useTable<Observation>(
    {
      columns: tableColumns,
      data: filteredData,
      autoResetExpanded: false,
      useControlledState: (state) => {
        return useMemo(
          () => ({
            ...state,
            sortBy: [...state.sortBy, ...sortingIris],
            groupBy: groupingIris,
            hiddenColumns: hiddenIris,
          }),
          [state, groupingIris, hiddenIris, sortingIris]
        );
      },
    },
    useFlexLayout,
    useGroupBy,
    useSortBy,
    useExpanded
  );

  // If the table has a custom sort, the tableState.sortBy has these items prepended.
  const customSortCount = tableState.sortBy.length - sortingIris.length;

  // Desktop row
  const renderDesktopRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <Box
          {...row.getRowProps({
            style: { ...style, minWidth: "100%" },
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
    [groupingIris.length, prepareRow, rows, tableColumnsMeta]
  );

  // Mobile row
  const MOBILE_ROW_HEIGHT = 32;
  const getMobileItemSize = useCallback(
    (index: number) => {
      return rows[index].isGrouped
        ? rowHeight
        : visibleColumns.length * MOBILE_ROW_HEIGHT;
    },
    [rows, rowHeight, visibleColumns.length]
  );

  const renderMobileRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);

      return (
        <>
          <Box
            sx={{
              borderBottom: "1px solid",
              borderBottomColor: "monochrome400",
              "&:first-of-type": {
                borderTop: "1px solid",
                borderTopColor: "monochrome400",
              },
            }}
            {...row.getRowProps({
              style: { ...style, flexDirection: "column" },
            })}
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
                      height: MOBILE_ROW_HEIGHT,
                      justifyContent: "space-between",
                      alignItems: "center",
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
              // Group
              <Flex
                sx={{
                  height: rowHeight,

                  color: "monochrome600",
                  // py: 2,
                  ml: `${row.depth * 12}px`,
                }}
              >
                <GroupHeader row={row} groupingLevels={groupingIris.length} />
              </Flex>
            )}
          </Box>
        </>
      );
    },
    [groupingIris.length, prepareRow, rowHeight, rows, tableColumnsMeta]
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
      <Box
        sx={{ my: 3 }}
        style={{
          display: bounds.width < MOBILE_VIEW_THRESHOLD ? "block" : "none",
        }}
      >
        <Switch
          label={
            <Trans id="chart.published.toggle.mobile.view">Compact view</Trans>
          }
          name={"Compact view"}
          checked={compactMobileViewEnabled}
          disabled={false}
          onChange={() => setCompactMobileView(!compactMobileViewEnabled)}
        />
      </Box>

      {showCompactMobileView ? (
        /* Compact Mobile View */
        <Box
          sx={{
            width: "100%",
            position: "relative",
            bg: "monochrome100",
            mb: 4,
            fontSize: 3,
          }}
        >
          <VariableSizeList
            key={rows.length} // Reset when groups are toggled because itemSize remains cached per index
            height={TABLE_HEIGHT}
            itemCount={rows.length}
            itemSize={getMobileItemSize}
            width={bounds.width}
          >
            {renderMobileRow}
          </VariableSizeList>
        </Box>
      ) : (
        /* Regular table view */
        <Box
          sx={{
            position: "relative",
            bg: "monochrome100",
            mb: 4,
            fontSize: 3,
          }}
          {...getTableProps({ style: { minWidth: "100%" } })}
        >
          <div {...getTableBodyProps()}>
            <TableContentProvider
              headerGroups={headerGroups}
              tableColumnsMeta={tableColumnsMeta}
              customSortCount={customSortCount}
              totalColumnsWidth={totalColumnsWidth}
            >
              <FixedSizeList
                outerElementType={TableContentWrapper}
                height={Math.min(
                  TABLE_HEIGHT,
                  rows.length * rowHeight + scrollbarWidth()
                )}
                itemCount={rows.length}
                itemSize={rowHeight} // depends on whether a column has bars (40px or 56px)
                width="100%"
              >
                {renderDesktopRow}
              </FixedSizeList>
            </TableContentProvider>
          </div>
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

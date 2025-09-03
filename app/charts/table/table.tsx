import { t, Trans } from "@lingui/macro";
import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import FlexSearch from "flexsearch";
import { forwardRef, useCallback, useMemo, useState } from "react";
import {
  useExpanded,
  useFlexLayout,
  useGroupBy,
  useSortBy,
  useTable,
} from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, VariableSizeList } from "react-window";

import { useChartState } from "@/charts/shared/chart-state";
import { CellDesktop } from "@/charts/table/cell-desktop";
import { DDContent } from "@/charts/table/cell-mobile";
import { GroupHeader } from "@/charts/table/group-header";
import {
  TableContent,
  TableContentProvider,
} from "@/charts/table/table-content";
import { TableChartState } from "@/charts/table/table-state";
import { Flex } from "@/components/flex";
import { Input, Switch } from "@/components/form";
import { Observation } from "@/domain/data";
import { Icon } from "@/icons";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

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

const useStyles = makeStyles((theme: Theme) => {
  return {
    desktopRow: {
      borderBottom: "1px solid",
      borderBottomColor: theme.palette.monochrome[300],
    },
    mobileRow: {
      borderBottom: "1px solid",
      borderBottomColor: theme.palette.monochrome[300],

      "&:first-of-type": {
        borderTop: "1px solid",
        borderTopColor: theme.palette.monochrome[300],
      },
    },
  };
});

const shouldShowCompactMobileView = (width: number) => {
  return width < MOBILE_VIEW_THRESHOLD;
};

export const TABLE_TIME_RANGE_HEIGHT = 40;

/** Use to make sure we don't cut the table off by having other UI elements enabled */
export const getTableUIElementsOffset = ({
  showSearch,
  width,
  showTimeRange,
}: {
  showSearch: boolean;
  width: number;
  showTimeRange: boolean;
}) => {
  return (
    (showSearch ? 48 : 0) +
    (shouldShowCompactMobileView(width) ? 48 : 0) +
    (showTimeRange ? TABLE_TIME_RANGE_HEIGHT : 0) +
    54
  );
};

export const Table = () => {
  const {
    bounds,
    rowHeight,
    chartData,
    showSearch,
    tableColumns,
    tableColumnsMeta,
    groupingIds,
    hiddenIds,
    sortingIds,
  } = useChartState() as TableChartState;
  const classes = useStyles();

  const [compactMobileViewEnabled, setCompactMobileView] = useState(false);

  const showCompactMobileView = shouldShowCompactMobileView(bounds.width);

  // Search & filter data
  const [searchTerm, setSearchTerm] = useState("");
  const searchIndex = useMemo(() => {
    // Don't index measure columns
    const searchFields = Object.values(tableColumnsMeta).flatMap((m) =>
      m.columnComponentType === "NumericalMeasure" ? [] : [m.slugifiedId]
    );

    const index = FlexSearch.create({
      tokenize: "full",
      doc: {
        id: "id",
        field: searchFields,
      },
    });

    index.add(chartData);

    return index;
  }, [tableColumnsMeta, chartData]);

  const filteredData = useMemo(() => {
    const result =
      searchTerm === ""
        ? chartData
        : searchIndex.search({ query: `${searchTerm}` });

    return result as Observation[];
  }, [chartData, searchTerm, searchIndex]);

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
            sortBy: [...state.sortBy, ...sortingIds],
            groupBy: groupingIds,
            hiddenColumns: hiddenIds,
          }),
          // eslint does not detect correctly the dependencies here due to the
          // hook not being in the body of the component.
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [state, groupingIds, hiddenIds, sortingIds]
        );
      },
    },
    useFlexLayout,
    useGroupBy,
    useSortBy,
    useExpanded
  );

  // If the table has a custom sort, the tableState.sortBy has these items prepended.
  const customSortCount = tableState.sortBy.length - sortingIds.length;

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
          className={classes.desktopRow}
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
            <GroupHeader row={row} groupingLevels={groupingIds.length} />
          )}
        </Box>
      );
    },
    [classes.desktopRow, groupingIds.length, prepareRow, rows, tableColumnsMeta]
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
            className={classes.mobileRow}
            {...row.getRowProps({
              style: {
                ...style,
                flexDirection: "column",
                width: "100%",
              },
            })}
          >
            {row.subRows.length === 0 ? (
              row.cells.map((cell, i) => {
                return (
                  <Flex
                    key={i}
                    component="dl"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "grey.800",
                      fontSize: "0.75rem",
                      my: 1,
                    }}
                  >
                    <Box
                      component="dt"
                      sx={{
                        fontWeight: "bold",
                        mr: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cell.column.Header}
                    </Box>
                    <Flex
                      component="dd"
                      sx={{
                        position: "relative",
                        justifyContent: "flex-end",
                        textAlign: "right",
                        ml: 2,
                      }}
                    >
                      <DDContent
                        cell={cell}
                        columnMeta={tableColumnsMeta[cell.column.id]}
                      />
                    </Flex>
                  </Flex>
                );
              })
            ) : (
              // Group
              <Flex sx={{ height: rowHeight, ml: `${row.depth * 12}px` }}>
                <GroupHeader row={row} groupingLevels={groupingIds.length} />
              </Flex>
            )}
          </Box>
        </>
      );
    },
    [
      classes.mobileRow,
      groupingIds.length,
      prepareRow,
      rowHeight,
      rows,
      tableColumnsMeta,
    ]
  );

  return (
    <>
      {showSearch && (
        <Box
          sx={{ mb: 4, width: "min(100%, 300px)" }}
          {...DISABLE_SCREENSHOT_ATTR}
        >
          <Input
            type="text"
            name="search-input"
            placeholder={t({
              id: "table.search.placeholder",
              message: "Search...",
            })}
            endAdornment={<Icon name="search" />}
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
          name="Compact view"
          checked={compactMobileViewEnabled}
          onChange={() => setCompactMobileView(!compactMobileViewEnabled)}
        />
      </Box>

      {showCompactMobileView && compactMobileViewEnabled ? (
        /* Compact Mobile View */
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            backgroundColor: "grey.100",
            mb: 4,
            fontSize: "0.875rem",
          }}
        >
          <AutoSizer>
            {({ width, height }: { width: number; height: number }) => (
              <VariableSizeList
                key={rows.length} // Reset when groups are toggled because itemSize remains cached per index
                height={height}
                itemCount={rows.length}
                itemSize={getMobileItemSize}
                width={width}
              >
                {renderMobileRow}
              </VariableSizeList>
            )}
          </AutoSizer>
        </Box>
      ) : (
        /* Regular table view */
        <Box
          sx={{ position: "relative", mb: 4, fontSize: "0.875rem" }}
          {...getTableProps({ style: { minWidth: "100%", height: "100%" } })}
        >
          <div {...getTableBodyProps()} style={{ height: "100%" }}>
            <TableContentProvider
              headerGroups={headerGroups}
              tableColumnsMeta={tableColumnsMeta}
              customSortCount={customSortCount}
              totalColumnsWidth={totalColumnsWidth}
            >
              <AutoSizer disableWidth>
                {({ height }: { height: number }) => (
                  <FixedSizeList
                    outerElementType={TableContentWrapper}
                    // row height = header row height
                    height={height - rowHeight}
                    itemCount={rows.length}
                    itemSize={rowHeight} // depends on whether a column has bars (40px or 56px)
                    width="100%"
                  >
                    {renderDesktopRow}
                  </FixedSizeList>
                )}
              </AutoSizer>
            </TableContentProvider>
          </div>
        </Box>
      )}
      <Typography
        variant="body3"
        sx={{ display: "flex", justifyContent: "flex-end", mb: 5 }}
      >
        <Trans id="chart.table.number.of.lines">Total number of rows:</Trans>{" "}
        {filteredData.length}
      </Typography>
    </>
  );
};

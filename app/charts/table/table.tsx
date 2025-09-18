import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import FlexSearch from "flexsearch";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { useExpanded, useFlexLayout, useGroupBy, useTable } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, VariableSizeList } from "react-window";

import { PaginationControls } from "@/charts/shared/chart-props";
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

export const Table = ({ pagination }: { pagination?: PaginationControls }) => {
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
    // For server-side sorting (pagination), don't apply client-side filtering
    // as it would mess up the server-sorted order
    if (pagination) {
      return chartData;
    }

    // For client-side sorting, apply search filtering
    const result =
      searchTerm === ""
        ? chartData
        : searchIndex.search({ query: `${searchTerm}` });

    return result as Observation[];
  }, [chartData, searchTerm, searchIndex, pagination]);

  // Manual sort state for server-side sorting
  const [manualSortBy, setManualSortBy] = useState<
    Array<{ id: string; desc: boolean }>
  >([]);

  // Handle manual sort icon clicks for server-side sorting
  const handleSortClick = useCallback(
    (columnId: string) => {
      if (!pagination) return; // Only for server-side sorting

      setManualSortBy((prevSort) => {
        const existingSort = prevSort.find((s) => s.id === columnId);
        let newSort: Array<{ id: string; desc: boolean }>;

        if (!existingSort) {
          // Add new sort ascending
          newSort = [{ id: columnId, desc: false }];
        } else if (!existingSort.desc) {
          // Change to descending
          newSort = [{ id: columnId, desc: true }];
        } else {
          // Remove sort
          newSort = [];
        }

        return newSort;
      });
    },
    [pagination]
  );

  // Send manual sort changes to server
  useEffect(() => {
    if (pagination && manualSortBy.length > 0) {
      const sortByWithOriginalIds = manualSortBy.map((sort) => {
        const originalComponentId =
          Object.values(tableColumnsMeta).find(
            (meta: any) => meta.slugifiedId === sort.id
          )?.id || sort.id;
        return {
          ...sort,
          id: originalComponentId,
        };
      });
      pagination.setSortBy(sortByWithOriginalIds);
    }
  }, [manualSortBy, pagination, tableColumnsMeta]);

  // Table configuration - completely disable sorting for server-side
  const tableConfig = useMemo(() => {
    const config = {
      columns: pagination
        ? tableColumns.map((col) => ({
            ...col,
            disableSortBy: true, // Disable react-table sorting completely
          }))
        : tableColumns,
      data: filteredData,
      autoResetExpanded: false,
      initialState: {
        groupBy: groupingIds,
        hiddenColumns: hiddenIds,
      },
    };

    // No sorting logic at all

    return config;
  }, [pagination, tableColumns, filteredData, groupingIds, hiddenIds]);

  // Table Instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
    visibleColumns,
  } = useTable<Observation>(
    tableConfig,
    useFlexLayout,
    useGroupBy,
    useExpanded
  );

  // If the table has a custom sort, count them
  const customSortCount = sortingIds.length;

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

  console.log({ filteredData });

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
              handleSortClick={pagination ? handleSortClick : undefined}
              manualSortBy={pagination ? manualSortBy : undefined}
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Typography variant="body3">
          <Trans id="chart.table.number.of.lines">Total number of rows:</Trans>{" "}
          {pagination ? pagination.totalCount : filteredData.length}
        </Typography>

        {pagination && (
          <Flex sx={{ alignItems: "center", gap: 2 }}>
            <Typography variant="body3">
              Page {pagination.pageIndex + 1} of{" "}
              {Math.ceil(pagination.totalCount / pagination.pageSize)}
            </Typography>

            <Select
              size="sm"
              value={pagination.pageSize}
              onChange={(e) => pagination.setPageSize(Number(e.target.value))}
              sx={{ minWidth: 80 }}
            >
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
            </Select>

            <Button
              size="sm"
              onClick={pagination.previousPage}
              disabled={!pagination.canPreviousPage}
            >
              <Trans id="pagination.previous">Previous</Trans>
            </Button>

            <Button
              size="sm"
              onClick={pagination.nextPage}
              disabled={!pagination.canNextPage}
            >
              <Trans id="pagination.next">Next</Trans>
            </Button>
          </Flex>
        )}
      </Box>
    </>
  );
};

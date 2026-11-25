import { plural, t, Trans } from "@lingui/macro";
import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useId } from "@reach/auto-id";
import FlexSearch from "flexsearch";
import { FocusEvent, forwardRef, useMemo, useState } from "react";
import {
  Row,
  useExpanded,
  useFlexLayout,
  useGroupBy,
  useSortBy,
  useTable,
} from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, ListChildComponentProps } from "react-window";

import { useChartState } from "@/charts/shared/chart-state";
import { CellDesktop } from "@/charts/table/cell-desktop";
import {
  FOCUS_RING_ROOM,
  TABLE_HEADER_HEIGHT,
  TABLE_HEIGHT,
} from "@/charts/table/constants";
import { GroupHeader } from "@/charts/table/group-header";
import {
  TableContent,
  TableContentProvider,
  useTableContent,
} from "@/charts/table/table-content";
import { TableMobile } from "@/charts/table/table-mobile";
import { TableChartState } from "@/charts/table/table-state";
import {
  readHeight,
  useHeightWhileSearching,
  useObservedHeight,
} from "@/charts/table/use-table-heights";
import { Input, Switch } from "@/components/form";
import { LiveRegion } from "@/components/live-region";
import {
  hasChartConfigs,
  isLayoutingFreeCanvas,
  useConfiguratorState,
} from "@/configurator";
import { isMeasure, Observation } from "@/domain/data";
import { Icon } from "@/icons";
import {
  FOCUS_OUTLINE_INSET,
  FOCUS_VISIBLE_WITHIN_FIELD,
} from "@/themes/focus";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

const MOBILE_VIEW_THRESHOLD = 384;

const TableContentWrapper = forwardRef<HTMLDivElement, $FixMe>(
  ({ children, ...props }, ref) => {
    const { tableAriaProps, header } = useTableContent();

    return (
      <Box
        ref={ref}
        {...props}
        role="table"
        tabIndex={0}
        sx={{
          "&:focus-visible": { outline: "none" },
          "& [role=rowgroup] + [role=rowgroup] :is(a, button)": {
            scrollMarginTop: `${header.height}px`,
          },
        }}
        {...tableAriaProps}
        onFocus={scrollFocusedControlIntoView}
        style={{
          ...props.style,
          height: props.style.height + header.height,
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
  };
});

const shouldShowCompactMobileView = (width: number) => {
  return width < MOBILE_VIEW_THRESHOLD;
};

export const TABLE_TIME_RANGE_HEIGHT = 40;

// Browsers don't scroll partly visible elements on focus, which leaves their focus ring clipped.
const scrollFocusedControlIntoView = (e: FocusEvent<HTMLDivElement>) => {
  if (e.target !== e.currentTarget && e.target.matches(":focus-visible")) {
    e.target.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
};

export const Table = () => {
  const {
    tableLabel,
    bounds,
    rowHeight,
    chartData,
    showSearch,
    tableColumns,
    tableColumnsMeta,
    groupingIds,
    hiddenIds,
    sortingIds,
    shouldApplyWidthLimits,
  } = useChartState() as TableChartState;
  const classes = useStyles();

  const [configuratorState] = useConfiguratorState(hasChartConfigs);
  const fillsTile = isLayoutingFreeCanvas(configuratorState);
  const [compactMobileViewEnabled, setCompactMobileView] = useState(false);
  const [headerElement, setHeaderElement] = useState<HTMLDivElement | null>(
    null
  );
  const headerHeight = useObservedHeight({
    element: headerElement,
    read: readHeight,
    initial: TABLE_HEADER_HEIGHT,
  });

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

  const {
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
      autoResetSortBy: false,
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

  const rowHeaderColumnId = useMemo(() => {
    return visibleColumns.find(
      (column) => !isMeasure(tableColumnsMeta[column.id].dim)
    )?.id;
  }, [visibleColumns, tableColumnsMeta]);

  const tableAriaProps = useMemo(() => {
    return {
      "aria-label": tableLabel,
      "aria-rowcount": rows.length + 1,
      "aria-colcount": visibleColumns.length,
    };
  }, [tableLabel, rows.length, visibleColumns.length]);

  const searchId = `table-search-${useId()}`;

  const tableHeader = useMemo(
    () => ({ height: headerHeight, ref: setHeaderElement }),
    [headerHeight]
  );
  const tableHeight = useHeightWhileSearching(
    Math.min(TABLE_HEIGHT, headerHeight + rows.length * rowHeight) +
      2 * FOCUS_RING_ROOM,
    searchTerm !== ""
  );

  const desktopRowData = useMemo(() => {
    return {
      rows,
      prepareRow,
      tableColumnsMeta,
      rowHeaderColumnId,
      groupingLevels: groupingIds.length,
      columnCount: visibleColumns.length,
      className: classes.desktopRow,
    };
  }, [
    rows,
    prepareRow,
    tableColumnsMeta,
    rowHeaderColumnId,
    groupingIds.length,
    visibleColumns.length,
    classes.desktopRow,
  ]);

  return (
    <>
      {showSearch && (
        <Box
          sx={{ mb: 4, width: "min(100%, 300px)" }}
          {...DISABLE_SCREENSHOT_ATTR}
        >
          <Input
            type="text"
            name={searchId}
            aria-label={t({
              id: "table.search.label",
              message: "Search table",
            })}
            placeholder={t({
              id: "table.search.placeholder",
              message: "Search...",
            })}
            endAdornment={<Icon name="search" aria-hidden />}
            // The chart container scrolls and would clip an outside ring.
            sx={{ [FOCUS_VISIBLE_WITHIN_FIELD]: FOCUS_OUTLINE_INSET }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
          />
          <LiveRegion
            message={
              searchTerm
                ? t({
                    id: "table.search.results",
                    message: plural(filteredData.length, {
                      0: "No matching rows",
                      one: "# matching row",
                      other: "# matching rows",
                    }),
                  })
                : ""
            }
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
        <TableMobile
          rows={rows}
          prepareRow={prepareRow}
          visibleColumns={visibleColumns}
          groupingLevels={groupingIds.length}
          fillsTile={fillsTile}
          isSearching={searchTerm !== ""}
        />
      ) : (
        /* Regular table view */
        <Box
          sx={{ position: "relative", mb: 4, fontSize: "0.875rem" }}
          style={{
            minWidth: "100%",
            height: fillsTile ? "100%" : tableHeight,
          }}
        >
          <Box
            sx={{
              height: "100%",
              boxSizing: "border-box",
              p: `${FOCUS_RING_ROOM}px`,
              "&:has([role=table]:focus-visible)": FOCUS_OUTLINE_INSET,
            }}
          >
            <TableContentProvider
              headerGroups={headerGroups}
              tableColumnsMeta={tableColumnsMeta}
              customSortCount={customSortCount}
              totalColumnsWidth={totalColumnsWidth}
              shouldApplyWidthLimits={shouldApplyWidthLimits}
              tableAriaProps={tableAriaProps}
              header={tableHeader}
            >
              <AutoSizer disableWidth>
                {({ height }: { height: number }) => (
                  <FixedSizeList
                    outerElementType={TableContentWrapper}
                    height={height - headerHeight}
                    itemCount={rows.length}
                    itemSize={rowHeight} // depends on whether a column has bars (40px or 56px)
                    width="100%"
                    itemData={desktopRowData}
                  >
                    {DesktopRow}
                  </FixedSizeList>
                )}
              </AutoSizer>
            </TableContentProvider>
          </Box>
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

type DesktopRowData = {
  rows: Row<Observation>[];
  prepareRow: (row: Row<Observation>) => void;
  tableColumnsMeta: TableChartState["tableColumnsMeta"];
  rowHeaderColumnId: string | undefined;
  groupingLevels: number;
  columnCount: number;
  className: string;
};

/** Defined once, so react-window keeps rows mounted (and focus inside them) when the data changes. Same for `MobileRow`. */
const DesktopRow = ({
  index,
  style,
  data,
}: ListChildComponentProps<DesktopRowData>) => {
  const row = data.rows[index];
  data.prepareRow(row);

  return (
    <Box
      {...row.getRowProps({
        style: { ...style, minWidth: "100%" },
      })}
      aria-rowindex={index + 2}
      className={data.className}
    >
      {row.subRows.length === 0 ? (
        row.cells.map((cell, i) => {
          return (
            <CellDesktop
              key={i}
              cell={cell}
              columnMeta={data.tableColumnsMeta[cell.column.id]}
              isRowHeader={cell.column.id === data.rowHeaderColumnId}
            />
          );
        })
      ) : (
        <GroupHeader
          row={row}
          groupingLevels={data.groupingLevels}
          colSpan={data.columnCount}
        />
      )}
    </Box>
  );
};

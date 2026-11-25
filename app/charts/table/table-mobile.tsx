import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { ColumnInstance, Row } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";

import { useChartState } from "@/charts/shared/chart-state";
import { DDContent } from "@/charts/table/cell-mobile";
import { FOCUS_RING_ROOM, TABLE_HEIGHT } from "@/charts/table/constants";
import { GroupHeader } from "@/charts/table/group-header";
import { TableChartState } from "@/charts/table/table-state";
import { useHeightWhileSearching } from "@/charts/table/use-table-heights";
import { Flex } from "@/components/flex";
import { Observation } from "@/domain/data";
import { FOCUS_OUTLINE_INSET } from "@/themes/focus";

const MOBILE_ROW_HEIGHT = 32;

const useStyles = makeStyles((theme: Theme) => ({
  list: {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    padding: FOCUS_RING_ROOM,
    position: "relative",
    backgroundColor: theme.palette.grey[100],
    marginBottom: theme.spacing(4),
    fontSize: "0.875rem",
    "&:has([role=region]:focus-visible)": FOCUS_OUTLINE_INSET,
  },
  mobileRow: {
    borderBottom: "1px solid",
    borderBottomColor: theme.palette.monochrome[300],

    "&:first-of-type": {
      borderTop: "1px solid",
      borderTopColor: theme.palette.monochrome[300],
    },
  },
}));

export const TableMobile = ({
  rows,
  prepareRow,
  visibleColumns,
  groupingLevels,
  fillsTile,
  isSearching,
}: {
  rows: Row<Observation>[];
  prepareRow: (row: Row<Observation>) => void;
  visibleColumns: ColumnInstance<Observation>[];
  groupingLevels: number;
  fillsTile: boolean;
  isSearching: boolean;
}) => {
  const { rowHeight, tableColumnsMeta } = useChartState() as TableChartState;
  const classes = useStyles();

  const getItemSize = useCallback(
    (index: number) => {
      return rows[index].isGrouped
        ? rowHeight
        : visibleColumns.length * MOBILE_ROW_HEIGHT;
    },
    [rows, rowHeight, visibleColumns.length]
  );

  const listRef = useRef<VariableSizeList>(null);

  useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [rows]);

  const contentHeight = useMemo(() => {
    let height = 0;

    for (let i = 0; i < rows.length && height < TABLE_HEIGHT; i++) {
      height += getItemSize(i);
    }

    return Math.min(TABLE_HEIGHT, height);
  }, [rows.length, getItemSize]);
  const listHeight = useHeightWhileSearching(
    contentHeight + 2 * FOCUS_RING_ROOM,
    isSearching
  );

  const itemData = useMemo(() => {
    return {
      rows,
      prepareRow,
      tableColumnsMeta,
      rowHeight,
      groupingLevels,
      className: classes.mobileRow,
    };
  }, [
    rows,
    prepareRow,
    tableColumnsMeta,
    rowHeight,
    groupingLevels,
    classes.mobileRow,
  ]);

  return (
    <Box
      className={classes.list}
      style={{ height: fillsTile ? undefined : listHeight }}
    >
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) => (
          <VariableSizeList
            ref={listRef}
            height={height}
            itemCount={rows.length}
            itemSize={getItemSize}
            width={width}
            outerElementType={MobileListScrollArea}
            innerElementType={MobileList}
            itemData={itemData}
          >
            {MobileRow}
          </VariableSizeList>
        )}
      </AutoSizer>
    </Box>
  );
};

type MobileRowData = {
  rows: Row<Observation>[];
  prepareRow: (row: Row<Observation>) => void;
  tableColumnsMeta: TableChartState["tableColumnsMeta"];
  rowHeight: number;
  groupingLevels: number;
  className: string;
};

const MobileRow = ({
  index,
  style,
  data,
}: ListChildComponentProps<MobileRowData>) => {
  const row = data.rows[index];
  data.prepareRow(row);

  return (
    <Box
      component="li"
      aria-setsize={data.rows.length}
      aria-posinset={index + 1}
      className={data.className}
      {...row.getRowProps({
        style: { ...style, flexDirection: "column", width: "100%" },
      })}
      role={undefined}
    >
      {row.subRows.length === 0 ? (
        <Box component="dl" sx={{ m: 0 }}>
          {row.cells.map((cell, i) => (
            <Flex
              key={i}
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
                sx={{ fontWeight: "bold", mr: 2, whiteSpace: "nowrap" }}
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
                  columnMeta={data.tableColumnsMeta[cell.column.id]}
                />
              </Flex>
            </Flex>
          ))}
        </Box>
      ) : (
        <Flex sx={{ height: data.rowHeight, ml: `${row.depth * 12}px` }}>
          <GroupHeader row={row} groupingLevels={data.groupingLevels} />
        </Flex>
      )}
    </Box>
  );
};

const MobileListScrollArea = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function MobileListScrollArea(props, ref) {
  const { tableLabel } = useChartState() as TableChartState;

  return (
    <Box
      ref={ref}
      {...props}
      role="region"
      aria-label={tableLabel}
      tabIndex={0}
      sx={{ "&:focus-visible": { outline: "none" } }}
    />
  );
});

const MobileList = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLUListElement>
>(function MobileList({ style, ...props }, ref) {
  return (
    <ul
      ref={ref}
      {...props}
      // Safari drops list semantics from lists without bullets.
      role="list"
      style={{ ...style, margin: 0, padding: 0, listStyle: "none" }}
    />
  );
});

import { Box, TableSortLabel, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { HeaderGroup } from "react-table";

import { SORTING_ARROW_WIDTH } from "@/charts/table/constants";
import { ColumnMeta } from "@/charts/table/table-state";
import { Flex } from "@/components/flex";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { Observation } from "@/domain/data";

/** Workaround because react-window can't pass props to inner element */
type TableContentProps = {
  headerGroups: HeaderGroup<Observation>[];
  tableColumnsMeta: Record<string, ColumnMeta>;
  customSortCount: number;
  totalColumnsWidth: number;
  handleSortClick?: (columnId: string) => void;
  manualSortBy?: Array<{ id: string; desc: boolean }>;
};

const TableContentContext = createContext<TableContentProps | undefined>(
  undefined
);

export const TableContentProvider = ({
  headerGroups,
  tableColumnsMeta,
  customSortCount,
  totalColumnsWidth,
  handleSortClick,
  manualSortBy,
  children,
}: TableContentProps & { children: ReactNode }) => {
  const value = useMemo(() => {
    return {
      headerGroups,
      tableColumnsMeta,
      customSortCount,
      totalColumnsWidth,
      handleSortClick,
      manualSortBy,
    };
  }, [
    headerGroups,
    tableColumnsMeta,
    customSortCount,
    totalColumnsWidth,
    handleSortClick,
    manualSortBy,
  ]);

  return (
    <TableContentContext.Provider value={value}>
      {children}
    </TableContentContext.Provider>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  headerGroup: {
    margin: 0,
    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
    borderTop: "1px solid",
    borderBottom: "1px solid",
    borderTopColor: theme.palette.monochrome[300],
    borderBottomColor: theme.palette.monochrome[300],
    fontWeight: "bold",
    fontSize: "0.875rem",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.grey[700],
    minHeight: SORTING_ARROW_WIDTH,
    alignItems: "center",
    justifyContent: "flex-start",
    whiteSpace: "nowrap",
  },
  headerGroupMeasure: {
    justifyContent: "flex-end",
  },
}));

export const TableContent = ({ children }: { children: ReactNode }) => {
  const ctx = useContext(TableContentContext);
  const classes = useStyles();

  if (!ctx) {
    throw Error("Please wrap TableContent in TableContentProvider");
  }

  const {
    headerGroups,
    tableColumnsMeta,
    customSortCount,
    totalColumnsWidth,
    handleSortClick,
    manualSortBy,
  } = ctx;

  return (
    <>
      <Box sx={{ position: "sticky", top: 0, zIndex: 1 }}>
        {headerGroups.map((headerGroup) => {
          return (
            // getHeaderGroupProps() returns props with key
            // eslint-disable-next-line react/jsx-key
            <Box {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                const { dim, columnComponentType } =
                  tableColumnsMeta[column.id];

                // For manual sorting (server-side), check manualSortBy state
                const manualSort = manualSortBy?.find(
                  (s) => s.id === column.id
                );
                const isManualSorted = !!manualSort;
                const manualSortDirection = manualSort?.desc ? "desc" : "asc";

                // For react-table sorting (client-side), use existing logic
                const isCustomSorted = column.sortedIndex < customSortCount;

                const isActive = handleSortClick
                  ? isManualSorted
                  : isCustomSorted;
                const direction = handleSortClick
                  ? manualSortDirection
                  : column.isSortedDesc
                    ? "desc"
                    : "asc";

                return (
                  // eslint-disable-next-line react/jsx-key
                  <Flex
                    className={clsx(
                      classes.headerGroup,
                      columnComponentType === "NumericalMeasure"
                        ? classes.headerGroupMeasure
                        : undefined
                    )}
                  >
                    <TableSortLabel
                      active={isActive}
                      direction={direction}
                      onClick={() => handleSortClick?.(column.id)}
                    >
                      <OpenMetadataPanelWrapper component={dim}>
                        <span style={{ fontWeight: "bold" }}>
                          {column.render("Header")}
                        </span>
                      </OpenMetadataPanelWrapper>
                    </TableSortLabel>
                  </Flex>
                );
              })}
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          position: "relative",
          minWidth: totalColumnsWidth,
          width: "100%",
        }}
      >
        {children}
      </Box>
    </>
  );
};

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
};

const TableContentContext = createContext<TableContentProps | undefined>(
  undefined
);

export const TableContentProvider = ({
  headerGroups,
  tableColumnsMeta,
  customSortCount,
  totalColumnsWidth,
  children,
}: TableContentProps & { children: ReactNode }) => {
  const value = useMemo(() => {
    return {
      headerGroups,
      tableColumnsMeta,
      customSortCount,
      totalColumnsWidth,
    };
  }, [headerGroups, tableColumnsMeta, customSortCount, totalColumnsWidth]);

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

  const { headerGroups, tableColumnsMeta, customSortCount, totalColumnsWidth } =
    ctx;

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
                // We assume that the customSortCount items are at the beginning of the sorted array, so any item with a lower index must be a custom sorted one
                const isCustomSorted = column.sortedIndex < customSortCount;

                return (
                  // eslint-disable-next-line react/jsx-key
                  <Flex
                    className={clsx(
                      classes.headerGroup,
                      columnComponentType === "NumericalMeasure"
                        ? classes.headerGroupMeasure
                        : undefined
                    )}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    <TableSortLabel
                      active={isCustomSorted}
                      direction={column.isSortedDesc ? "desc" : "asc"}
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

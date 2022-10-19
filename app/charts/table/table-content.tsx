import { Box, TableSortLabel, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, { useMemo, useContext } from "react";
import { HeaderGroup } from "react-table";

import { MaybeTooltip } from "@/utils/maybe-tooltip";

import Flex from "../../components/flex";
import { Observation } from "../../domain/data";

import { SORTING_ARROW_WIDTH } from "./constants";
import { ColumnMeta } from "./table-state";

/** Workaround because react-window can't pass props to inner element */
type TableContentProps = {
  headerGroups: HeaderGroup<Observation>[];
  tableColumnsMeta: Record<string, ColumnMeta>;
  customSortCount: number;
  totalColumnsWidth: number;
};
const TableContentContext = React.createContext<TableContentProps | undefined>(
  undefined
);

export const TableContentProvider = ({
  headerGroups,
  tableColumnsMeta,
  customSortCount,
  totalColumnsWidth,
  children,
}: TableContentProps & { children: React.ReactNode }) => {
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
    borderTopColor: theme.palette.grey[700],
    borderBottomColor: theme.palette.grey[700],
    fontWeight: "bold",
    fontSize: "0.875rem",
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.grey[700],
    minHeight: SORTING_ARROW_WIDTH,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerGroupMeasure: {
    justifyContent: "flex-end",
  },
}));

export const TableContent = ({ children }: { children: React.ReactNode }) => {
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
                const { columnComponentType, description } =
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
                      <MaybeTooltip text={description}>
                        <span
                          style={{
                            textDecoration: description
                              ? "underline"
                              : undefined,
                          }}
                        >
                          {column.render("Header")}
                        </span>
                      </MaybeTooltip>
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

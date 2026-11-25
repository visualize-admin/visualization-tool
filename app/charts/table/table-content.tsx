import { t } from "@lingui/macro";
import { Box, TableSortLabel, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { HeaderGroup } from "react-table";

import { SORTING_ARROW_WIDTH } from "@/charts/table/constants";
import { ColumnMeta } from "@/charts/table/table-state";
import { columnCanBeWidthLimited } from "@/charts/table/width-limit";
import { Flex } from "@/components/flex";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { OverflowTooltip } from "@/components/overflow-tooltip";
import { Observation } from "@/domain/data";

type TableAriaProps = {
  "aria-label": string;
  "aria-rowcount": number;
  "aria-colcount": number;
};

/** Workaround because react-window can't pass props to inner element */
type TableContentProps = {
  headerGroups: HeaderGroup<Observation>[];
  tableColumnsMeta: Record<string, ColumnMeta>;
  customSortCount: number;
  totalColumnsWidth: number;
  shouldApplyWidthLimits: boolean;
  tableAriaProps: TableAriaProps;
  header: { height: number; ref: (element: HTMLDivElement | null) => void };
};

const TableContentContext = createContext<TableContentProps | undefined>(
  undefined
);

export const TableContentProvider = ({
  headerGroups,
  tableColumnsMeta,
  customSortCount,
  totalColumnsWidth,
  shouldApplyWidthLimits,
  tableAriaProps,
  header,
  children,
}: TableContentProps & { children: ReactNode }) => {
  const value = useMemo(() => {
    return {
      headerGroups,
      tableColumnsMeta,
      customSortCount,
      totalColumnsWidth,
      shouldApplyWidthLimits,
      tableAriaProps,
      header,
    };
  }, [
    headerGroups,
    tableColumnsMeta,
    customSortCount,
    totalColumnsWidth,
    shouldApplyWidthLimits,
    tableAriaProps,
    header,
  ]);

  return (
    <TableContentContext.Provider value={value}>
      {children}
    </TableContentContext.Provider>
  );
};

export const useTableContent = () => {
  const ctx = useContext(TableContentContext);

  if (!ctx) {
    throw Error("Please wrap TableContent in TableContentProvider");
  }

  return ctx;
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
  const classes = useStyles();
  const {
    headerGroups,
    tableColumnsMeta,
    customSortCount,
    totalColumnsWidth,
    shouldApplyWidthLimits,
    header,
  } = useTableContent();

  return (
    <>
      <Box
        ref={header.ref}
        role="rowgroup"
        sx={{ position: "sticky", top: 0, zIndex: 1 }}
      >
        {headerGroups.map((headerGroup) => {
          return (
            // getHeaderGroupProps() returns props with key
            // eslint-disable-next-line react/jsx-key
            <Box {...headerGroup.getHeaderGroupProps()} aria-rowindex={1}>
              {headerGroup.headers.map((column) => {
                const { type, dim, columnComponentType } =
                  tableColumnsMeta[column.id];
                // We assume that the customSortCount items are at the beginning of the sorted array, so any item with a lower index must be a custom sorted one
                const isCustomSorted =
                  column.isSorted && column.sortedIndex < customSortCount;
                const hasWidthLimit =
                  shouldApplyWidthLimits && columnCanBeWidthLimited(type);
                const headerText = `${column.Header}`;
                const { onClick: toggleSort } = column.getSortByToggleProps();

                return (
                  // eslint-disable-next-line react/jsx-key
                  <Flex
                    className={clsx(
                      classes.headerGroup,
                      columnComponentType === "NumericalMeasure"
                        ? classes.headerGroupMeasure
                        : undefined
                    )}
                    {...column.getHeaderProps()}
                    aria-label={headerText}
                    aria-sort={getAriaSort(column)}
                    onClick={toggleSort}
                    title={headerText}
                    sx={{ cursor: column.canSort ? "pointer" : undefined }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        ...(hasWidthLimit && { minWidth: 0 }),
                      }}
                    >
                      <OpenMetadataPanelWrapper component={dim}>
                        {hasWidthLimit ? (
                          <OverflowTooltip arrow title={headerText}>
                            <Typography
                              component="span"
                              variant="inherit"
                              noWrap
                              sx={{ fontWeight: "bold", lineHeight: 1.5 }}
                            >
                              {column.render("Header")}
                            </Typography>
                          </OverflowTooltip>
                        ) : (
                          <Box
                            component="span"
                            sx={{ fontWeight: "bold", lineHeight: 1.5 }}
                          >
                            {column.render("Header")}
                          </Box>
                        )}
                      </OpenMetadataPanelWrapper>
                    </Box>
                    {column.canSort ? (
                      <TableSortLabel
                        component="button"
                        type="button"
                        active={isCustomSorted}
                        direction={column.isSortedDesc ? "desc" : "asc"}
                        aria-label={t({
                          id: "table.sort.by",
                          message: `Sort by ${headerText}`,
                        })}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSort?.(e);
                        }}
                        sx={{
                          flexShrink: 0,
                          margin: "0 0 0 2px",
                          padding: "4px",
                          "& .MuiTableSortLabel-icon": { margin: 0 },
                          "& svg": {
                            opacity: isCustomSorted ? 1 : 0.5,
                          },
                        }}
                      />
                    ) : null}
                  </Flex>
                );
              })}
            </Box>
          );
        })}
      </Box>
      <Box
        role="rowgroup"
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

const getAriaSort = (column: HeaderGroup<Observation>) => {
  if (column.sortedIndex !== 0) {
    return undefined;
  }

  return column.isSortedDesc ? "descending" : "ascending";
};

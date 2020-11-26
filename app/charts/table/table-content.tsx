import { Box, Flex } from "theme-ui";
import * as React from "react";
import { HeaderGroup } from "react-table";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
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
  const value = React.useMemo(() => {
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

export const TableContent = ({ children }: { children: React.ReactNode }) => {
  const ctx = React.useContext(TableContentContext);

  if (!ctx) {
    throw Error("Please wrap TableContent in TableContentProvider");
  }

  const {
    headerGroups,
    tableColumnsMeta,
    customSortCount,
    totalColumnsWidth,
  } = ctx;

  return (
    <>
      <Box sx={{ position: "sticky", top: 0, zIndex: 1 }}>
        {headerGroups.map((headerGroup) => {
          return (
            <Box {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, i) => {
                const { columnComponentType } = tableColumnsMeta[column.id];

                // We assume that the customSortCount items are at the beginning of the sorted array, so any item with a lower index must be a custom sorted one
                const isCustomSorted = column.sortedIndex < customSortCount;

                return (
                  <Box
                    sx={{
                      m: 0,
                      py: 2,
                      px: 3,
                      borderTop: "1px solid",
                      borderTopColor: "monochrome700",
                      borderBottom: "1px solid",
                      borderBottomColor: "monochrome700",
                      fontWeight: "bold",
                      fontSize: 3,
                      bg: "monochrome100",
                      color: "monochrome700",
                    }}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    <Flex
                      sx={{
                        minHeight: SORTING_ARROW_WIDTH,
                        alignItems: "center",
                        justifyContent:
                          columnComponentType === "Measure"
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      <Box>{column.render("Header")}</Box>
                      {isCustomSorted && (
                        <Box
                          sx={{
                            width: SORTING_ARROW_WIDTH,
                            flexShrink: 0,
                            mr: "-11px",
                          }}
                        >
                          <Icon
                            name={
                              column.isSortedDesc
                                ? "sortDescending"
                                : "sortAscending"
                            }
                            size={SORTING_ARROW_WIDTH}
                          />
                        </Box>
                      )}
                    </Flex>
                  </Box>
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

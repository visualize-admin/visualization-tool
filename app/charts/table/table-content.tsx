import Flex from "@/components/flex";
import { Box } from "@mui/material";
import * as React from "react";
import { HeaderGroup } from "react-table";
import { Observation } from "@/domain/data";
import { Icon } from "@/icons";
import { SORTING_ARROW_WIDTH } from "@/charts/table/constants";
import { ColumnMeta } from "@/charts/table/table-state";

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
              {headerGroup.headers.map((column, i) => {
                const { columnComponentType } = tableColumnsMeta[column.id];

                // We assume that the customSortCount items are at the beginning of the sorted array, so any item with a lower index must be a custom sorted one
                const isCustomSorted = column.sortedIndex < customSortCount;

                return (
                  // eslint-disable-next-line react/jsx-key
                  <Box
                    sx={{
                      m: 0,
                      py: 2,
                      px: 3,
                      borderTop: "1px solid",
                      borderTopColor: "grey.700",
                      borderBottom: "1px solid",
                      borderBottomColor: "grey.700",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      backgroundColor: "grey.100",
                      color: "grey.700",
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

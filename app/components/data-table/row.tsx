// @ts-nocheck
import { Box } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Data, GROUPED_COLOR } from "../../pages/[locale]/_table-a";
import { ColumnStyle } from "./column-formatting";

export const RowUI = ({
  row,
  prepareRow,
  columnStyles,
}: {
  row: Row<Data>;
  prepareRow: (row: Row<Data>) => void;
  columnStyles: ColumnStyle[];
}) => {
  prepareRow(row);
  return (
    <>
      <tr
        {...row.getRowProps()}
        style={{
          color: "#333333",
        }}
      >
        {/* No grouping level */}
        {row.subRows.length === 0 ? (
          <>
            {row.cells.map((cell, i) => {
              return (
                <td
                  style={{
                    color:
                      columnStyles.find((c) => c.id === cell.column.id) &&
                      columnStyles.find((c) => c.id === cell.column.id)
                        ?.textColor
                        ? columnStyles.find((c) => c.id === cell.column.id)
                            ?.textColor
                        : "#333333",
                    background:
                      cell.isGrouped || cell.isPlaceholder
                        ? GROUPED_COLOR
                        : columnStyles.find((c) => c.id === cell.column.id) &&
                          columnStyles.find((c) => c.id === cell.column.id)
                            ?.columnColor
                        ? columnStyles.find((c) => c.id === cell.column.id)
                            ?.columnColor
                        : "white",
                    fontWeight:
                      columnStyles.find((c) => c.id === cell.column.id) &&
                      columnStyles.find((c) => c.id === cell.column.id)
                        ?.textStyle === "bold"
                        ? 800
                        : 400,
                  }}
                  {...cell.getCellProps()}
                >
                  {cell.render("Cell")}
                </td>
              );
            })}
          </>
        ) : (
          <Box
            as="td"
            sx={{
              fontWeight: 900,
              color: "#222222",
              borderBottom: 0,
            }}
          >
            {row.groupByVal}
          </Box>
        )}
      </tr>
      {/* There's a subgroup */}
      {row.subRows.length > 0 &&
        row.subRows.map((subRow) => {
          return (
            <RowUI
              row={subRow}
              prepareRow={prepareRow}
              columnStyles={columnStyles}
            />
          );
        })}
    </>
  );
};

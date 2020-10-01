// @ts-nocheck
import { Box } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Data, GROUPED_COLOR } from "../../pages/[locale]/_table-a";

type ColumnStyle = {
  columnId: string;
  style: string;
  textStyle: "regular" | "bold";
};
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
  console.log(row);
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
                    background:
                      cell.isGrouped || cell.isPlaceholder
                        ? GROUPED_COLOR
                        : "white",
                    fontWeight:
                      columnStyles.find((c) => c.id === cell.column.id)
                        ?.textStyle === "bold"
                        ? 800
                        : 500,
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
          return <RowUI row={subRow} prepareRow={prepareRow} />;
        })}
    </>
  );
};

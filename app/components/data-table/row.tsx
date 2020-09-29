// @ts-nocheck
import * as React from "react";
import { Row } from "react-table";
import { Data, GROUPED_COLOR } from "../../pages/[locale]/_table-a";

export const RowUI = ({
  row,
  prepareRow,
}: {
  row: Row<Data>;
  prepareRow: (row: Row<Data>) => void;
}) => {
  prepareRow(row);
  return (
    <>
      <tr
        {...row.getRowProps()}
        style={{
          color: row.isGrouped ? "sienna" : "#333333",
          fontWeight: row.isGrouped ? 600 : 400,
        }}
      >
        {row.cells.map((cell, i) => {
          return (
            <td
              style={{
                background:
                  cell.isGrouped || cell.isPlaceholder
                    ? GROUPED_COLOR
                    : "white",
              }}
              {...cell.getCellProps()}
            >
              {cell.render("Cell")}
            </td>
          );
        })}
      </tr>
      {row.subRows &&
        row.subRows.map((subRow) => {
          prepareRow(subRow);
          return <RowUI row={subRow} prepareRow={prepareRow} />;
        })}
    </>
  );
};

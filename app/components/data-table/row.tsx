// @ts-nocheck
import * as React from "react";
import { Row } from "react-table";
import { Data, GROUPED_COLOR } from "../../pages/[locale]/_table-a";
import {
  Box,
  Checkbox,
  Flex,
  Grid,
  Label,
  Radio,
  Text,
} from "@theme-ui/components";
export const RowUI = ({
  row,
  prepareRow,
}: {
  row: Row<Data>;
  prepareRow: (row: Row<Data>) => void;
}) => {
  prepareRow(row);

  console.log(row.depth);

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

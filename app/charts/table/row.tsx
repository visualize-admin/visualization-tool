import { Box } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Data } from "../../pages/[locale]/_table-prototype";

import { useFormatNumber } from "../../domain/helpers";
import { Observation } from "../../domain/data";
import { TextCell } from "./cell";

export const RowUI = ({
  row,
  prepareRow,
}: {
  row: Row<Observation>;
  prepareRow: (row: Row<Observation>) => void;
}) => {
  prepareRow(row);
  const formatNumber = useFormatNumber();
  // console.log({ row });
  return (
    <tr {...row.getRowProps()}>
      {row.cells.map((cell, i) => {
        // console.log(cell.value);
        return (
          <Box
            as="td"
            sx={
              {
                // color: cellTextColor,
                // background: cellBgColor,
                // textAlign: typeof cell.value === "number" ? "right" : "left",
                // fontWeight:
                //   thisCell && thisCell?.textStyle === "bold" ? 800 : 400,
              }
            }
            {...cell.getCellProps()}
          >
            {cell.render("Cell")}
            {/* // <TextCell
          //   value={
          //     typeof cell.value === "number"
          //       ? formatNumber(cell.value)
          //       : cell.value
          //   }
          //   styles={{
          //     color: "#333333",
          //     bg: "#F5F5F5",
          //     textAlign: "left",
          //     fontWeight: "regular",
          //   }}
          //   {...cell.getCellProps()}
          // /> */}
          </Box>
        );
      })}
    </tr>
  );
};

const GroupHeaderRow = ({
  row,
  columnStyles,
}: {
  row: Row<Data>;
  columnStyles: ColumnStyle[];
}) => {
  const thisCell = columnStyles.find((c) => c.id === row.groupByID);

  const cellTextColor =
    thisCell && thisCell?.textColor ? thisCell?.textColor : "#333333";
  const cellBgColor =
    thisCell && thisCell?.columnColor ? thisCell?.columnColor : "muted";
  const cellTagColor =
    thisCell && thisCell?.colorRange && thisCell?.domain
      ? thisCell.colorRange(row.groupByVal)
      : "#333333";

  return (
    <>
      {/* TEXT Formatting */}
      {thisCell && thisCell?.style === "text" && (
        <Box
          as="td"
          sx={{
            color: cellTextColor,
            borderBottom: 0,
            background: "muted",
            textAlign: "left",
            fontWeight: thisCell && thisCell?.textStyle === "bold" ? 800 : 400,
          }}
          // {...row.getCellProps()}
        >
          {row.groupByVal}
        </Box>
      )}

      {
        // KATEGORY FORMATTING
        thisCell && thisCell?.style === "category" && (
          <Box
            as="td"
            sx={{
              color: "#333333",
              background: "muted",
              borderBottom: 0,
              fontWeight:
                columnStyles.find((c) => c.id === row.groupById) &&
                thisCell?.textStyle === "bold"
                  ? 800
                  : 400,
            }}
            // {...row.getCellProps()}
          >
            <Box
              as="span"
              sx={{
                background: cellTagColor,
                borderRadius: "15px",
                px: 3,
                py: 1,
                my: 1,
              }}
            >
              {row.groupByVal}
            </Box>
          </Box>
        )
      }
      {/* <Box
        as="td"
        sx={{
          fontWeight: 900,
          color: "#222222",
          borderBottom: 0,
        }}
      >
        {row.groupByVal}
      </Box> */}
    </>
  );
};

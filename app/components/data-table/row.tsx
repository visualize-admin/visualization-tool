// @ts-nocheck
import { Box } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Data, GROUPED_COLOR } from "../../pages/[locale]/_table-a";
import { ColumnStyle } from "./column-formatting";
import { useFormatNumber } from "../../domain/helpers";

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
  const formatNumber = useFormatNumber();

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
              const thisCell = columnStyles.find(
                (c) => c.id === cell.column.id
              );

              // console.log(thisCell?.colorRange.domain());
              const cellTextColor =
                thisCell && thisCell?.textColor
                  ? thisCell?.textColor
                  : "#333333";
              const cellBgColor =
                cell.isGrouped || cell.isPlaceholder
                  ? GROUPED_COLOR
                  : thisCell && thisCell?.columnColor
                  ? thisCell?.columnColor
                  : "white";
              const cellTagColor =
                thisCell && thisCell?.colorRange && thisCell?.domain
                  ? columnStyles
                      .find((c) => c.id === cell.column.id)
                      ?.colorRange(cell.value)
                  : "#333333";
              return (
                <>
                  {/* TEXT Formatting */}
                  {thisCell && thisCell?.style === "text" && (
                    <td
                      style={{
                        color: cellTextColor,
                        background: cellBgColor,
                        textAlign:
                          typeof cell.value === "number" ? "right" : "left",
                        fontWeight:
                          thisCell && thisCell?.textStyle === "bold"
                            ? 800
                            : 400,
                      }}
                      {...cell.getCellProps()}
                    >
                      {typeof cell.value === "number"
                        ? formatNumber(cell.value)
                        : cell.value}
                    </td>
                  )}

                  {
                    // KATEGORY FORMATTING
                    thisCell && thisCell?.style === "category" && (
                      <td
                        style={{
                          color: "#333333",
                          background: "white",
                          fontWeight:
                            columnStyles.find((c) => c.id === cell.column.id) &&
                            thisCell?.textStyle === "bold"
                              ? 800
                              : 400,
                        }}
                        {...cell.getCellProps()}
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
                          {typeof cell.value === "number"
                            ? formatNumber(cell.value)
                            : cell.value}
                        </Box>
                      </td>
                    )
                  }
                  {
                    // Heatmap FORMATTING
                    thisCell && thisCell?.style === "heatmap" && (
                      <td
                        style={{
                          color: "#000000",
                          background: thisCell.colorRange(cell.value),
                          fontWeight:
                            thisCell && thisCell?.textStyle === "bold"
                              ? 800
                              : 400,
                        }}
                        {...cell.getCellProps()}
                      >
                        {typeof cell.value === "number"
                          ? formatNumber(cell.value)
                          : cell.value}
                      </td>
                    )
                  }
                  {
                    // Bar Chart FORMATTING
                    thisCell && thisCell?.style === "bar" && (
                      <td
                        style={{
                          color: "#333333",
                          background: "white",
                          fontWeight:
                            thisCell && thisCell?.textStyle === "bold"
                              ? 800
                              : 400,
                        }}
                        {...cell.getCellProps()}
                      >
                        <Box>
                          {typeof cell.value === "number"
                            ? formatNumber(cell.value)
                            : cell.value}
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            height: "16px",
                            position: "relative",
                            backgroundColor: thisCell.barBackground,
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: `${thisCell.barScale(cell.value)}%`,
                              height: "16px",
                              backgroundColor: thisCell.barColor,
                            }}
                          />
                        </Box>
                      </td>
                    )
                  }
                </>
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

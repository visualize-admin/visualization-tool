import { Box } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Data } from "../../pages/[locale]/_table-prototype";

import { useFormatNumber } from "../../domain/helpers";
import { Observation } from "../../domain/data";
import { TagCell, TextCell } from "./cell";
import { useChartState } from "../shared/use-chart-state";
import { ColumnStyle } from "../table-prototype/column-formatting";
import { TableChartState } from "./table-state";

export const RowUI = ({
  row,
  prepareRow,
}: {
  row: Row<Observation>;
  prepareRow: (row: Row<Observation>) => void;
}) => {
  const { columnStyles } = useChartState() as TableChartState;
  const formatNumber = useFormatNumber();

  prepareRow(row);

  return (
    <tr {...row.getRowProps()}>
      {row.cells.map((cell, i) => {
        const {
          columnStyle,
          textStyle,
          textColor,
          columnColor,
          colorScale,
        } = columnStyles["".concat(`${cell.column.Header}`)];
        return (
          <>
            {columnStyle === "text" ? (
              <TextCell
                value={
                  typeof cell.value === "number"
                    ? formatNumber(cell.value)
                    : cell.value
                }
                styles={{
                  color: textColor,
                  bg: columnColor,
                  textAlign: typeof cell.value === "number" ? "right" : "left",
                  fontWeight: textStyle,
                }}
                {...cell.getCellProps()}
              />
            ) : columnStyle === "category" ? (
              <TagCell
                value={cell.value}
                styles={{ fontWeight: textStyle }}
                tagColor={colorScale(cell.value)}
                {...cell.getCellProps()}
              />
            ) : columnStyle === "heatmap" ? (
              <TextCell
                value={formatNumber(cell.value)}
                styles={{
                  color: textColor,
                  bg: colorScale(cell.value),
                  textAlign: "right",
                  fontWeight: textStyle,
                }}
                {...cell.getCellProps()}
              />
            ) : (
              <TextCell
                value={
                  typeof cell.value === "number"
                    ? formatNumber(cell.value)
                    : cell.value
                }
                styles={{
                  color: textColor,
                  bg: columnColor,
                  textAlign: typeof cell.value === "number" ? "right" : "left",
                  fontWeight: textStyle,
                }}
                {...cell.getCellProps()}
              />
            )}
          </>
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

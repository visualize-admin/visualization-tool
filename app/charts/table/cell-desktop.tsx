import { Box, Flex } from "theme-ui";
import { hcl, ScaleLinear } from "d3";
import * as React from "react";
import { Cell } from "react-table";
import { useFormatNumber } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { BAR_CELL_PADDING } from "./constants";
import { ColumnMeta } from "./table-state";
import { Tag } from "./tag";

export const CellDesktop = ({
  cell,
  columnMeta,
}: {
  cell: Cell<Observation>;
  columnMeta: ColumnMeta;
}) => {
  const formatNumber = useFormatNumber();

  const {
    columnComponentType,
    type,
    textStyle,
    textColor,
    columnColor,
    colorScale,
    barColorPositive,
    barColorNegative,
    barColorBackground,
    barShowBackground,
    widthScale,
  } = columnMeta;

  switch (type) {
    case "text":
      return (
        <Flex
          sx={{
            alignItems: "center",
            justifyContent:
              columnComponentType === "Measure" ? "flex-end" : "flex-start",
            color: textColor,
            bg: columnColor,
            fontWeight: textStyle,
            px: 3,
          }}
          {...cell.getCellProps()}
        >
          {columnComponentType === "Measure"
            ? formatNumber(cell.value)
            : cell.render("Cell")}
        </Flex>
      );
    case "category":
      return (
        <Flex
          sx={{ alignItems: "center", fontWeight: textStyle, pl: 1, pr: 3 }}
          {...cell.getCellProps()}
        >
          <Tag tagColor={colorScale ? colorScale(cell.value) : "primaryLight"}>
            {cell.render("Cell")}
          </Tag>
        </Flex>
      );
    case "heatmap":
      const isNull = cell.value === null;
      return (
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "flex-end",
            color: isNull
              ? textColor
              : hcl(colorScale ? colorScale(cell.value) : textColor).l < 55
              ? "#fff"
              : "#000",
            bg: isNull
              ? "monochrome100"
              : colorScale
              ? colorScale(cell.value)
              : "monochrome100",
            textAlign: "right",
            fontWeight: textStyle,
            px: 3,
          }}
          {...cell.getCellProps()}
        >
          {formatNumber(cell.value)}
        </Flex>
      );
    case "bar":
      return (
        <Flex
          sx={{
            flexDirection: "column",
            justifyContent: "center",
            // Padding is a constant accounted for in the
            // widthScale domain (see table state).
            px: BAR_CELL_PADDING,
          }}
          {...cell.getCellProps()}
        >
          <Box>{formatNumber(cell.value)}</Box>
          {cell.value !== null && widthScale && (
            <Box
              sx={{
                width: widthScale.range()[1],
                height: 18,
                position: "relative",
                bg: barShowBackground ? barColorBackground : "monochrome100",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: getBarLeftOffset(cell.value, widthScale), //widthScale(Math.max(widthScale.domain()[0], 0)),
                  width: getBarWidth(cell.value, widthScale), // widthScale(cell.value) - widthScale(0),
                  height: 18,
                  bg: cell.value > 0 ? barColorPositive : barColorNegative,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "-2px",
                  left:
                    cell.value < 0
                      ? widthScale(0)
                      : getBarLeftOffset(cell.value, widthScale), //widthScale(Math.max(widthScale.domain()[0], 0)),
                  width: "1px",
                  height: 22,
                  bg: "monochrome700",
                }}
              />
            </Box>
          )}
          {/* {cell.value !== null && cell.value < 0 && widthScale && (
            <Box
              sx={{
                width: widthScale.range()[1],
                height: 18,
                position: "relative",
                bg: barShowBackground ? barColorBackground : "monochrome100",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: widthScale(cell.value),
                  width: widthScale(Math.abs(cell.value)) - widthScale(0),
                  height: 18,
                  bg: cell.value > 0 ? barColorPositive : barColorNegative,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "-2px",
                  left: widthScale(0),
                  width: "1px",
                  height: 22,
                  bg: "monochrome700",
                }}
              />
            </Box>
          )} */}
        </Flex>
      );
    default:
      return (
        <Flex
          sx={{
            alignItems: "center",
            justifyContent:
              columnComponentType === "Measure" ? "flex-end" : "flex-start",
            color: textColor,
            bg: columnColor,
            textAlign: columnComponentType === "Measure" ? "right" : "left",
            fontWeight: textStyle,
            px: 3,
            "&:first-of-type": {
              pl: 0,
            },
            "&:last-of-type": {
              pr: 0,
            },
          }}
          {...cell.getCellProps()}
        >
          {columnComponentType === "Measure"
            ? formatNumber(cell.value)
            : cell.render("Cell")}
        </Flex>
      );
  }
};

export const getBarLeftOffset = (
  v: number,
  scale: ScaleLinear<number, number>
): number => {
  if (v >= 0) {
    return scale(Math.max(scale.domain()[0], 0));
  } else if (v < 0) {
    return scale(v);
  } else {
    return scale(Math.max(scale.domain()[0], 0));
  }
};

export const getBarWidth = (
  v: number,
  scale: ScaleLinear<number, number>
): number => {
  if (v >= 0) {
    return scale(v) - scale(Math.max(scale.domain()[0], 0));
  } else if (v < 0) {
    return scale(Math.abs(v)) - scale(0);
  } else {
    return scale(v) - scale(0);
  }
};

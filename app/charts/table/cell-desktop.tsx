import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { hcl, ScaleLinear } from "d3";
import * as React from "react";
import { Cell } from "react-table";

import { BAR_CELL_PADDING } from "@/charts/table/constants";
import { ColumnMeta } from "@/charts/table/table-state";
import { Tag } from "@/charts/table/tag";
import Flex from "@/components/flex";
import { Observation } from "@/domain/data";

const useStyles = makeStyles({
  heatmapCell: {
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "right",
    px: 3,
  },
  defaultCell: {
    alignItems: "center",
    px: 3,
    "&:first-of-type": {
      pl: 0,
    },
    "&:last-of-type": {
      pr: 0,
    },
  },
  barBackground: {
    position: "absolute",
    top: "-2px",
    width: "1px",
    height: 22,
    backgroundColor: "grey.700",
  },
  barForeground: {
    position: "absolute",
    top: 0,
    height: 18,
  },
});

export const CellDesktop = ({
  cell,
  columnMeta,
}: {
  cell: Cell<Observation>;
  columnMeta: ColumnMeta;
}) => {
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
  const classes = useStyles();

  switch (type) {
    case "text":
      return (
        <Flex
          sx={{
            alignItems: "center",
            justifyContent:
              columnComponentType === "Measure" ? "flex-end" : "flex-start",
            color: textColor,
            backgroundColor: columnColor,
            fontWeight: textStyle,
            px: 3,
          }}
          {...cell.getCellProps()}
        >
          {columnMeta.formatter(cell)}
        </Flex>
      );
    case "category":
      return (
        <Flex
          sx={{ alignItems: "center", fontWeight: textStyle, pl: 1, pr: 3 }}
          {...cell.getCellProps()}
        >
          <Tag tagColor={colorScale ? colorScale(cell.value) : "primaryLight"}>
            {columnMeta.formatter(cell)}
          </Tag>
        </Flex>
      );
    case "heatmap":
      const isNull = cell.value === null;
      return (
        <Flex
          className={classes.heatmapCell}
          sx={{
            color: isNull
              ? textColor
              : hcl(colorScale ? colorScale(cell.value) : textColor).l < 55
              ? "#fff"
              : "#000",
            backgroundColor: isNull
              ? "grey.100"
              : colorScale
              ? colorScale(cell.value)
              : "grey.100",
            fontWeight: textStyle,
          }}
          {...cell.getCellProps()}
        >
          {columnMeta.formatter(cell)}
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
            px: `${BAR_CELL_PADDING}px`,
          }}
          {...cell.getCellProps()}
        >
          <Box>{columnMeta.formatter(cell)}</Box>
          {cell.value !== null && widthScale && (
            <Box
              sx={{
                width: widthScale.range()[1],
                height: 18,
                position: "relative",
                backgroundColor: barShowBackground
                  ? barColorBackground
                  : "grey.100",
              }}
            >
              <Box
                className={classes.barForeground}
                sx={{
                  left: `${getBarLeftOffset(cell.value, widthScale)}px`,
                  width: `${getBarWidth(cell.value, widthScale)}px`,
                  backgroundColor:
                    cell.value > 0 ? barColorPositive : barColorNegative,
                }}
              />
              <Box
                className={classes.barBackground}
                sx={{
                  left: `${
                    cell.value < 0
                      ? widthScale(0)
                      : getBarLeftOffset(cell.value, widthScale)
                  }px`,
                }}
              />
            </Box>
          )}
        </Flex>
      );
    default:
      return (
        <Flex
          className={classes.defaultCell}
          sx={{
            justifyContent:
              columnComponentType === "Measure" ? "flex-end" : "flex-start",
            color: textColor,
            backgroundColor: columnColor,
            textAlign: columnComponentType === "Measure" ? "right" : "left",
            fontWeight: textStyle,
          }}
          {...cell.getCellProps()}
        >
          {columnMeta.formatter(cell)}
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

import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { hcl } from "d3-color";
import { ScaleLinear } from "d3-scale";
import { Cell } from "react-table";

import { useChartState } from "@/charts/shared/chart-state";
import { BAR_CELL_PADDING } from "@/charts/table/constants";
import { LinkedCellWrapper } from "@/charts/table/linked-cell-wrapper";
import { ColumnMeta, TableChartState } from "@/charts/table/table-state";
import { Tag } from "@/charts/table/tag";
import { Flex } from "@/components/flex";
import { OverflowTooltip } from "@/components/overflow-tooltip";
import { Observation } from "@/domain/data";

const useStyles = makeStyles((theme: Theme) => ({
  heatmapCell: {
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "right",
    padding: `0 ${theme.spacing(3)}`,
  },
  defaultCell: {
    alignItems: "center",
    paddingLeft: 0,
    "&:first-of-type": {
      paddingLeft: 0,
    },
    "&:last-of-type": {
      paddingRight: 0,
    },
  },
  barBackground: {
    position: "absolute",
    top: "-2px",
    width: "1px",
    height: 22,
    backgroundColor: theme.palette.grey[700],
  },
  barForeground: {
    position: "absolute",
    top: 0,
    height: 18,
  },
}));

export const CellDesktop = ({
  cell,
  columnMeta,
}: {
  cell: Cell<Observation>;
  columnMeta: ColumnMeta;
}) => {
  const {
    columnComponentType,
    textStyle,
    textColor,
    columnColor,
    barColorPositive,
    barColorNegative,
    barColorBackground,
    barShowBackground,
  } = columnMeta;
  const classes = useStyles();
  const { links, shouldApplyWidthLimits } = useChartState() as TableChartState;

  switch (columnMeta.type) {
    case "text":
      const textContent = columnMeta.formatter(cell);

      return (
        <Flex
          {...cell.getCellProps()}
          sx={{
            alignItems: "center",
            justifyContent:
              columnComponentType === "NumericalMeasure"
                ? "flex-end"
                : "flex-start",
            color: textColor,
            backgroundColor: columnColor,
            fontWeight: textStyle,
            px: 3,
          }}
        >
          <LinkedCellWrapper cell={cell} columnMeta={columnMeta} links={links}>
            {shouldApplyWidthLimits ? (
              <OverflowTooltip arrow title={textContent}>
                <Typography
                  component="span"
                  variant="inherit"
                  noWrap
                  sx={{ lineHeight: 1.5 }}
                >
                  {textContent}
                </Typography>
              </OverflowTooltip>
            ) : (
              <Box component="span" sx={{ lineHeight: 1.5 }}>
                {textContent}
              </Box>
            )}
          </LinkedCellWrapper>
        </Flex>
      );
    case "category":
      const { colorScale: cColorScale } = columnMeta;
      return (
        <Flex
          {...cell.getCellProps()}
          sx={{ alignItems: "center", fontWeight: textStyle, pl: 1, pr: 3 }}
        >
          <LinkedCellWrapper cell={cell} columnMeta={columnMeta} links={links}>
            <Tag tagColor={cColorScale(cell.value)}>
              {columnMeta.formatter(cell)}
            </Tag>
          </LinkedCellWrapper>
        </Flex>
      );
    case "heatmap":
      const { colorScale: hColorScale } = columnMeta;
      const isNull = cell.value === null;
      return (
        <Flex
          className={classes.heatmapCell}
          sx={{
            color: isNull
              ? textColor
              : hcl(hColorScale(cell.value)).l < 55
                ? "#fff"
                : "#000",
            backgroundColor: isNull ? "grey.100" : hColorScale(cell.value),
            fontWeight: textStyle,
          }}
          {...cell.getCellProps()}
        >
          <LinkedCellWrapper cell={cell} columnMeta={columnMeta} links={links}>
            {columnMeta.formatter(cell)}
          </LinkedCellWrapper>
        </Flex>
      );
    case "bar":
      const { widthScale } = columnMeta;
      return (
        <Flex
          sx={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            // Padding is a constant accounted for in the
            // widthScale domain (see table state).
            px: `${BAR_CELL_PADDING}px`,
          }}
          {...cell.getCellProps()}
        >
          <LinkedCellWrapper cell={cell} columnMeta={columnMeta} links={links}>
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
          </LinkedCellWrapper>
        </Flex>
      );
    default:
      return (
        <Flex
          className={classes.defaultCell}
          sx={{
            justifyContent:
              columnComponentType === "NumericalMeasure"
                ? "flex-end"
                : "flex-start",
            textAlign:
              columnComponentType === "NumericalMeasure" ? "right" : "left",
            color: textColor,
            backgroundColor: columnColor,
            fontWeight: textStyle,
          }}
          {...cell.getCellProps()}
        >
          <LinkedCellWrapper cell={cell} columnMeta={columnMeta} links={links}>
            {columnMeta.formatter(cell)}
          </LinkedCellWrapper>
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

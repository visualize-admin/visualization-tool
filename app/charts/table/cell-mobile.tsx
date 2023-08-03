import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { hcl } from "d3";
import { Cell, Row } from "react-table";

import { useChartState } from "@/charts/shared/chart-state";
import { getBarLeftOffset, getBarWidth } from "@/charts/table/cell-desktop";
import { ColumnMeta, TableChartState } from "@/charts/table/table-state";
import { Tag } from "@/charts/table/tag";
import Flex from "@/components/flex";
import { Observation } from "@/domain/data";
import { useFormatNumber } from "@/formatters";
import { Icon } from "@/icons";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: theme.palette.grey[800],
    fontSize: "0.75rem",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    margin: `0 ${theme.spacing(2)}`,
    "&:first-of-type": {
      paddingTop: 2,
    },
    "&:last-of-type": {
      borderBottom: "1px solid",
      borderBottomColor: theme.palette.grey[400],
      paddingBottom: theme.spacing(3),
    },
  },
}));

export const RowMobile = ({
  row,
  prepareRow,
}: {
  row: Row<Observation>;
  prepareRow: (row: Row<Observation>) => void;
}) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;
  const classes = useStyles();
  prepareRow(row);

  const headingLevel = row.depth === 0 ? "h2" : row.depth === 1 ? "h3" : "p";
  return (
    <Box>
      {row.subRows.length === 0 ? (
        row.cells.map((cell, i) => {
          return (
            <Flex key={i} component="dl" className={classes.root}>
              <Box
                component="dt"
                sx={{ flex: "1 1 100%", fontWeight: "bold", mr: 2 }}
              >
                {cell.column.Header}
              </Box>
              <Box
                component="dd"
                sx={{ flex: "1 1 100%", ml: 2, position: "relative" }}
              >
                <DDContent
                  cell={cell}
                  columnMeta={tableColumnsMeta[cell.column.id]}
                />
              </Box>
            </Flex>
          );
        })
      ) : (
        // Group
        <Flex
          sx={{
            borderTop: "1px solid",
            borderTopColor: "grey.400",
            color: "grey.600",
            py: 2,
            ml: `${row.depth * 12}px`,
          }}
        >
          <Icon name={row.isExpanded ? "chevronDown" : "chevronRight"} />
          <Typography
            component={headingLevel}
            variant="body1"
            sx={{ color: "grey.900" }}
            {...row.getToggleRowExpandedProps()}
          >
            {`${row.groupByVal}`}
          </Typography>
        </Flex>
      )}
    </Box>
  );
};

export const DDContent = ({
  cell,
  columnMeta,
}: {
  cell: Cell<Observation>;
  columnMeta: ColumnMeta;
}) => {
  const { bounds } = useChartState();
  const { chartWidth } = bounds;

  const formatNumber = useFormatNumber();

  const {
    columnComponentType,
    textColor,
    barShowBackground,
    barColorBackground,
    barColorNegative,
    barColorPositive,
  } = columnMeta;

  switch (columnMeta.type) {
    case "text":
      const { textStyle } = columnMeta;
      return (
        <Box
          component="div"
          sx={{
            width: "100%",
            color: textColor,
            fontWeight: textStyle,
          }}
        >
          {columnComponentType === "NumericalMeasure"
            ? formatNumber(cell.value)
            : cell.render("Cell")}
        </Box>
      );
    case "category":
      const { colorScale: cColorScale } = columnMeta;
      return (
        <Tag tagColor={cColorScale(cell.value)} small>
          {cell.render("Cell")}
        </Tag>
      );
    case "heatmap":
      const isNull = cell.value === null;
      const hColorScale = columnMeta.colorScale;
      return (
        <Box
          sx={{
            color: isNull
              ? textColor
              : hcl(hColorScale(cell.value)).l < 55
              ? "#fff"
              : "#000",
            backgroundColor: isNull ? "grey.100" : hColorScale(cell.value),
            fontWeight: textStyle,
            px: 1,
            width: "fit-content",
            borderRadius: "2px",
          }}
        >
          {formatNumber(cell.value)}
        </Box>
      );
    case "bar":
      const { widthScale } = columnMeta;
      // Reset widthscale range based on current viewport
      widthScale?.range([0, chartWidth / 2]);

      return (
        <Flex
          sx={{
            flexDirection: "column",
            justifyContent: "center",
            width: chartWidth / 2,
          }}
        >
          <Box sx={{ width: chartWidth / 2 }}>{formatNumber(cell.value)}</Box>
          {cell.value !== null && widthScale && (
            <Box
              sx={{
                width: chartWidth / 2,
                height: 14,
                position: "relative",
                backgroundColor: barShowBackground
                  ? barColorBackground
                  : "grey.100",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: `${getBarLeftOffset(cell.value, widthScale)}px`,
                  width: `${getBarWidth(cell.value, widthScale)}px`,
                  height: 14,
                  backgroundColor:
                    cell.value > 0 ? barColorPositive : barColorNegative,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "-2px",
                  left: `${
                    cell.value < 0
                      ? widthScale(0)
                      : getBarLeftOffset(cell.value, widthScale)
                  }px`,
                  width: "1px",
                  height: 18,
                  backgroundColor: "grey.700",
                }}
              />
            </Box>
          )}
        </Flex>
      );

    default:
      return (
        <Box
          component="span"
          sx={{
            color: textColor,
            fontWeight: textStyle,
          }}
        >
          {columnComponentType === "NumericalMeasure"
            ? formatNumber(cell.value)
            : cell.render("Cell")}
        </Box>
      );
  }
};

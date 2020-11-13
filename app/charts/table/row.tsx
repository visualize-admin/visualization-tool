import { Box, Flex, Text } from "@theme-ui/components";
import { hcl } from "d3-color";
import * as React from "react";
import { ReactNode } from "react";
import { Cell, Row } from "react-table";
import { useFormatNumber } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { Tag } from "./cell";
import { BAR_CELL_PADDING } from "./constants";
import { ColumnMeta, TableChartState } from "./table-state";

export const RowMobile = ({
  row,
  prepareRow,
}: {
  row: Row<Observation>;
  prepareRow: (row: Row<Observation>) => void;
}) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;

  prepareRow(row);

  const headingLevel = row.depth === 0 ? "h2" : row.depth === 1 ? "h3" : "p";
  return (
    <Box>
      {row.subRows.length === 0 ? (
        row.cells.map((cell, i) => {
          return (
            <Flex
              key={i}
              as="dl"
              sx={{
                color: "monochrome800",
                fontSize: 2,
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                my: 2,
                "&:first-of-type": {
                  pt: 2,
                },
                "&:last-of-type": {
                  borderBottom: "1px solid",
                  borderBottomColor: "monochrome400",
                  pb: 3,
                },
              }}
            >
              <Box as="dt" sx={{ flex: "1 1 100%", fontWeight: "bold", mr: 2 }}>
                {cell.column.Header}
              </Box>
              <Box
                as="dd"
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
            borderTopColor: "monochrome400",
            color: "monochrome600",
            py: 2,
            ml: `${row.depth * 12}px`,
          }}
        >
          <Icon name={row.isExpanded ? "chevrondown" : "chevronright"} />
          <Text
            as={headingLevel}
            variant="paragraph1"
            sx={{ color: "monochrome900" }}
            {...row.getToggleRowExpandedProps()}
          >
            {`${row.groupByVal}`}
          </Text>
        </Flex>
      )}
    </Box>
  );
};

const DDContent = ({
  cell,
  columnMeta,
}: {
  cell: Cell<Observation>;
  columnMeta: ColumnMeta;
}) => {
  const { bounds } = useChartState();
  const { chartWidth } = bounds;
  console.log({ chartWidth });
  const formatNumber = useFormatNumber();

  const {
    columnComponentType,
    type,
    textStyle,
    textColor,
    colorScale,
    barShowBackground,
    barColorBackground,
    barColorNegative,
    barColorPositive,
    widthScale,
  } = columnMeta;

  switch (type) {
    case "text":
      return (
        <Box
          as="div"
          sx={{
            width: "100%",
            color: textColor,
            fontWeight: textStyle,
          }}
        >
          {columnComponentType === "Measure"
            ? formatNumber(cell.value)
            : cell.render("Cell")}
        </Box>
      );
    case "category":
      return (
        <Tag
          tagColor={colorScale ? colorScale(cell.value) : "primaryLight"}
          small
        >
          {cell.render("Cell")}
        </Tag>
      );
    case "heatmap":
      return (
        <Box
          sx={{
            color:
              hcl(colorScale ? colorScale(cell.value) : textColor).l < 55
                ? "#fff"
                : "#000",
            bg: colorScale ? colorScale(cell.value) : "primaryLight",
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
      widthScale?.range([0, chartWidth / 2]);
      console.log(widthScale?.range());
      return (
        <Flex
          sx={{
            flexDirection: "column",
            justifyContent: "center",
            width: chartWidth / 2,
          }}
        >
          <Box sx={{ width: chartWidth / 2 }}>{formatNumber(cell.value)}</Box>
          <Box
            sx={{
              width: chartWidth / 2,
              height: 14,
              position: "relative",
              bg: barShowBackground ? barColorBackground : "monochrome100",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: widthScale ? widthScale(Math.min(0, cell.value)) : 0,
                width: widthScale
                  ? Math.abs(widthScale(cell.value) - widthScale(0))
                  : 0,
                height: 14,
                bg: cell.value > 0 ? barColorPositive : barColorNegative,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: "-2px",
                left: widthScale ? widthScale(0) : 0,
                width: "1px",
                height: 18,
                bg: "monochrome700",
              }}
            />
          </Box>
        </Flex>
      );

    default:
      return (
        <Box
          as="span"
          sx={{
            color: textColor,
            fontWeight: textStyle,
          }}
        >
          {columnComponentType === "Measure"
            ? formatNumber(cell.value)
            : cell.render("Cell")}
        </Box>
      );
  }
};

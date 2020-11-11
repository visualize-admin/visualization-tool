import { Box, Flex } from "@theme-ui/components";
import { hcl } from "d3-color";
import * as React from "react";
import { ReactNode } from "react";
import { Cell } from "react-table";
import { useFormatNumber } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { ColumnMeta } from "./table-state";

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
          sx={{ alignItems: "center", fontWeight: textStyle, pr: 3 }}
          {...cell.getCellProps()}
        >
          <Tag tagColor={colorScale ? colorScale(cell.value) : "primaryLight"}>
            {cell.render("Cell")}
          </Tag>
        </Flex>
      );
    case "heatmap":
      return (
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "flex-end",
            color:
              hcl(colorScale ? colorScale(cell.value) : textColor).l < 55
                ? "#fff"
                : "#000",
            bg: colorScale ? colorScale(cell.value) : "primaryLight",
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
            px: 3,
          }}
          {...cell.getCellProps()}
        >
          <Box>{formatNumber(cell.value)}</Box>
          <Box
            sx={{
              width: "100%",
              height: "12px",
              position: "relative",
              bg: barShowBackground ? barColorBackground : "monochrome100",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${widthScale ? widthScale(cell.value) : 0}%`, // FIXME: handle negative values
                height: "12px",
                bg: cell.value > 0 ? barColorPositive : barColorNegative,
              }}
            />
          </Box>
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

export const Tag = ({
  tagColor,
  small = false,
  children,
}: {
  tagColor: string;
  small?: boolean;
  children: ReactNode;
}) => (
  <Box
    as="span"
    sx={{
      bg: tagColor,
      borderRadius: "15px",
      px: small ? 2 : 3,
      py: small ? "0.125rem" : 1,
      my: small ? 0 : 1,
    }}
  >
    {children}
  </Box>
);

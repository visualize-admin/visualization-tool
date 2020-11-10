import { Box } from "@theme-ui/components";
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
        <Box
          sx={{
            color: textColor,
            bg: columnColor,
            textAlign: columnComponentType === "Measure" ? "right" : "left",
            fontWeight: textStyle,
            py: 2,
            pr: 3,
          }}
          {...cell.getCellProps()}
        >
          {columnComponentType === "Measure"
            ? formatNumber(cell.value)
            : cell.render("Cell")}
        </Box>
      );
    case "category":
      return (
        <Box
          sx={{ fontWeight: textStyle, py: 2, pr: 3 }}
          {...cell.getCellProps()}
        >
          <Tag tagColor={colorScale ? colorScale(cell.value) : "primaryLight"}>
            {cell.render("Cell")}
          </Tag>
        </Box>
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
            textAlign: "right",
            fontWeight: textStyle,
            py: 2,
            pr: 3,
          }}
          {...cell.getCellProps()}
        >
          {formatNumber(cell.value)}
        </Box>
      );
    case "bar":
      return (
        <Box sx={{ width: "100%", py: 2, pr: 3 }} {...cell.getCellProps()}>
          <Box>{cell.render("Cell")}</Box>
          <Box
            sx={{
              width: "100%",
              height: "16px",
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
                height: "16px",
                bg: cell.value > 0 ? barColorPositive : barColorNegative,
              }}
            />
          </Box>
        </Box>
      );
    default:
      return (
        <Box
          sx={{
            color: textColor,
            bg: columnColor,
            textAlign: columnComponentType === "Measure" ? "right" : "left",
            fontWeight: textStyle,
            py: 2,
            pr: 3,
          }}
          {...cell.getCellProps()}
        >
          {columnComponentType === "Measure"
            ? formatNumber(cell.value)
            : cell.render("Cell")}
        </Box>
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

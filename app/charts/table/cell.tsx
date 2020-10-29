import { Box } from "@theme-ui/components";
import * as React from "react";
import { Cell, CellPropGetter, TableCellProps } from "react-table";
import { SystemStyleObject } from "@styled-system/css";
import { ColumnMeta } from "./table-state";
import { Observation } from "../../domain/data";
import { useFormatNumber } from "../../domain/helpers";

export const CellContent = ({
  cell,
  columnMeta,
}: {
  cell: Cell<Observation>; //string | number;
  columnMeta: ColumnMeta;
}) => {
  const formatNumber = useFormatNumber();
  const {
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
      );
    case "category":
      return (
        <TagCell
          value={cell.value}
          styles={{ fontWeight: textStyle }}
          tagColor={colorScale(cell.value)}
          {...cell.getCellProps()}
        />
      );
    case "heatmap":
      return (
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
      );
    case "bar":
      return (
        <BarCell
          value={cell.value}
          barColorPositive={barColorPositive}
          barColorNegative={barColorNegative}
          barColorBackground={
            barShowBackground ? barColorBackground : "monochrome100"
          }
          barWidth={widthScale(cell.value)} // FIXME: handle negative values
          {...cell.getCellProps()}
        />
      );
    default:
      return (
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
      );
  }
};

export const TextCell = ({
  value,
  styles,
  cellProps,
}: {
  value: string | number;
  styles: SystemStyleObject;
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
}) => (
  <Box as="td" sx={{ ...styles }}>
    {value}
  </Box>
);

export const TagCell = ({
  value,
  styles,
  tagColor,
  cellProps,
}: {
  value: string | number;
  styles: { fontWeight: string };
  tagColor: string;
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
}) => {
  const { fontWeight } = styles;
  return (
    <Box as="td" sx={{ fontWeight }}>
      <Box
        as="span"
        sx={{
          bg: tagColor,
          borderRadius: "15px",
          px: 3,
          py: 1,
          my: 1,
        }}
      >
        {value}
      </Box>
    </Box>
  );
};

export const BarCell = ({
  value,
  barColorPositive,
  barColorNegative,
  barColorBackground,
  barWidth,
  cellProps,
}: {
  value: string | number;
  barColorPositive: string;
  barColorNegative: string;
  barColorBackground: string;
  barWidth: number; // as percentage
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
}) => (
  <Box as="td" sx={{ width: "100%" }}>
    <Box>{value}</Box>
    <Box
      sx={{
        width: "100%",
        height: "16px",
        position: "relative",
        bg: barColorBackground,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${barWidth}%`,
          height: "16px",
          bg: value > 0 ? barColorPositive : barColorNegative,
        }}
      />
    </Box>
  </Box>
);

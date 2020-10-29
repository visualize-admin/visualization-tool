import { Box } from "@theme-ui/components";
import * as React from "react";
import { Cell, CellPropGetter, TableCellProps } from "react-table";
import { SystemStyleObject } from "@styled-system/css";
import { ColumnMeta } from "./table-state";
import { Observation } from "../../domain/data";
import { useFormatNumber } from "../../domain/helpers";
import { ReactNode } from "react";

export const CellContent = ({
  cell,
  columnMeta,
  children,
}: {
  cell: Cell<Observation>; //string | number;
  columnMeta: ColumnMeta;
  children: ReactNode;
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
        >
          {children}
        </TextCell>
      );
    case "category":
      return (
        <TagCell
          value={cell.value}
          styles={{ fontWeight: textStyle }}
          tagColor={colorScale(cell.value)}
          {...cell.getCellProps()}
        >
          {children}
        </TagCell>
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
        >
          {children}
        </TextCell>
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
        >
          {children}
        </BarCell>
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
        >
          {children}
        </TextCell>
      );
  }
};

export const TextCell = ({
  value,
  styles,
  cellProps,
  children,
}: {
  value: string | number;
  styles: SystemStyleObject;
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
  children: ReactNode;
}) => (
  <Box as="td" sx={{ ...styles }}>
    {children}
  </Box>
);

export const TagCell = ({
  value,
  styles,
  tagColor,
  cellProps,
  children,
}: {
  value: string | number;
  styles: { fontWeight: string };
  tagColor: string;
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
  children: ReactNode;
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
        {children}
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
  children,
}: {
  value: string | number;
  barColorPositive: string;
  barColorNegative: string;
  barColorBackground: string;
  barWidth: number; // as percentage
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
  children: ReactNode;
}) => (
  <Box as="td" sx={{ width: "100%" }}>
    <Box>{children}</Box>
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

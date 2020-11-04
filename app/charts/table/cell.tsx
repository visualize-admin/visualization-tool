import { SystemStyleObject } from "@styled-system/css";
import { Box } from "@theme-ui/components";
import { hcl } from "d3-color";
import * as React from "react";
import { ReactNode } from "react";
import { Cell, CellPropGetter, TableCellProps } from "react-table";
import { Observation } from "../../domain/data";
import { ColumnMeta } from "./table-state";

export const CellContent = ({
  cell,
  columnMeta,
  children,
}: {
  cell: Cell<Observation>;
  columnMeta: ColumnMeta;
  children: ReactNode;
}) => {
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
          tagColor={colorScale ? colorScale(cell.value) : "primaryLight"}
          {...cell.getCellProps()}
        >
          {children}
        </TagCell>
      );
    case "heatmap":
      return (
        <TextCell
          styles={{
            color:
              hcl(colorScale ? colorScale(cell.value) : textColor).l < 55
                ? "#fff"
                : "#000",
            bg: colorScale ? colorScale(cell.value) : "primaryLight",
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
          barWidth={widthScale ? widthScale(cell.value) : 0} // FIXME: handle negative values
          {...cell.getCellProps()}
        >
          {children}
        </BarCell>
      );
    default:
      return (
        <TextCell
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
  styles,
  cellProps,
  children,
}: {
  styles: SystemStyleObject;
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
  children: ReactNode;
}) => (
  <Box as="td" sx={{ ...styles }} {...cellProps}>
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
    <Box as="td" sx={{ fontWeight }} {...cellProps}>
      <Tag tagColor={tagColor}>{value}</Tag>
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
  <Box as="td" sx={{ width: "100%" }} {...cellProps}>
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

import { Box } from "@theme-ui/components";
import * as React from "react";
import { CellPropGetter, TableCellProps } from "react-table";
import { SystemStyleObject } from "@styled-system/css";

export const TextCell = ({
  value,
  color,
  bg,
  textAlign,
  fontWeight,
  cellProps,
}: {
  value: string | number;
  color: SystemStyleObject;
  bg: SystemStyleObject;
  textAlign: SystemStyleObject;
  fontWeight: SystemStyleObject;
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
}) => (
  <Box as="td" sx={{ color, bg, textAlign, fontWeight }} {...cellProps}>
    {value}
  </Box>
);
export const TagCell = ({
  value,
  color,
  fontWeight,
  tagColor,
  cellProps,
}: {
  value: string | number;
  color: SystemStyleObject;
  fontWeight: SystemStyleObject;
  tagColor: SystemStyleObject;
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
}) => (
  <Box as="td" sx={{ color, fontWeight }} {...cellProps}>
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

export const BarCell = ({
  value,
  barColor,
  barBackground,
  barWidth,
  cellProps,
}: {
  value: string | number;
  barColor: string | false;
  barBackground: string | false;
  barWidth: number; // as percentage
  cellProps?: (propGetter?: CellPropGetter<$FixMe>) => TableCellProps;
}) => (
  <Box as="td" sx={{ textAlign: "right", width: "100%" }} {...cellProps}>
    <Box>{value}</Box>
    <Box
      sx={{
        width: "100%",
        height: "16px",
        position: "relative",
        bg: barBackground,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${barWidth}%`,
          height: "16px",
          bg: barColor,
        }}
      />
    </Box>
  </Box>
);

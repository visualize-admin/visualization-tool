import { SystemStyleObject } from "@styled-system/css";

export const TABLE_HEIGHT = 600;
export const BAR_CELL_PADDING = 12;
export const SORTING_ARROW_WIDTH = 24;
export const TABLE_STYLES: SystemStyleObject = {
  borderSpacing: 0,
  border: "none",
  tableLayout: "fixed",

  fontSize: 3,
  color: "monochrome700",

  th: {},

  td: {
    m: 0,
    py: 2,
    pr: 3,
    pl: 3,
    borderBottom: "1px solid",
    borderBottomColor: "monochrome400",
  },
};

import { ThemeUICSSObject } from "@mui/material";

export const TABLE_HEIGHT = 600;
export const BAR_CELL_PADDING = 12;
export const SORTING_ARROW_WIDTH = 24;
export const TABLE_STYLES: ThemeUICSSObject = {
  borderSpacing: 0,
  border: "none",
  tableLayout: "fixed",

  fontSize: 3,
  color: "grey.700",

  th: {},

  td: {
    m: 0,
    py: 2,
    pr: 3,
    pl: 3,
    borderBottom: "1px solid",
    borderBottomColor: "grey.400",
  },
};

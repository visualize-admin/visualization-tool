import { SystemStyleObject } from "@styled-system/css";

export const TABLE_HEIGHT = 800;
export const ROW_HEIGHT = 40;
export const TABLE_STYLES: SystemStyleObject = {
  borderSpacing: 0,
  border: "none",
  tableLayout: "fixed",

  fontSize: 3,
  color: "monochrome700",
  th: {
    m: 0,
    py: 2,
    pr: 6,
    pl: 3,
    borderTop: "1px solid",
    borderTopColor: "monochrome700",
    borderBottom: "1px solid",
    borderBottomColor: "monochrome700",
    borderRight: 0,
    borderLeft: 0,
    fontWeight: "bold",

    color: "monochrome700",
    ":last-child": {
      borderRight: 0,
    },
  },

  td: {
    m: 0,
    py: 2,
    pr: 6,
    pl: 3,
    borderBottom: "1px solid",
    borderBottomColor: "monochrome400",
  },
};

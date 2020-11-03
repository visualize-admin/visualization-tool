import { SystemStyleObject } from "@styled-system/css";
import slugify from "slugify";

export const TABLE_HEIGHT = 800;
export const ROW_HEIGHT = 40;
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
    pr: 6,
    pl: 3,
    borderBottom: "1px solid",
    borderBottomColor: "monochrome400",
  },
};

export const getSlugifiedIri = (iri: string) =>
  slugify(iri, { remove: /[.:]/g });

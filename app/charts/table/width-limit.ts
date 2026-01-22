import { ColumnMeta } from "@/charts/table/table-state";

export const columnCanBeWidthLimited = (columnType: ColumnMeta["type"]) => {
  return columnType === "text" || columnType === "category";
};

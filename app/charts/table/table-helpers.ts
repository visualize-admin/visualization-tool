import { Cell } from "react-table";

import { getSlugifiedId } from "@/charts/shared/chart-helpers";
import { ColumnMeta } from "@/charts/table/table-state";
import { Observation } from "@/domain/data";

export const getLinkHref = (
  cell: Cell<Observation>,
  { baseUrl, linkComponentId: id }: Extract<ColumnMeta, { type: "link" }>
) => {
  const { original } = cell.row;
  const value =
    original[getSlugifiedId(`${id}/__iri__`)] ?? original[getSlugifiedId(id)];

  return value ? `${baseUrl}${value}` : "";
};

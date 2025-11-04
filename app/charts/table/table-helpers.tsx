import { IconButton } from "@mui/material";
import { Cell } from "react-table";

import { getSlugifiedId } from "@/charts/shared/chart-helpers";
import { ColumnMeta } from "@/charts/table/table-state";
import { Flex } from "@/components/flex";
import { Observation } from "@/domain/data";
import { Icon } from "@/icons";

export const getLinkHref = (
  cell: Cell<Observation>,
  { baseUrl, linkComponentId: id }: Extract<ColumnMeta, { type: "link" }>
) => {
  const { original } = cell.row;
  const value =
    original[getSlugifiedId(`${id}/__iri__`)] ?? original[getSlugifiedId(id)];

  return value ? `${baseUrl}${value}` : "";
};

export const TableLinkCell = ({ href }: { href: string }) => {
  return (
    <Flex sx={{ alignItems: "center", justifyContent: "center" }}>
      <IconButton
        component="a"
        href={href}
        target="_blank"
        size="small"
        title={href}
        sx={{ color: "primary.main" }}
      >
        <Icon name="legacyLinkExternal" size={16} />
      </IconButton>
    </Flex>
  );
};

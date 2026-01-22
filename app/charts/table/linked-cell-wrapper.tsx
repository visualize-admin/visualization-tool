import { Link, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";
import { Cell } from "react-table";

import { getSlugifiedId } from "@/charts/shared/chart-helpers";
import { ColumnMeta } from "@/charts/table/table-state";
import { TableLinks } from "@/config-types";
import { Observation } from "@/domain/data";
import { Icon } from "@/icons";

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
    minWidth: 0,
    color: "inherit",
    fontWeight: "inherit",
    textDecoration: "none",

    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

const getLinkHref = (
  cell: Cell<Observation>,
  baseUrl: string,
  componentId: string
): string => {
  const slugifiedId = getSlugifiedId(componentId);
  const { original } = cell.row;
  const iriValue = original[getSlugifiedId(`${componentId}/__iri__`)];
  const rawValue = original[slugifiedId];
  const value = iriValue
    ? `${iriValue}`.split("/").pop() || iriValue
    : rawValue;

  return `${baseUrl}${value}`;
};

export const LinkedCellWrapper = ({
  children,
  cell,
  columnMeta,
  links,
}: {
  children: ReactNode;
  cell: Cell<Observation>;
  columnMeta: ColumnMeta;
  links: TableLinks;
}) => {
  const classes = useStyles();
  const isLinkedColumn =
    links.enabled &&
    links.baseUrl.trim() !== "" &&
    links.componentId.trim() !== "" &&
    links.targetComponentId.trim() !== "" &&
    getSlugifiedId(links.targetComponentId) === columnMeta.slugifiedId;
  const href = getLinkHref(cell, links.baseUrl, links.componentId);

  if (!isLinkedColumn || !href) {
    return <>{children}</>;
  }

  return (
    <Link
      className={classes.link}
      href={href}
      target="_parent"
      title={href}
      style={{ flex: 1, justifyContent: "space-between" }}
    >
      {children}
      <Icon name="legacyLinkExternal" size={16} />
    </Link>
  );
};

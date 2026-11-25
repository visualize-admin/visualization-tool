import { ListSubheader, ListSubheaderProps } from "@mui/material";
import { ReactNode } from "react";

export const SelectGroupHeader = ({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: ListSubheaderProps["sx"];
}) => {
  return (
    <ListSubheader role="presentation" sx={sx}>
      {children}
    </ListSubheader>
  );
};

SelectGroupHeader.muiSkipListHighlight = true;

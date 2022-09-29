import { Tooltip } from "@mui/material";
import React from "react";

export const MaybeTooltip = ({
  text,
  children,
}: {
  text?: string;
  children: JSX.Element;
}) => {
  return text ? (
    <Tooltip arrow title={text}>
      {children}
    </Tooltip>
  ) : (
    children
  );
};

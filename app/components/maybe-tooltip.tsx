import { Tooltip, TooltipProps } from "@mui/material";
import { ReactNode } from "react";

export const MaybeTooltip = ({
  title,
  children,
  tooltipProps,
}: {
  title?: JSX.Element | ReactNode | string;
  children: JSX.Element;
  tooltipProps?: Omit<TooltipProps, "children" | "title">;
}) => {
  return title ? (
    <Tooltip arrow title={title} disableInteractive {...tooltipProps}>
      {children}
    </Tooltip>
  ) : (
    children
  );
};

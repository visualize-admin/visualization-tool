import { Tooltip, TooltipProps } from "@mui/material";

export const MaybeTooltip = ({
  title,
  children,
  tooltipProps,
}: {
  title?: JSX.Element;
  children: JSX.Element;
  tooltipProps?: Omit<TooltipProps, "children" | "title">;
}) => {
  return title ? (
    <Tooltip arrow title={title} {...tooltipProps}>
      {children}
    </Tooltip>
  ) : (
    children
  );
};

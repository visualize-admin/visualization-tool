import { Tooltip, TooltipProps } from "@mui/material";

import { useTooltipStyles } from "@/components/tooltip-utils";

export const MaybeTooltip = ({
  title,
  children,
  tooltipProps,
}: {
  title?: JSX.Element;
  children: JSX.Element;
  tooltipProps?: Omit<TooltipProps, "children" | "title">;
}) => {
  const classes = useTooltipStyles({ variant: "primary" });

  return title ? (
    <Tooltip
      arrow
      title={title}
      componentsProps={{
        tooltip: {
          className: classes.tooltip,
        },
      }}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  ) : (
    children
  );
};

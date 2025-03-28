import { Tooltip, TooltipProps, Typography } from "@mui/material";
import { ReactNode } from "react";

import {
  TooltipTitle,
  TooltipVariant,
  useTooltipStyles,
} from "@/components/tooltip-utils";
import { Icon } from "@/icons";

export const InfoIconTooltip = (
  props: {
    title: NonNullable<ReactNode>;
    variant?: TooltipVariant;
  } & Omit<TooltipProps, "children" | "title">
) => {
  const {
    title,
    componentsProps,
    variant = "primary",
    placement = "top",
    ...rest
  } = props;
  const classes = useTooltipStyles({ variant });

  return (
    <Tooltip
      arrow
      placement={placement}
      title={<TooltipTitle text={title} />}
      disableInteractive
      componentsProps={{
        ...componentsProps,
        tooltip: {
          className: classes.tooltip,
        },
      }}
      {...rest}
    >
      <Typography>
        <Icon name="warningCircle" size={16} className={classes.icon} />
      </Typography>
    </Tooltip>
  );
};

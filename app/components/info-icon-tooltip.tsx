import { Tooltip, TooltipProps } from "@mui/material";
import { ReactNode } from "react";

import { Icon } from "@/icons";

export const InfoIconTooltip = (
  props: {
    title: NonNullable<ReactNode>;
    size?: number;
  } & Omit<TooltipProps, "children" | "title">
) => {
  const {
    title,
    size = 24,
    componentsProps,
    placement = "top",
    ...rest
  } = props;

  return (
    <Tooltip
      arrow
      placement={placement}
      title={title}
      disableInteractive
      {...rest}
    >
      <div style={{ lineHeight: 0 }}>
        <Icon name="warningCircle" size={size} />
      </div>
    </Tooltip>
  );
};

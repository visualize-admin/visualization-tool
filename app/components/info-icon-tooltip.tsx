import { Tooltip, TooltipProps } from "@mui/material";
import { ReactNode } from "react";

import { Icon } from "@/icons";

export const InfoIconTooltip = (
  props: {
    title: NonNullable<ReactNode>;
  } & Omit<TooltipProps, "children" | "title">
) => {
  const { title, componentsProps, placement = "top", ...rest } = props;

  return (
    <Tooltip
      arrow
      placement={placement}
      title={title}
      disableInteractive
      {...rest}
    >
      <div>
        <Icon name="warningCircle" />
      </div>
    </Tooltip>
  );
};

import { t } from "@lingui/macro";
import { IconButton, Tooltip, TooltipProps } from "@mui/material";
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
      describeChild
      {...rest}
    >
      <IconButton
        color="inherit"
        aria-label={t({
          id: "info.more-information",
          message: "More information",
        })}
        sx={{ p: 0, lineHeight: 0 }}
      >
        <Icon name="infoCircle" size={size} />
      </IconButton>
    </Tooltip>
  );
};

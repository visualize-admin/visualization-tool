import { Tooltip, Typography } from "@mui/material";
import React from "react";

import { Icon } from "@/icons";

import { useWarnIconStyles } from "./chart-type-selector";

type InfoIconTooltipProps = {
  title: NonNullable<React.ReactNode>;
};
export const InfoIconTooltip = (props: InfoIconTooltipProps) => {
  const { title } = props;
  const iconStyles = useWarnIconStyles();

  return (
    <Tooltip
      arrow
      placement="top"
      title={
        <Typography variant="caption" color="secondary">
          {title}
        </Typography>
      }
      componentsProps={{
        tooltip: { sx: { width: 180, px: 2, py: 1, lineHeight: "18px" } },
      }}
    >
      <Typography>
        <Icon name="infoOutline" size={16} className={iconStyles.icon} />
      </Typography>
    </Tooltip>
  );
};

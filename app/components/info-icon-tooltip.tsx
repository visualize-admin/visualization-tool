import { Theme, Tooltip, TooltipProps, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

import { Icon } from "@/icons";

type InfoIconTooltipProps = {
  title: NonNullable<React.ReactNode>;
};

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: { width: 180, padding: theme.spacing(1, 2), lineHeight: "18px" },
  icon: {
    color: theme.palette.primary.main,
    pointerEvents: "auto",
  },
}));

export const InfoIconTooltip = (
  props: InfoIconTooltipProps & Omit<TooltipProps, "children">
) => {
  const classes = useStyles();
  const { title, componentsProps, ...rest } = props;

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
        ...componentsProps,
        tooltip: { className: classes.tooltip },
      }}
      {...rest}
    >
      <Typography>
        <Icon name="infoOutline" size={16} className={classes.icon} />
      </Typography>
    </Tooltip>
  );
};

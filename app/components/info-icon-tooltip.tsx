import { Theme, Tooltip, TooltipProps, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

import { Icon } from "@/icons";

type InfoIconTooltipVariant = "primary" | "secondary";

export const InfoIconTooltip = (
  props: {
    title: NonNullable<React.ReactNode>;
    variant?: InfoIconTooltipVariant;
  } & Omit<TooltipProps, "children" | "title">
) => {
  const {
    title,
    componentsProps,
    variant = "primary",
    placement = "top",
    ...rest
  } = props;
  const classes = useStyles({ variant });

  return (
    <Tooltip
      arrow
      placement={placement}
      title={
        <Typography variant="caption" color="secondary">
          {title}
        </Typography>
      }
      componentsProps={{
        ...componentsProps,
        tooltip: {
          className: classes.tooltip,
        },
      }}
      {...rest}
    >
      <Typography>
        <Icon name="infoOutline" size={16} className={classes.icon} />
      </Typography>
    </Tooltip>
  );
};

const useStyles = makeStyles<Theme, { variant: "primary" | "secondary" }>(
  (theme) => ({
    tooltip: {
      width: 150,
      padding: theme.spacing(1, 2),
      lineHeight: "18px",
    },
    icon: {
      color: ({ variant }) => theme.palette[variant].main,
      pointerEvents: "auto",
    },
  })
);

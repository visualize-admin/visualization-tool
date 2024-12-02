import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";

export type TooltipVariant = "primary" | "secondary";

export const TooltipTitle = ({ text }: { text: string | ReactNode }) => {
  return (
    <Typography variant="caption" color="grey.700">
      {text}
    </Typography>
  );
};

export const useTooltipStyles = makeStyles<Theme, { variant: TooltipVariant }>(
  (theme) => ({
    tooltip: {
      width: "100%",
      maxWidth: 240,
      padding: theme.spacing(1, 2),
      lineHeight: "18px",
    },
    icon: {
      color: ({ variant }) => theme.palette[variant].main,
      pointerEvents: "auto",
    },
  })
);

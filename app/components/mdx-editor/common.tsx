import { IconButton, IconButtonProps } from "@mui/material";
import { forwardRef } from "react";

const ACTIVE_SX = {
  '&[aria-pressed="true"], &[aria-expanded="true"]': {
    backgroundColor: "monochrome.800",
    color: "white",

    "&:hover": {
      backgroundColor: "monochrome.700",
    },

    "&& svg": {
      color: "inherit",
    },

    "@media (forced-colors: active)": {
      forcedColorAdjust: "none",
      backgroundColor: "Highlight",
      color: "HighlightText",
    },
  },
};

export const ToolbarIconButton = forwardRef<
  HTMLButtonElement,
  IconButtonProps & { label: string; active?: boolean }
>(({ label, active, style, sx, ...rest }, ref) => {
  return (
    <IconButton
      ref={ref}
      aria-label={label}
      aria-pressed={active}
      style={{ ...style, padding: "2px", borderRadius: 4 }}
      sx={[ACTIVE_SX, ...(Array.isArray(sx) ? sx : [sx])]}
      {...rest}
    />
  );
});

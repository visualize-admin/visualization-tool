import { Tooltip, TooltipProps } from "@mui/material";
import { MouseEvent, useState } from "react";

import { useEvent } from "@/utils/use-event";

export const OverflowTooltip = ({
  children,
  ...props
}: Omit<TooltipProps, "open">) => {
  const [open, setOpen] = useState(false);
  const handleMouseEnter = useEvent(
    ({ currentTarget: { scrollWidth, clientWidth } }: MouseEvent) => {
      if (scrollWidth > clientWidth) {
        setOpen(true);
      }
    }
  );

  return (
    <Tooltip
      {...props}
      open={open}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setOpen(false)}
      disableHoverListener={!open}
    >
      {children}
    </Tooltip>
  );
};

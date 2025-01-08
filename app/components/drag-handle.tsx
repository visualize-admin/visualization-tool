import { Box, BoxProps } from "@mui/material";
import clsx from "clsx";
import { forwardRef, Ref } from "react";

import { Icon } from "@/icons";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

import { useIconStyles } from "./chart-selection-tabs";

export type DragHandleProps = Omit<BoxProps, "ref"> & {
  ref?: Ref<HTMLDivElement>;
  dragging?: boolean;
};

export const DragHandle = forwardRef<HTMLDivElement, DragHandleProps>(
  (props, ref) => {
    const { dragging, ...rest } = props;
    const classes = useIconStyles({ active: false, dragging });

    return (
      <Box
        {...DISABLE_SCREENSHOT_ATTR}
        ref={ref}
        {...rest}
        className={clsx(classes.dragIconWrapper, props.className)}
      >
        <Icon name="dragndrop" />
      </Box>
    );
  }
);

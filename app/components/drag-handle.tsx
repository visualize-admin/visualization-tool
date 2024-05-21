import { Box, BoxProps } from "@mui/material";
import clsx from "clsx";
import { forwardRef } from "react";

import { Icon } from "@/icons";

import { useIconStyles } from "./chart-selection-tabs";

type DragHandleProps = BoxProps & {
  dragging?: boolean;
};

export const DragHandle = forwardRef<HTMLDivElement, DragHandleProps>(
  (props, ref) => {
    const { dragging, ...rest } = props;
    const classes = useIconStyles({ active: false, dragging });

    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.dragIconWrapper, props.className)}
        sx={{
          color: dragging ? "secondary.active" : "secondary.disabled",
        }}
      >
        <Icon name="dragndrop" />
      </Box>
    );
  }
);

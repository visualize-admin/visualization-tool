import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { forwardRef, Ref } from "react";

import { chartPanelLayoutGridClasses } from "@/components/chart-panel-layout-grid";
import { useIconStyles } from "@/components/chart-selection-tabs";
import { Icon } from "@/icons";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

export const DragHandle = forwardRef<
  HTMLDivElement,
  Omit<BoxProps, "ref"> & {
    ref?: Ref<HTMLDivElement>;
    dragging?: boolean;
  }
>((props, ref) => {
  const { dragging, ...rest } = props;
  const classes = useIconStyles({ active: false, dragging });

  return (
    <Box
      {...DISABLE_SCREENSHOT_ATTR}
      ref={ref}
      {...rest}
      className={clsx(
        classes.dragIconWrapper,
        props.className,
        chartPanelLayoutGridClasses.dragHandle
      )}
    >
      <Icon name="dragndrop" />
    </Box>
  );
});

export const useDragOverClasses = makeStyles<
  Theme,
  { isDragging?: boolean; isDragActive?: boolean; isDragOver?: boolean }
>((theme) => ({
  root: {
    opacity: ({ isDragging, isDragOver }) => {
      return isDragging ? 0.2 : isDragOver ? 0.8 : 1;
    },
    outline: ({ isDragging, isDragOver }) => {
      return `2px solid ${
        isDragOver && !isDragging ? theme.palette.primary.main : "transparent"
      }`;
    },
    pointerEvents: ({ isDragActive }) => {
      return isDragActive ? "none" : "auto";
    },
  },
}));

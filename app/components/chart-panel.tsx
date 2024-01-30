import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import capitalize from "lodash/capitalize";
import React from "react";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { Layout } from "@/config-types";

const useStyles = makeStyles((theme: Theme) => ({
  panelLayoutVertical: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  panelLayoutTall: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 50%)",
    gap: theme.spacing(4),

    "& > :nth-child(3n - 2)": {
      gridColumn: "1 / span 2",
    },
    "& > :nth-child(3n - 1, 3n)": {
      gridColumn: "1 / span 1",
    },
  },
  chartWrapper: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.grey[100],
    border: "1px solid",
    borderColor: theme.palette.divider,
    overflow: "hidden",
    width: "auto",
  },
}));

type ChartPanelLayoutProps = React.PropsWithChildren<{
  type: Extract<Layout, { type: "dashboard" }>["layout"];
}>;

export const ChartPanelLayout = (props: ChartPanelLayoutProps) => {
  const { children, type } = props;
  const classes = useStyles();

  return (
    <div
      className={
        classes[
          `panelLayout${
            capitalize(type) as Capitalize<ChartPanelLayoutProps["type"]>
          }`
        ]
      }
    >
      {children}
    </div>
  );
};

type ChartWrapperProps = BoxProps & {
  editing?: boolean;
  layout?: Layout;
};

export const ChartWrapper = React.forwardRef<HTMLDivElement, ChartWrapperProps>(
  (props, ref) => {
    const { children, editing, layout, ...rest } = props;
    const classes = useStyles();

    return (
      <Box ref={ref} {...rest}>
        {(editing || layout?.type === "tab") && <ChartSelectionTabs />}
        <Box
          className={classes.chartWrapper}
          sx={{ minHeight: [150, 300, 500] }}
        >
          {children}
        </Box>
      </Box>
    );
  }
);

type DndChartWrapperProps = ChartWrapperProps & {
  chartKey: string;
};

export const DndChartWrapper = (props: DndChartWrapperProps) => {
  const { chartKey, ...rest } = props;

  const {
    setNodeRef: setDraggableNodeRef,
    attributes,
    listeners,
    transform,
    isDragging,
  } = useDraggable({ id: chartKey });

  const {
    setNodeRef: setDroppableNodeRef,
    isOver: isOverDroppable,
    active,
  } = useDroppable({ id: chartKey });

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      setDraggableNodeRef(node);
      setDroppableNodeRef(node);
    },
    [setDraggableNodeRef, setDroppableNodeRef]
  );

  return (
    <ChartWrapper
      {...rest}
      ref={setRef}
      {...attributes}
      {...listeners}
      style={{
        zIndex: isDragging ? 1000 : undefined,
        transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
        border:
          isOverDroppable && !isDragging ? "2px dashed" : "2px transparent",
        // Disable tooltip interactions while dragging
        pointerEvents: active ? "none" : "auto",
      }}
    />
  );
};

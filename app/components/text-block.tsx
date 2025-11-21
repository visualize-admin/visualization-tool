import { useDraggable, useDroppable } from "@dnd-kit/core";
import { t } from "@lingui/macro";
import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import isEqual from "lodash/isEqual";
import {
  ComponentProps,
  forwardRef,
  useCallback,
  useLayoutEffect,
} from "react";

import { ActionElementsContainer } from "@/components/action-elements-container";
import { CHART_GRID_ROW_COUNT } from "@/components/chart-shared";
import { BlockMoreButton } from "@/components/dashboard-shared";
import { DragHandle, useDragOverClasses } from "@/components/drag-handle";
import { Markdown } from "@/components/markdown";
import { ROW_HEIGHT } from "@/components/react-grid";
import { LayoutTextBlock } from "@/config-types";
import {
  hasChartConfigs,
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useLocale } from "@/locales/use-locale";
import { useEvent } from "@/utils/use-event";

const useTextBlockStyles = makeStyles<Theme, { layouting?: boolean }>(() => ({
  root: {
    // Make sure the text block doesn't cause the grid to grow.
    gridRow: `span ${CHART_GRID_ROW_COUNT + 1}`,
    display: "flex",
    padding: "0.75rem",
    cursor: ({ layouting }) => (layouting ? "pointer" : "default"),
    "&:hover": {
      textDecoration: ({ layouting }) => (layouting ? "underline" : "none"),
    },
  },
}));
const TEXT_BLOCK_WRAPPER_CLASS = "text-block-wrapper";
const TEXT_BLOCK_CONTENT_CLASS = "text-block-content";

export const TextBlock = forwardRef<
  HTMLDivElement,
  {
    block: LayoutTextBlock;
    dragHandleProps?: ComponentProps<typeof DragHandle>;
  } & ComponentProps<"div">
>(({ children, block, className, dragHandleProps, ...rest }, ref) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const layouting = isLayouting(state);
  const classes = useTextBlockStyles({ layouting });
  const handleTextBlockClick = useEvent((block: LayoutTextBlock) => {
    if (!layouting) {
      return;
    }

    dispatch({
      type: "LAYOUT_ACTIVE_FIELD_CHANGE",
      value: block.key,
    });
  });
  const text = block.text[locale];

  return (
    <div
      // We need to spread the rest props, as there's some additional logic
      // in ReactGridLayout that breaks otherwise.
      {...rest}
      ref={ref}
      id={block.key}
      className={clsx(classes.root, className, TEXT_BLOCK_WRAPPER_CLASS)}
      onClick={(e) => {
        if (e.isPropagationStopped()) {
          return;
        }

        handleTextBlockClick(block);
      }}
    >
      <div
        className={TEXT_BLOCK_CONTENT_CLASS}
        style={{ flexGrow: 1, height: "fit-content" }}
      >
        <Markdown>
          {text || t({ id: "annotation.add.text", message: "[ Add text ]" })}
        </Markdown>
      </div>
      {layouting ? (
        <TextBlockActionElements
          block={block}
          dragHandleProps={dragHandleProps}
        />
      ) : null}
      {children}
    </div>
  );
});

export const renderBaseTextBlock = (block: LayoutTextBlock) => {
  return (
    <TextBlock
      // Important, otherwise react-grid-layout breaks.
      key={block.key}
      block={block}
    />
  );
};

export const DndTextBlock = ({ block }: { block: LayoutTextBlock }) => {
  const {
    setActivatorNodeRef,
    setNodeRef: setDraggableNodeRef,
    attributes,
    listeners,
    isDragging,
  } = useDraggable({ id: block.key });
  const {
    setNodeRef: setDroppableNodeRef,
    isOver: isDragOver,
    active: isDragActive,
  } = useDroppable({ id: block.key });
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      setDraggableNodeRef(node);
      setDroppableNodeRef(node);
    },
    [setDraggableNodeRef, setDroppableNodeRef]
  );
  const dragOverClasses = useDragOverClasses({
    isDragging,
    isDragActive: !!isDragActive,
    isDragOver,
  });

  return (
    <TextBlock
      {...attributes}
      ref={setRef}
      block={block}
      className={
        isDragging || isDragActive || isDragOver
          ? dragOverClasses.root
          : undefined
      }
      dragHandleProps={{
        ref: setActivatorNodeRef,
        dragging: isDragging,
        ...listeners,
      }}
    />
  );
};

const TextBlockActionElements = ({
  block,
  dragHandleProps,
}: {
  block: LayoutTextBlock;
  dragHandleProps?: ComponentProps<typeof DragHandle>;
}) => {
  return (
    <ActionElementsContainer>
      <BlockMoreButton blockKey={block.key} />
      <DragHandle
        onClick={(e) => {
          e.stopPropagation();
        }}
        {...dragHandleProps}
      />
    </ActionElementsContainer>
  );
};

export const useSyncTextBlockHeight = () => {
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const layout = state.layout;
  const isFreeCanvas =
    layout.type === "dashboard" && layout.layout === "canvas";

  useLayoutEffect(() => {
    if (!isFreeCanvas) {
      return;
    }

    const elements = document.querySelectorAll<HTMLDivElement>(
      `.${TEXT_BLOCK_WRAPPER_CLASS}`
    );
    elements.forEach((wrapperEl) => {
      const contentEl = wrapperEl.querySelector<HTMLDivElement>(
        `.${TEXT_BLOCK_CONTENT_CLASS}`
      );

      if (!contentEl) {
        return;
      }

      const key = wrapperEl.id;
      const h = Math.ceil(contentEl.clientHeight / ROW_HEIGHT) || 1;

      const newLayouts = Object.fromEntries(
        Object.entries(layout.layouts).map(([bp, layouts]) => [
          bp,
          layouts.map((b) => {
            return b.i === key ? { ...b, h, minH: h } : b;
          }),
        ])
      );

      if (!isEqual(newLayouts, layout.layouts)) {
        dispatch({
          type: "LAYOUT_CHANGED",
          value: {
            ...layout,
            layouts: newLayouts,
          },
        });
      }
    });
  }, [dispatch, layout, isFreeCanvas]);
};

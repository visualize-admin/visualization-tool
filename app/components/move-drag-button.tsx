import { t } from "@lingui/macro";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

import { Icon } from "@/icons";

export const MoveDragButton = ({
  label,
  dragHandleProps,
}: {
  label: string;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}) => {
  const name = t({
    id: "controls.drag-handle.reorder",
    message: `Reorder: ${label}`,
  });

  return (
    <span
      {...dragHandleProps}
      // Stays focusable while dragging is disabled during the refetch after a drop.
      role="button"
      tabIndex={0}
      aria-disabled={!dragHandleProps || undefined}
      aria-label={name}
      title={name}
      style={{ display: "inline-flex", cursor: "move" }}
    >
      <Icon name="dragIndicator" />
    </span>
  );
};

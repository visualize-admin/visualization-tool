import { Modifier } from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";

type SnapToCursorOptions = {
  xOffset?: number;
};

export const createSnapCornerToCursor = (
  options: SnapToCursorOptions
): Modifier => {
  const { xOffset = 0 } = options;
  return (props) => {
    const { transform, activeNodeRect, activatorEvent } = props;

    if (activatorEvent) {
      const activatorCoordinates = getEventCoordinates(activatorEvent);

      if (!activatorCoordinates || !activeNodeRect) {
        return transform;
      }

      return {
        ...transform,
        x: transform.x + activeNodeRect.width + xOffset,
        y: transform.y,
      };
    }

    return transform;
  };
};

import {
  ANNOTATION_FOCUS_COLOR,
  ANNOTATION_FOCUS_WIDTH,
} from "@/charts/shared/rendering-utils";

export const OverlayHighlightRect = ({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="none"
      stroke={ANNOTATION_FOCUS_COLOR}
      strokeWidth={ANNOTATION_FOCUS_WIDTH}
      pointerEvents="none"
    />
  );
};

import { memo } from "react";

export const Column = memo(
  ({
    x,
    y,
    width,
    height,
    color,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
  }) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="none"
      />
    );
  }
);

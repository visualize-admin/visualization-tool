import { HTMLAttributes, memo } from "react";

export const Column = memo(
  ({
    x,
    y,
    width,
    height,
    color,
    ...props
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
  } & HTMLAttributes<SVGRectElement>) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="none"
        {...props}
      />
    );
  }
);

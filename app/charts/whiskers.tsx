import React, { memo } from "react";

export const VerticalWhisker = memo(
  ({
    x,
    y1,
    y2,
    width,
  }: {
    x: number;
    y1: number;
    y2: number;
    width: number;
    color?: string;
  }) => {
    return (
      <>
        <rect
          x={x}
          y={y1}
          width={width}
          height={2}
          fill={"black"}
          stroke="none"
        />
        <rect
          x={x + width / 2 - 1}
          y={y2}
          width={2}
          height={y1 - y2}
          fill={"black"}
          stroke="none"
        />
        <rect
          x={x}
          y={y2}
          width={width}
          height={2}
          fill={"black"}
          stroke="none"
        />
      </>
    );
  }
);

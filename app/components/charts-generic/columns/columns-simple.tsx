import * as React from "react";
import { useTheme } from "../../../themes";
import { useChartState } from "../use-chart-state";
import { ColumnsState } from "./columns-state";

export const Columns = () => {
  const {
    sortedData,
    bounds,
    getX,
    xScale,
    getY,
    yScale
  } = useChartState() as ColumnsState;
  const theme = useTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => (
        <Column
          key={i}
          x={xScale(getX(d)) as number}
          y={yScale(getY(d))}
          width={xScale.bandwidth()}
          height={yScale(0) - yScale(getY(d))}
          color={theme.colors.primary}
        />
      ))}
    </g>
  );
};

const Column = React.memo(
  ({
    x,
    y,
    width,
    height,
    color
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
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

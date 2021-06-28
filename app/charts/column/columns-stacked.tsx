import { memo } from "react";
import { useChartState } from "../shared/use-chart-state";
import { StackedColumnsState } from "./columns-stacked-state";

export const ColumnsStacked = () => {
  const { bounds, getX, xScale, yScale, colors, series } =
    useChartState() as StackedColumnsState;
  const { margins } = bounds;
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {series.map((sv) => (
        <g key={sv.key} fill={colors(sv.key)} data-n={sv.key}>
          {sv.map((segment: $FixMe, i: number) => {
            return (
              <Column
                key={`${getX(segment.data)}-${i}`}
                x={xScale(getX(segment.data)) as number}
                width={xScale.bandwidth()}
                y={yScale(segment[1])}
                height={yScale(segment[0]) - yScale(segment[1])}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
};

const Column = memo(function Column({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return <rect x={x} y={y} width={width} height={height} stroke="none" />;
});

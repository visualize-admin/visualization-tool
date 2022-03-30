import { useChartState } from "@/charts/shared/use-chart-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { Column } from "@/charts/column/rendering-utils";

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
                y={yScale(segment[1])}
                width={xScale.bandwidth()}
                height={yScale(segment[0]) - yScale(segment[1])}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
};

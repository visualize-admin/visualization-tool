import { useChartState } from "../shared/use-chart-state";
import { GroupedColumnsState } from "./columns-grouped-state";
import { Column } from "./rendering-utils";

export const ColumnsGrouped = () => {
  const {
    bounds,
    xScale,
    xScaleIn,
    getY,
    yScale,
    getSegment,
    colors,
    grouped,
  } = useChartState() as GroupedColumnsState;
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment) => (
        <g key={segment[0]} transform={`translate(${xScale(segment[0])}, 0)`}>
          {segment[1].map((d, i) => {
            const y = getY(d) ?? NaN;

            return (
              <Column
                key={i}
                x={xScaleIn(getSegment(d)) as number}
                y={yScale(Math.max(y, 0))}
                width={xScaleIn.bandwidth()}
                height={Math.abs(yScale(y) - yScale(0))}
                color={colors(getSegment(d))}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
};

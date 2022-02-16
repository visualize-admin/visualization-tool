import { useChartState } from "../shared/use-chart-state";
import { VerticalWhisker } from "../whiskers";
import { GroupedColumnsState } from "./columns-grouped-state";
import { Column } from "./rendering-utils";

export const ErrorWhiskers = () => {
  const { bounds, xScale, xScaleIn, getYError, yScale, getSegment, grouped } =
    useChartState() as GroupedColumnsState;
  const { margins } = bounds;
  if (!getYError) {
    return null;
  }

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment) => (
        <g key={segment[0]} transform={`translate(${xScale(segment[0])}, 0)`}>
          {segment[1].map((d, i) => {
            const x0 = xScaleIn(getSegment(d)) as number;
            const bandwidth = xScaleIn.bandwidth();
            const barwidth = Math.min(bandwidth, 15);
            const [y1, y2] = getYError(d);
            return (
              <VerticalWhisker
                key={i}
                x={x0 + bandwidth / 2 - barwidth / 2}
                width={barwidth}
                y1={yScale(y1)}
                y2={yScale(y2)}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
};

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

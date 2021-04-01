import { memo } from "react";
import { useTheme } from "../../themes";
import { useChartState } from "../shared/use-chart-state";
import { ScatterplotState } from "./scatterplot-state";

export const Scatterplot = () => {
  const {
    data,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    hasSegment,
    getSegment,
    colors,
  } = useChartState() as ScatterplotState;

  const theme = useTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {data.map((d, index) => {
        return (
          <Dot
            key={index}
            cx={xScale(getX(d) ?? NaN)}
            cy={yScale(getY(d) ?? NaN)}
            color={hasSegment ? colors(getSegment(d)) : theme.colors.primary}
          />
        );
      })}
    </g>
  );
};

const Dot = memo(
  ({ cx, cy, color }: { cx: number; cy: number; color: string }) => {
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="none" />;
  }
);

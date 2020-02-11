import { area } from "d3-shape";
import * as React from "react";
import { useChartState } from "../use-chart-state";
import { AreasState } from "./areas-state";

export const Areas = () => {
  const {
    bounds,
    getX,
    xScale,
    yScale,
    colors,
    series
  } = useChartState() as AreasState;

  const areaGenerator = area<$FixMe>()
    // .defined(d => !isNaN(d))
    .x(d => xScale(getX(d.data)))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]));

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {series.map((d, i) => {
        return (
          <Area
            key={`${d.key}-${i}`}
            path={areaGenerator(d) as string}
            color={colors(d.key)}
          />
        );
      })}
    </g>
  );
};

const Area = React.memo(({ path, color }: { path: string; color: string }) => {
  return <path d={path} fill={color} stroke="none" />;
});

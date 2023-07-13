import { area } from "d3";
import { memo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { useChartState } from "@/charts/shared/chart-state";

export const Areas = () => {
  const { bounds, getX, xScale, yScale, colors, series } =
    useChartState() as AreasState;
  const areaGenerator = area<$FixMe>()
    .defined((d) => d[0] !== null && d[1] !== null)
    .x((d) => xScale(getX(d.data)))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));
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

const Area = memo(function Area({
  path,
  color,
}: {
  path: string;
  color: string;
}) {
  return <path d={path} fill={color} stroke="none" />;
});

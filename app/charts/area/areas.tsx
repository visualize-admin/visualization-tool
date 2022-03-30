import { area } from "d3";
import { memo } from "react";
import { useTheme } from "@/themes";
import { useChartState } from "@/charts/shared/use-chart-state";
import { AreasState } from "@/charts/area/areas-state";

export const Areas = () => {
  const { bounds, getX, xScale, yScale, colors, series, segments } =
    useChartState() as AreasState;
  const theme = useTheme();
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

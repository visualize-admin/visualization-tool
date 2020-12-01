import { area } from "d3";
import { memo } from "react";
import { useTheme } from "../../themes";
import { useChartState } from "../shared/use-chart-state";
import { AreasState } from "./areas-state";

export const Areas = () => {
  const {
    bounds,
    getX,
    xScale,
    yScale,
    colors,
    series,
    segments,
  } = useChartState() as AreasState;
  const theme = useTheme();
  const areaGenerator = area<$FixMe>()
    // .defined(d => !isNaN(d))
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
            color={segments.length > 1 ? colors(d.key) : theme.colors.primary}
          />
        );
      })}
    </g>
  );
};

const Area = memo(({ path, color }: { path: string; color: string }) => {
  return <path d={path} fill={color} stroke="none" />;
});

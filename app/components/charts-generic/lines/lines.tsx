import * as React from "react";
import { useChartState } from "../use-chart-state";
import { line } from "d3-shape";
import { Observation } from "../../../domain";
import { LinesState } from "./lines-state";
import { useTheme } from "../../../themes";

export const Lines = () => {
  const {
    getX,
    xScale,
    getY,
    yScale,
    grouped,
    colors,
    bounds
  } = useChartState() as LinesState;
  const theme = useTheme();

  const lineGenerator = line<Observation>()
    // .defined(d => !isNaN(d))
    .x(d => xScale(getX(d)))
    .y(d => yScale(getY(d)));

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {Array.from(grouped).map((observation, index) => {
        return (
          <Line
            key={index}
            path={lineGenerator(observation[1]) as string}
            color={
              Array.from(grouped).length > 1
                ? colors(observation[0])
                : theme.colors.primary
            }
          />
        );
      })}
    </g>
  );
};

const Line = React.memo(({ path, color }: { path: string; color: string }) => {
  return <path d={path} stroke={color} fill="none" />;
});

import { useChartState } from "../shared/use-chart-state";
import { line } from "d3";
import { Observation } from "../../domain/data";
import { LinesState } from "./lines-state";
import { useTheme } from "../../themes";
import { Fragment, memo } from "react";

export const Lines = () => {
  const {
    getX,
    xScale,
    getY,
    yScale,
    grouped,
    colors,
    bounds,
  } = useChartState() as LinesState;
  const theme = useTheme();

  const lineGenerator = line<Observation>()
    // .defined(d => !isNaN(d))
    .x((d) => xScale(getX(d)))
    .y((d) => yScale(getY(d)));

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {Array.from(grouped).map((observation, index) => {
        return (
          <Fragment key={observation[0]}>
            <Line
              key={index}
              path={lineGenerator(observation[1]) as string}
              color={
                Array.from(grouped).length > 1
                  ? colors(observation[0])
                  : theme.colors.primary
              }
            />
          </Fragment>
        );
      })}
    </g>
  );
};

const Line = memo(({ path, color }: { path: string; color: string }) => {
  return <path d={path} stroke={color} fill="none" />;
});

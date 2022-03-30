import { line } from "d3";
import { Fragment, memo } from "react";
import { Observation } from "@/domain/data";
import { useTheme } from "@/themes";
import { useChartState } from "@/charts/shared/use-chart-state";
import { LinesState } from "@/charts/line/lines-state";

export const Lines = () => {
  const { getX, xScale, getY, yScale, grouped, colors, bounds } =
    useChartState() as LinesState;
  const theme = useTheme();

  const lineGenerator = line<Observation>()
    .defined((d) => getY(d) !== null)
    .x((d) => xScale(getX(d)))
    .y((d) => yScale(getY(d) as number));

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {Array.from(grouped).map((observation, index) => {
        return (
          <Fragment key={observation[0]}>
            <Line
              key={index}
              path={lineGenerator(observation[1]) as string}
              color={colors(observation[0])}
            />
          </Fragment>
        );
      })}
    </g>
  );
};

const Line = memo(function Line({
  path,
  color,
}: {
  path: string;
  color: string;
}) {
  return <path d={path} stroke={color} fill="none" />;
});

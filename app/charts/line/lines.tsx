import { line } from "d3-shape";
import { Fragment, memo } from "react";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { Observation } from "@/domain/data";

export const Lines = () => {
  const { getX, xScale, getY, yScale, grouped, colors, bounds } =
    useChartState() as LinesState;

  const lineGenerator = line<Observation>()
    .defined((d) => {
      const y = getY(d);
      return y !== null && !isNaN(y);
    })
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

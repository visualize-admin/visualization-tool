import { line } from "d3-shape";
import { memo } from "react";

import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { useChartState } from "@/charts/shared/chart-state";
import { Observation } from "@/domain/data";

export const ComboLineDual = () => {
  const { chartData, xScale, getX, yOrientationScales, y, colors, bounds } =
    useChartState() as ComboLineDualState;

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {[y.left, y.right].map(({ orientation, id, getY }) => {
        const pathGenerator = line<Observation>()
          .defined((d) => {
            const y = getY(d);
            return y !== null && !isNaN(y);
          })
          .x((d) => xScale(getX(d)))
          .y((d) => yOrientationScales[orientation](getY(d) as number));

        return (
          <Line
            key={id}
            path={pathGenerator(chartData) as string}
            color={colors(id)}
          />
        );
      })}
    </g>
  );
};

type LineProps = {
  path: string;
  color: string;
};

const Line = memo(function Line(props: LineProps) {
  const { path, color } = props;

  return <path d={path} stroke={color} fill="none" />;
});

import * as d3 from "d3";
import React from "react";

import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { useChartState } from "@/charts/shared/chart-state";
import { Observation } from "@/domain/data";

export const ComboLineDual = () => {
  const { chartData, xScale, getX, yOrientationScales, y, colors, bounds } =
    useChartState() as ComboLineDualState;

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {[y.left, y.right].map(({ orientation, iri, label, getY }) => {
        const line = d3
          .line<Observation>()
          .defined((d) => getY(d) !== null)
          .x((d) => xScale(getX(d)))
          .y((d) => yOrientationScales[orientation](getY(d) as number));

        return (
          <Line
            key={iri}
            path={line(chartData) as string}
            color={colors(label)}
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

const Line = React.memo(function Line(props: LineProps) {
  const { path, color } = props;

  return <path d={path} stroke={color} fill="none" />;
});

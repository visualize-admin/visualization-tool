import * as d3 from "d3";
import React from "react";

import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { useChartState } from "@/charts/shared/chart-state";
import { Observation } from "@/domain/data";

export const ComboLineSingle = () => {
  const { chartData, xScale, getX, yScale, y, colors, bounds } =
    useChartState() as ComboLineSingleState;

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {y.lines.map(({ iri, label, getY }) => {
        const line = d3
          .line<Observation>()
          .defined((d) => getY(d) !== null)
          .x((d) => xScale(getX(d)))
          .y((d) => yScale(getY(d) as number));

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
